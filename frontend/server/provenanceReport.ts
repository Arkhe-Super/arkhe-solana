export type ProvenanceValidationResult =
  | { success: true; report: ProvenanceReport }
  | { success: false; errors: string[] };

type JsonRecord = Record<string, unknown>;

export type ProvenanceReport = {
  schema_version: '1.1';
  generated_at: string;
  target_a: ProvenanceTarget;
  target_b: ProvenanceTarget;
  similarity: ProvenanceSimilarity;
  anchor?: ProvenanceAnchor;
  c2pa?: ProvenanceC2pa;
  manifest: JsonRecord;
  script_sha256: string;
  content_hash: string;
  envelope_hash?: string;
  trust_policy: 'integrity_only' | 'signer_trusted';
  trust_context: ProvenanceTrustContext;
};

type ProvenanceTarget = {
  title: string;
  artist: string;
  year: number;
  mbid: string;
  isrcs?: string[];
  iswcs?: string[];
  composers?: string[];
  sha256: string;
  acoustid_gate?: boolean;
  creator_did?: string;
};

type ProvenanceAnchor = {
  tx_signature: string;
  mmr_root: string;
  mmr_version: 'aegis-mmr-inclusion-v1';
  mmr_algorithm: 'sha256-asciihex';
  leaf_index: number;
  leaf_count: number;
  peak_index: number;
  peaks: Array<{ height: number; hash: string }>;
  path: Array<{ direction: 'L' | 'R'; sibling_hash: string }>;
  timestamp?: string;
  anchor_commitment?: string;
};

type ProvenanceC2pa = {
  a: ProvenanceC2paEntry;
  b: ProvenanceC2paEntry;
};

type ProvenanceC2paEntry = {
  integrity: string;
  signature: string;
  hard_binding: string;
  trust?: string | null;
};

type ProvenanceTrustContext = {
  verifier: string;
  verifier_version: string;
  trust_basis: string;
  trust_snapshot?: string | null;
};

type ProvenanceSimilarity = {
  clap_cosine?: number | null;
  melodic?: {
    status?: string;
    similarity?: JsonRecord;
    calibration?: ProvenanceCalibration;
  };
};

type ProvenanceCalibration = {
  threshold: number;
  val_scores: Array<{
    label: 'positive' | 'negative';
    score: number;
    pair_id: string;
    sha256_a: string;
    sha256_b: string;
    name?: string;
  }>;
  confidence_alpha?: number;
  max_fpr?: number;
  tau?: number;
  n_negatives?: number;
  tp?: number;
  fp?: number;
  tn?: number;
  fn?: number;
  calibration_valid?: boolean;
  alpha_guaranteed?: boolean;
  decision?: string | null;
};

const HEX64 = /^[0-9a-f]{64}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_TIME_WITH_ZONE = /(?:Z|[+-]\d{2}:\d{2})$/;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: JsonRecord, allowed: string[], path: string, errors: string[]) {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) errors.push(`${path}.${key} is not allowed`);
  }
}

function hasRequiredKeys(value: JsonRecord, required: string[], path: string, errors: string[]) {
  for (const key of required) {
    if (!(key in value)) errors.push(`${path}.${key} is required`);
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isIntegerAtLeast(value: unknown, minimum: number): value is number {
  return Number.isInteger(value) && (value as number) >= minimum;
}

function isHex64(value: unknown): value is string {
  return typeof value === 'string' && HEX64.test(value);
}

function isDateTime(value: unknown): value is string {
  return typeof value === 'string' && DATE_TIME_WITH_ZONE.test(value) && !Number.isNaN(Date.parse(value));
}

function validateStringArray(value: unknown, path: string, errors: string[]) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    errors.push(`${path} must be an array of strings`);
  }
}

