import { Pool } from "pg";

export async function seedProjects(
  pool: Pool,
  orgs: { id: string }[],
  users: { id: string }[]
) {
  const org = orgs[0];
  const [alice, bob] = users;

  const { rows: projects } = await pool.query(
    `INSERT INTO projects (org_id, name, description, status, created_by)
     VALUES
       ($1, 'Website Redesign', 'Redesign the marketing site', 'active', $2),
       ($1, 'API v2', 'Build the next version of the API', 'active', $2)
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [org.id, alice.id]
  );

  if (!projects.length) return;

  const project = projects[0];
  const tasks = [
    { title: "Set up design system", status: "done", priority: "high", assignee: alice.id },
    { title: "Build landing page", status: "in_progress", priority: "high", assignee: bob.id },
    { title: "Write copy", status: "todo", priority: "medium", assignee: null },
    { title: "SEO audit", status: "backlog", priority: "low", assignee: null },
  ];

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    await pool.query(
      `INSERT INTO tasks (project_id, org_id, title, status, priority, assignee_id, position, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT DO NOTHING`,
      [project.id, org.id, t.title, t.status, t.priority, t.assignee, i * 1000, alice.id]
    );
  }
}
