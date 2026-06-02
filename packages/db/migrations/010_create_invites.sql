CREATE TABLE invites (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        org_role NOT NULL DEFAULT 'member',
  token       TEXT NOT NULL UNIQUE,  -- secure random token (hashed in DB)
  invited_by  UUID NOT NULL REFERENCES users(id),
  expires_at  TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invites_token  ON invites(token);
CREATE INDEX idx_invites_org_id ON invites(org_id);
CREATE INDEX idx_invites_email  ON invites(email);
