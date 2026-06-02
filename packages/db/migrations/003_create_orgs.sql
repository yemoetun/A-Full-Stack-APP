CREATE TYPE org_plan AS ENUM ('free', 'pro', 'enterprise');

CREATE TABLE orgs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  plan       org_plan NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orgs_slug ON orgs(slug);

CREATE TRIGGER orgs_updated_at
  BEFORE UPDATE ON orgs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
