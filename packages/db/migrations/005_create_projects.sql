CREATE TYPE project_status AS ENUM ('active', 'archived', 'completed');

CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  status      project_status NOT NULL DEFAULT 'active',
  created_by  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Every query MUST include org_id — this is how tenant isolation is enforced
CREATE INDEX idx_projects_org_id ON projects(org_id);
CREATE INDEX idx_projects_org_status ON projects(org_id, status);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
