CREATE TABLE works (
    uuid UUID PRIMARY KEY,
    blake3_hash VARCHAR(64) UNIQUE,
    c2pa_manifest JSONB NOT NULL
);

CREATE TABLE events(
    event_id BIGSERIAL PRIMARY KEY,
    work_uuid UUID REFERENCES works(uuid),
    agent_pubkey VARCHAR(44)
);

CREATE INDEX idx_events_agent_pubkey
ON events(agent_pubkey);

CREATE TABLE eas_attestations (
    attestation_uid VARCHAR(66) PRIMARY KEY,
    schema_id VARCHAR(66) NOT NULL,
    recipient VARCHAR(42)
);

CREATE TABLE nodes (
    node_id VARCHAR(44) PRIMARY KEY,
    grpc_endpoint VARCHAR(255) NOT NULL,
    last_heartbeat TIMESTAMP DEFAULT NOW()
);