CREATE TYPE org_role AS ENUM ('owner', 'admin', 'member', 'viewer');

CREATE TABLE org_members (
  org_id    UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role      org_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

CREATE INDEX idx_org_members_user_id ON org_members(user_id);
CREATE INDEX idx_org_members_org_id  ON org_members(org_id);