function validateTarget(value: unknown, path: string, errors: string[]) {
  if (!isRecord(value)) {
    errors.push(`${path} must be an object`);
    return;
  }
  const optional = ['isrcs', 'iswcs', 'composers', 'acoustid_gate', 'creator_did'];
  hasOnlyKeys(value, ['title', 'artist', 'year', 'mbid', 'sha256', ...optional], path, errors);
  hasRequiredKeys(value, ['title', 'artist', 'year', 'mbid', 'sha256'], path, errors);
  if (typeof value.title !== 'string' || !value.title) errors.push(`${path}.title must be a non-empty string`);
  if (typeof value.artist !== 'string' || !value.artist) errors.push(`${path}.artist must be a non-empty string`);
  if (!isIntegerAtLeast(value.year, 1900) || value.year > 2100) errors.push(`${path}.year must be an integer between 1900 and 2100`);
  if (typeof value.mbid !== 'string' || !UUID.test(value.mbid)) errors.push(`${path}.mbid must be a UUID`);
  if (!isHex64(value.sha256)) errors.push(`${path}.sha256 must be lowercase SHA-256 hex`);
  for (const field of ['isrcs', 'iswcs', 'composers']) {
    if (field in value) validateStringArray(value[field], `${path}.${field}`, errors);
  }
  if ('acoustid_gate' in value && typeof value.acoustid_gate !== 'boolean') errors.push(`${path}.acoustid_gate must be a boolean`);
  if ('creator_did' in value && (typeof value.creator_did !== 'string' || !value.creator_did.startsWith('did:key:z'))) {
    errors.push(`${path}.creator_did must start with did:key:z`);
  }
}

function validateAnchor(value: unknown, errors: string[]) {
  const path = 'anchor';
  if (!isRecord(value)) {
    errors.push(`${path} must be an object`);
    return;
  }
  const required = ['tx_signature', 'mmr_root', 'mmr_version', 'mmr_algorithm', 'leaf_index', 'leaf_count', 'peak_index', 'peaks', 'path'];
  hasOnlyKeys(value, [...required, 'timestamp', 'anchor_commitment'], path, errors);
  hasRequiredKeys(value, required, path, errors);
  if (typeof value.tx_signature !== 'string' || value.tx_signature.length < 86 || value.tx_signature.length > 88) errors.push('anchor.tx_signature must have 86 to 88 characters');
  if (!isHex64(value.mmr_root)) errors.push('anchor.mmr_root must be lowercase SHA-256 hex');
  if (value.mmr_version !== 'aegis-mmr-inclusion-v1') errors.push('anchor.mmr_version is invalid');
  if (value.mmr_algorithm !== 'sha256-asciihex') errors.push('anchor.mmr_algorithm is invalid');
  for (const field of ['leaf_index', 'peak_index']) if (!isIntegerAtLeast(value[field], 0)) errors.push(`anchor.${field} must be a non-negative integer`);
  if (!isIntegerAtLeast(value.leaf_count, 1)) errors.push('anchor.leaf_count must be an integer >= 1');
  if (!Array.isArray(value.peaks) || value.peaks.length < 1) errors.push('anchor.peaks must be a non-empty array');
  else value.peaks.forEach((peak, index) => {
    if (!isRecord(peak) || !isIntegerAtLeast(peak.height, 0) || !isHex64(peak.hash)) errors.push(`anchor.peaks[${index}] is invalid`);
    else hasOnlyKeys(peak, ['height', 'hash'], `anchor.peaks[${index}]`, errors);
  });
  if (!Array.isArray(value.path)) errors.push('anchor.path must be an array');
  else value.path.forEach((step, index) => {
    if (!isRecord(step) || (step.direction !== 'L' && step.direction !== 'R') || !isHex64(step.sibling_hash)) errors.push(`anchor.path[${index}] is invalid`);
    else hasOnlyKeys(step, ['direction', 'sibling_hash'], `anchor.path[${index}]`, errors);
  });
  if ('timestamp' in value && !isDateTime(value.timestamp)) errors.push('anchor.timestamp must be a date-time with timezone');
  if ('anchor_commitment' in value && typeof value.anchor_commitment !== 'string') errors.push('anchor.anchor_commitment must be a string');
}

