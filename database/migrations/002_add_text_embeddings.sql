CREATE TABLE work_text_embeddings (
    id BIGSERIAL PRIMARY KEY,
    work_uuid UUID NOT NULL REFERENCES works(uuid),
    content_text TEXT NOT NULL,
    embedding VECTOR(1024) NOT NULL,
    model VARCHAR(100) NOT NULL DEFAULT 'BAAI/bge-m3',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_work_text_embeddings_embedding
ON work_text_embeddings
USING hnsw (embedding vector_cosine_ops);

CREATE INDEX idx_work_text_embeddings_work_uuid
ON work_text_embeddings (work_uuid);