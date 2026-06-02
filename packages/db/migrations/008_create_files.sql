CREATE TABLE files (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  task_id     UUID REFERENCES tasks(id) ON DELETE SET NULL,
  uploader_id UUID NOT NULL REFERENCES users(id),
  filename    TEXT NOT NULL,
  storage_key TEXT NOT NULL UNIQUE,  -- R2 object key
  size        BIGINT NOT NULL,       -- bytes
  mime_type   TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_files_org_id  ON files(org_id);
CREATE INDEX idx_files_task_id ON files(task_id);
