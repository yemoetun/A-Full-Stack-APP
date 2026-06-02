import { Pool } from "pg";
import { createHash } from "crypto";

// Dev-only: password is "password123" for all seed users
const PASSWORD_HASH = "$2b$12$ODnWk6Y85Nvj7s8x47YfgeKyAadyrh71BIwUITJ81b3OgFXw7fXtC";

export async function seedUsers(pool: Pool) {
  const users = [
    { email: "alice@example.com", name: "Alice Chen" },
    { email: "bob@example.com", name: "Bob Smith" },
    { email: "carol@example.com", name: "Carol Davis" },
  ];

  const inserted = [];
  for (const user of users) {
    const { rows } = await pool.query(
      `INSERT INTO users (email, name, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id, email, name`,
      [user.email, user.name, PASSWORD_HASH]
    );
    inserted.push(rows[0]);
  }
  return inserted;
}
