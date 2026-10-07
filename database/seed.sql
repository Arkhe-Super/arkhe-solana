-- este é um arquivo de seed.sql para dados de teste do banco Arkhe
-- deve ser usado apenas para densenvolvimento local

INSERT INTO works (
    uuid,
    blake3_hash,
    c2pa_manifest
)

VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    '{"title": "Obra de teste", "creator": "Arkhe Test"}'
)

INSERT INTO events (
    work_uuid,
    agent_pubkey
)

VALUES (   
    '550e8400-e29b-41d4-a716-446655440000',
    'ArkheAgent1111111111111111111111111111111'
)

INSERT INTO eas_attestations (
    attestation_uid,
    schema_id,
    recipient
)

VALUES( 
    '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    '0x1111111111111111111111111111111111111111'
)
INSERT INTO nodes(
    node_id,
    grpc_endpoint,
)

VALUES(
    'ArkheNode111111111111111111111111111111111',
    'http://localhost:50051'
)