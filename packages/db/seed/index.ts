import { Pool } from "pg";
import { seedUsers } from "./users.seed";
import { seedOrgs } from "./orgs.seed";
import { seedProjects } from "./projects.seed";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log("🌱 Seeding database...");

  const users = await seedUsers(pool);
  console.log(`  ✅ Users: ${users.length}`);

  const orgs = await seedOrgs(pool, users);
  console.log(`  ✅ Orgs: ${orgs.length}`);

  await seedProjects(pool, orgs, users);
  console.log("  ✅ Projects & tasks seeded");

  await pool.end();
  console.log("\n✅ Seeding complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