function validateC2pa(value: unknown, errors: string[]) {
  if (!isRecord(value)) {
    errors.push('c2pa must be an object');
    return;
  }
  hasOnlyKeys(value, ['a', 'b'], 'c2pa', errors);
  hasRequiredKeys(value, ['a', 'b'], 'c2pa', errors);
  for (const side of ['a', 'b']) {
    const entry = value[side];
    if (!isRecord(entry)) {
      errors.push(`c2pa.${side} must be an object`);
      continue;
    }
    hasOnlyKeys(entry, ['integrity', 'signature', 'hard_binding', 'trust'], `c2pa.${side}`, errors);
    hasRequiredKeys(entry, ['integrity', 'signature', 'hard_binding'], `c2pa.${side}`, errors);
    for (const field of ['integrity', 'signature', 'hard_binding']) if (typeof entry[field] !== 'string') errors.push(`c2pa.${side}.${field} must be a string`);
    if ('trust' in entry && entry.trust !== null && typeof entry.trust !== 'string') errors.push(`c2pa.${side}.trust must be a string or null`);
  }
}

function validateCalibration(value: unknown, errors: string[]) {
  if (!isRecord(value)) {
    errors.push('similarity.melodic.calibration must be an object');
    return;
  }
  const required = ['threshold', 'val_scores'];
  const optional = ['confidence_alpha', 'max_fpr', 'tau', 'n_negatives', 'tp', 'fp', 'tn', 'fn', 'calibration_valid', 'alpha_guaranteed', 'decision'];
  hasOnlyKeys(value, [...required, ...optional], 'similarity.melodic.calibration', errors);
  hasRequiredKeys(value, required, 'similarity.melodic.calibration', errors);
  for (const field of ['threshold', 'tau']) if (field in value && (!isFiniteNumber(value[field]) || value[field] < 0 || value[field] > 1)) errors.push(`similarity.melodic.calibration.${field} must be between 0 and 1`);
  for (const field of ['confidence_alpha', 'max_fpr']) if (field in value && (!isFiniteNumber(value[field]) || value[field] <= 0 || value[field] >= 1)) errors.push(`similarity.melodic.calibration.${field} must be between 0 and 1 exclusively`);
  for (const field of ['n_negatives', 'tp', 'fp', 'tn', 'fn']) if (field in value && !isIntegerAtLeast(value[field], 0)) errors.push(`similarity.melodic.calibration.${field} must be a non-negative integer`);
  for (const field of ['calibration_valid', 'alpha_guaranteed']) if (field in value && typeof value[field] !== 'boolean') errors.push(`similarity.melodic.calibration.${field} must be a boolean`);
  if ('decision' in value && value.decision !== null && typeof value.decision !== 'string') errors.push('similarity.melodic.calibration.decision must be a string or null');
  if (!Array.isArray(value.val_scores)) {
    errors.push('similarity.melodic.calibration.val_scores must be an array');
    return;
  }
  value.val_scores.forEach((item, index) => {
    const path = `similarity.melodic.calibration.val_scores[${index}]`;
    if (!isRecord(item)) {
      errors.push(`${path} must be an object`);
      return;
    }
    hasOnlyKeys(item, ['label', 'score', 'pair_id', 'sha256_a', 'sha256_b', 'name'], path, errors);
    hasRequiredKeys(item, ['label', 'score', 'pair_id', 'sha256_a', 'sha256_b'], path, errors);
    if (item.label !== 'positive' && item.label !== 'negative') errors.push(`${path}.label is invalid`);
    if (!isFiniteNumber(item.score) || item.score < 0 || item.score > 1) errors.push(`${path}.score must be between 0 and 1`);
    for (const field of ['pair_id', 'sha256_a', 'sha256_b']) if (!isHex64(item[field])) errors.push(`${path}.${field} must be lowercase SHA-256 hex`);
    if ('name' in item && typeof item.name !== 'string') errors.push(`${path}.name must be a string`);
  });
}

