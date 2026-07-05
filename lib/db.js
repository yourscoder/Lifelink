import { Pool } from "pg";

let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_URL?.includes("sslmode=disable")
          ? false
          : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

// Lets the rest of the app write MySQL-style "?" placeholders; we translate
// them to Postgres's "$1, $2, ..." here so call sites didn't need to change.
function toPgPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

export async function query(sql, params = []) {
  const result = await getPool().query(toPgPlaceholders(sql), params);
  return result.rows;
}
