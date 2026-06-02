import { Pool } from "pg";

export async function seedOrgs(pool: Pool, users: { id: string }[]) {
  const { rows: orgs } = await pool.query(
    `INSERT INTO orgs (name, slug, plan)
     VALUES ('Acme Corp', 'acme-corp', 'pro')
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id, name, slug`
  );
  const org = orgs[0];

  // Add all seed users as members
  const roles = ["owner", "admin", "member"];
  for (let i = 0; i < users.length; i++) {
    await pool.query(
      `INSERT INTO org_members (org_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (org_id, user_id) DO NOTHING`,
      [org.id, users[i].id, roles[i] || "member"]
    );
  }

  return [org];
}
