CREATE TABLE provenance_reports (
    id UUID PRIMARY KEY,
    schema_version VARCHAR(16) NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    report JSONB NOT NULL,
    verification_status VARCHAR(32) NOT NULL
        CHECK (verification_status IN ('structurally_valid', 'cryptographically_verified')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_provenance_reports_content_hash
ON provenance_reports (content_hash);
