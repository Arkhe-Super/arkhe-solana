#!/usr/bin/env python3
"""
backend_report_endpoint.py — Endpoint de relatórios Arkhe.

Contrato (v2):
  - GET /v1/reports/{report_id}
  - Validação estrutural via JSON Schema + FormatChecker
  - Verificação de content_hash e envelope_hash (parity com v23)
  - verifier_sha256 binding ao preflight configurado
  - Attestation dependente do nível (schema/sanity/release)
  - Cache-Control condicional à imutabilidade e visibilidade
  - ETag = SHA256(bytes da representação servida)

DEPENDÊNCIAS:
  pip install jsonschema[format] rfc8785
"""

import hashlib
import json
import uuid as _uuid
import os
from pathlib import Path
from typing import Optional, Tuple

import rfc8785

try:
    from jsonschema import Draft202012Validator, FormatChecker
except ImportError:
    raise SystemExit("pip install jsonschema[format]")


# ────────────────────────────────────────────────────────────
# Constantes
# ────────────────────────────────────────────────────────────

SCHEMA_PATH = Path("docs/contracts/arkhe_report.schema.json")
SCHEMA = json.loads(SCHEMA_PATH.read_text())

VALIDATOR = Draft202012Validator(SCHEMA, format_checker=FormatChecker())

# Caminho do preflight configurado (não __file__ do backend)
PREFLIGHT_PATH = Path(
    os.environ.get(
        "ARKHE_PREFLIGHT_PATH",
        "scripts/arkhe_preflight_v23.py",
    )
)

# Campos cobertos pelo content_hash — parity com v23
CONTENT_COVERED_FIELDS = [
    "schema_version",
    "generated_at",
    "target_a",
    "target_b",
    "similarity",
    "manifest",
    "script_sha256",
    "trust_policy",
    "trust_context",
]

VALID_VERIFICATION_LEVELS = {
    "schema_valid",
    "sanity_valid",
    "release_verified",
}


# ────────────────────────────────────────────────────────────
# Primitivas de hash — parity com v23
# ────────────────────────────────────────────────────────────

def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def recompute_content_hash(report: dict) -> str:
    """Recomputa content_hash sobre campos cobertos (RFC 8785)."""
    covered = {}
    for k in CONTENT_COVERED_FIELDS:
        if k not in report or report[k] is None:
            raise ValueError(f"campo coberto ausente: {k}")
        covered[k] = report[k]
    return hashlib.sha256(rfc8785.dumps(covered)).hexdigest()


def recompute_envelope_hash(report: dict) -> str:
    """
    Recomputa envelope_hash com parity literal ao v23.

    CORRIGIDO (P0-2): as chaves são sempre incluídas, com None quando
    aplicável. Não omitir campos None — {c2pa: null} ≠ {}.
    """
    envelope = {
        "content_hash": report["content_hash"],
        "anchor": report.get("anchor"),
        "c2pa": report.get("c2pa"),
        "trust_policy": report["trust_policy"],
        "trust_context": report["trust_context"],
    }
    return hashlib.sha256(rfc8785.dumps(envelope)).hexdigest()


def representation_hash(report: dict) -> Tuple[str, bytes]:
    """
    Representação canónica do relatório (RFC 8785) + hash dos bytes
    exatos que serão servidos.

    O ETag corresponde exatamente aos bytes servidos.
    """
    body_bytes = rfc8785.dumps(report)
    etag_hash = hashlib.sha256(body_bytes).hexdigest()
    return etag_hash, body_bytes


# ────────────────────────────────────────────────────────────
# Attestation por nível (P1)
# ────────────────────────────────────────────────────────────

def validate_attestation(record: dict, level: str) -> None:
    """
    Valida que o registo de verificação tem os campos obrigatórios
    para o nível reivindicado.

    P1: os requisitos são dependentes do nível.
    """
    if level not in VALID_VERIFICATION_LEVELS:
        raise ValueError(f"verification_level inválido: {level}")

    if level == "schema_valid":
        return  # sem attestation persistida

    if level == "sanity_valid":
        required = {"report_id", "content_hash", "verifier_sha256", "verified_at"}
        missing = required - set(record.keys())
        if missing:
            raise ValueError(f"attestation sanity incompleta: {missing}")
        return

    if level == "release_verified":
        required = {
            "report_id", "content_hash", "envelope_hash",
            "verifier_version", "verifier_sha256",
            "trust_policy", "verified_at",
        }
        missing = required - set(record.keys())
        if missing:
            raise ValueError(f"attestation release incompleta: {missing}")
        return


def determine_verification_level(
    report: dict,
    record: Optional[dict],
) -> str:
    """
    Determina o nível de verificação efetivo.

    Invariantes:
      - content_hash: declared == recomputed == verified
      - envelope_hash (release): declared == recomputed == verified
      - verifier_sha256: record == SHA256(preflight configurado)

    Se qualquer verificação falhar, o nível é rebaixado para schema_valid.
    """
    if record is None:
        return "schema_valid"

    # Determinar o nível reivindicado
    claimed_level = record.get("verification_level")
    if claimed_level not in VALID_VERIFICATION_LEVELS:
        return "schema_valid"

    try:
        validate_attestation(record, claimed_level)
    except ValueError:
        return "schema_valid"

    # Verificar content_hash
    try:
        current_content = recompute_content_hash(report)
    except ValueError:
        return "schema_valid"

    if record.get("content_hash") != current_content:
        return "schema_valid"
    if report.get("content_hash") != current_content:
        return "schema_valid"

    # Verificar verifier_sha256 contra o preflight configurado
    try:
        configured_preflight_hash = sha256_file(PREFLIGHT_PATH)
    except OSError:
        return "schema_valid"

    if record.get("verifier_sha256") != configured_preflight_hash:
        return "schema_valid"

    # Para release_verified: exigir envelope_hash presente e coincidente
    if claimed_level == "release_verified":
        declared_envelope = report.get("envelope_hash")
        if not declared_envelope:
            return "schema_valid"

        try:
            current_envelope = recompute_envelope_hash(report)
        except (ValueError, KeyError):
            return "schema_valid"

        if declared_envelope != current_envelope:
            return "schema_valid"
        if record.get("envelope_hash") != declared_envelope:
            return "schema_valid"

    return claimed_level


