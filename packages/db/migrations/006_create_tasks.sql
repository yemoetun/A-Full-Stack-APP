CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'in_review', 'done');
CREATE TYPE task_priority AS ENUM ('none', 'low', 'medium', 'high', 'urgent');

CREATE TABLE tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  status      task_status NOT NULL DEFAULT 'backlog',
  priority    task_priority NOT NULL DEFAULT 'none',
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date    DATE,
  position    FLOAT NOT NULL DEFAULT 0,  -- for drag-and-drop ordering
  created_by  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- org_id on every index to support tenant-scoped queries
CREATE INDEX idx_tasks_org_id         ON tasks(org_id);
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_assignee       ON tasks(org_id, assignee_id);
CREATE INDEX idx_tasks_due_date       ON tasks(org_id, due_date) WHERE due_date IS NOT NULL;

-- Full-text search on title + description
CREATE INDEX idx_tasks_fts ON tasks USING GIN (
  to_tsvector('english', title || ' ' || COALESCE(description, ''))
);

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
