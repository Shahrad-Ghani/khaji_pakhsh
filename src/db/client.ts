
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import * as tables from "./schema";
import * as relations from "./relations";

// Validate database configuration
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is missing. Check your .env.local file."
  );
}

// Reuse PostgreSQL connection pool during Next.js development
const globalForPg = globalThis as unknown as {
  khajiPgPool?: Pool;
};

const pool =
  globalForPg.khajiPgPool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.khajiPgPool = pool;
}

// Combine tables and relational definitions
const schema = {
  ...tables,
  ...relations,
};

// Initialize Drizzle ORM
export const db = drizzle(pool, {
  schema,
});

export { pool };