# ────────────────────────────────────────────────────────────
# Cache headers (P1 — condicional)
# ────────────────────────────────────────────────────────────

def build_cache_headers(
    visibility: str = "private",
    immutable_resource: bool = False,
) -> dict:
    """
    Cache-Control condicional à imutabilidade e visibilidade.

    P1: immutable_resource é um parâmetro explícito, não uma suposição.
    Deve vir de uma garantia do storage/modelo (report_id append-only).
    """
    if visibility == "sensitive":
        return {"Cache-Control": "no-store"}

    scope = "public" if visibility == "public" else "private"

    if immutable_resource:
        max_age = 31536000 if visibility == "public" else 3600
        return {
            "Cache-Control": f"{scope}, max-age={max_age}, immutable",
        }

    return {
        "Cache-Control": f"{scope}, max-age=0, must-revalidate",
    }


def build_response_headers(
    report: dict,
    verification_level: str,
    etag: str,
    visibility: str = "private",
    immutable_resource: bool = False,
) -> dict:
    """Constrói todos os headers da resposta 200."""
    headers = {
        "Content-Type": "application/json",
        "X-Arkhe-Schema-Version": "1.1",
        "X-Arkhe-Verification-Level": verification_level,
        "X-Arkhe-Content-Hash": report.get("content_hash", ""),
        "ETag": f'"{etag}"',
    }
    if report.get("envelope_hash"):
        headers["X-Arkhe-Envelope-Hash"] = report["envelope_hash"]
    headers.update(build_cache_headers(visibility, immutable_resource))
    return headers


# ────────────────────────────────────────────────────────────
# Handler principal
# ────────────────────────────────────────────────────────────

def get_report(
    report_id: str,
    db,
    visibility: str = "private",
    immutable_resource: bool = False,
) -> Tuple[Optional[bytes], int, dict]:
    """
    GET /v1/reports/{report_id}

    Retorna:
      - (body_bytes, status_code, headers)
    """
    # 1. Validação do report_id (UUID)
    try:
        _uuid.UUID(report_id)
    except ValueError:
        return (
            json.dumps({"error": "invalid_report_id"}).encode(),
            400,
            {"Content-Type": "application/json"},
        )

    # 2. Buscar no DB
    report = db.fetch_report(report_id)
    if report is None:
        return (
            json.dumps({"error": "report_not_found"}).encode(),
            404,
            {"Content-Type": "application/json"},
        )

    # 3. Validar schema + formatos
    errors = sorted(VALIDATOR.iter_errors(report), key=lambda e: e.path)
    if errors:
        detail = [
            {
                "path": "/" + "/".join(str(p) for p in e.path),
                "message": e.message,
            }
            for e in errors
        ]
        return (
            json.dumps({
                "error": "stored_report_invalid",
                "report_id": report_id,
                "detail": detail,
            }).encode(),
            500,
            {"Content-Type": "application/json"},
        )

    # 4. Recomputar content_hash
    try:
        computed_content = recompute_content_hash(report)
    except ValueError as e:
        return (
            json.dumps({
                "error": "stored_report_invalid",
                "detail": str(e),
            }).encode(),
            500,
            {"Content-Type": "application/json"},
        )

    if computed_content != report.get("content_hash"):
        return (
            json.dumps({
                "error": "stored_report_invalid",
                "detail": (
                    f"content_hash mismatch: "
                    f"computed={computed_content} "
                    f"stored={report.get('content_hash')}"
                ),
            }).encode(),
            500,
            {"Content-Type": "application/json"},
        )

    # 5. Recomputar envelope_hash (se presente)
    if report.get("envelope_hash"):
        try:
            computed_envelope = recompute_envelope_hash(report)
        except (ValueError, KeyError) as e:
            return (
                json.dumps({
                    "error": "stored_report_invalid",
                    "detail": f"envelope_hash recompute: {e}",
                }).encode(),
                500,
                {"Content-Type": "application/json"},
            )

        if computed_envelope != report["envelope_hash"]:
            return (
                json.dumps({
                    "error": "stored_report_invalid",
                    "detail": (
                        f"envelope_hash mismatch: "
                        f"computed={computed_envelope} "
                        f"stored={report['envelope_hash']}"
                    ),
                }).encode(),
                500,
                {"Content-Type": "application/json"},
            )

    # 6. Determinar nível de verificação
    record = db.fetch_verification(report_id)
    verification_level = determine_verification_level(report, record)

    # 7. Representação canónica + ETag
    etag, body_bytes = representation_hash(report)

    # 8. Headers
    headers = build_response_headers(
        report, verification_level, etag,
        visibility, immutable_resource,
    )

    return body_bytes, 200, headers
