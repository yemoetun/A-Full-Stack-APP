#!/usr/bin/env node
/**
 * Simple sequential migration runner.
 * Runs all SQL files in /migrations in order, skipping already-applied ones.
 */
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // Create migrations tracking table if it doesn't exist
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         SERIAL PRIMARY KEY,
      filename   TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrationsDir = path.join(__dirname, "../migrations");
  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const { rows: applied } = await client.query("SELECT filename FROM _migrations");
  const appliedSet = new Set(applied.map((r) => r.filename));

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`  ✓ ${file} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO _migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`  ✅ ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`  ❌ ${file} failed:`, err.message);
      process.exit(1);
    }
  }

  await client.end();
  console.log("\n✅ All migrations applied.");
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