function validateSimilarity(value: unknown, errors: string[]) {
  if (!isRecord(value)) {
    errors.push('similarity must be an object');
    return;
  }
  hasOnlyKeys(value, ['clap_cosine', 'melodic'], 'similarity', errors);
  if ('clap_cosine' in value && value.clap_cosine !== null && (!isFiniteNumber(value.clap_cosine) || value.clap_cosine < 0 || value.clap_cosine > 1)) errors.push('similarity.clap_cosine must be between 0 and 1 or null');
  if ('melodic' in value) {
    const melodic = value.melodic;
    if (!isRecord(melodic)) errors.push('similarity.melodic must be an object');
    else {
      hasOnlyKeys(melodic, ['status', 'similarity', 'calibration'], 'similarity.melodic', errors);
      if ('status' in melodic && typeof melodic.status !== 'string') errors.push('similarity.melodic.status must be a string');
      if ('similarity' in melodic && !isRecord(melodic.similarity)) errors.push('similarity.melodic.similarity must be an object');
      if ('calibration' in melodic) validateCalibration(melodic.calibration, errors);
    }
  }
}

function validateTrustContext(value: unknown, policy: unknown, errors: string[]) {
  if (!isRecord(value)) {
    errors.push('trust_context must be an object');
    return;
  }
  hasOnlyKeys(value, ['verifier', 'verifier_version', 'trust_basis', 'trust_snapshot'], 'trust_context', errors);
  hasRequiredKeys(value, ['verifier', 'verifier_version', 'trust_basis'], 'trust_context', errors);
  for (const field of ['verifier', 'verifier_version', 'trust_basis']) if (typeof value[field] !== 'string') errors.push(`trust_context.${field} must be a string`);
  if ('trust_snapshot' in value && value.trust_snapshot !== null && typeof value.trust_snapshot !== 'string') errors.push('trust_context.trust_snapshot must be a string or null');
  if (policy === 'signer_trusted' && (value.trust_basis !== 'bundled_static_material' || value.trust_snapshot !== null)) errors.push('signer_trusted requires bundled_static_material and a null trust_snapshot');
}

/**
 * Structural validation compatible with analise/arkhe_report.schema.json v1.1.
 * It deliberately does not verify C2PA, Solana, MMR, authorship, or provenance.
 */
export function validateProvenanceReport(value: unknown): ProvenanceValidationResult {
  const errors: string[] = [];
  if (!isRecord(value)) return { success: false, errors: ['report must be an object'] };

  const required = ['schema_version', 'generated_at', 'target_a', 'target_b', 'similarity', 'manifest', 'script_sha256', 'content_hash', 'trust_policy', 'trust_context'];
  const optional = ['anchor', 'c2pa', 'envelope_hash'];
  hasOnlyKeys(value, [...required, ...optional], 'report', errors);
  hasRequiredKeys(value, required, 'report', errors);
  if (value.schema_version !== '1.1') errors.push('schema_version must be 1.1');
  if (!isDateTime(value.generated_at)) errors.push('generated_at must be a date-time with timezone');
  validateTarget(value.target_a, 'target_a', errors);
  validateTarget(value.target_b, 'target_b', errors);
  validateSimilarity(value.similarity, errors);
  if (!isRecord(value.manifest)) errors.push('manifest must be an object');
  for (const field of ['script_sha256', 'content_hash']) if (!isHex64(value[field])) errors.push(`${field} must be lowercase SHA-256 hex`);
  if ('envelope_hash' in value && !isHex64(value.envelope_hash)) errors.push('envelope_hash must be lowercase SHA-256 hex');
  if (value.trust_policy !== 'integrity_only' && value.trust_policy !== 'signer_trusted') errors.push('trust_policy is invalid');
  validateTrustContext(value.trust_context, value.trust_policy, errors);
  if ('anchor' in value) validateAnchor(value.anchor, errors);
  if ('c2pa' in value) validateC2pa(value.c2pa, errors);

  return errors.length ? { success: false, errors } : { success: true, report: value as ProvenanceReport };
}
