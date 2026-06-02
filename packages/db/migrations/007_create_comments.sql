CREATE TABLE comments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id    UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  org_id     UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_org_id  ON comments(org_id);

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
