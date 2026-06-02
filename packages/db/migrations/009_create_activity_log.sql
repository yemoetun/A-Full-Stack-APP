CREATE TABLE activity_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,    -- 'task' | 'project' | 'member' | 'comment'
  entity_id   UUID NOT NULL,
  action      TEXT NOT NULL,    -- 'created' | 'updated' | 'deleted' | 'assigned' etc.
  metadata    JSONB,            -- { field: 'status', from: 'todo', to: 'done' }
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_org_id     ON activity_log(org_id, created_at DESC);
CREATE INDEX idx_activity_entity     ON activity_log(entity_type, entity_id);
