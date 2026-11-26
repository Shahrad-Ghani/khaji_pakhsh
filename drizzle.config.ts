
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing. Check .env.local");
}

export default defineConfig({
  dialect: "postgresql",

  schema: "./src/db/schema/index.ts",

  out: "./drizzle/migrations",

  dbCredentials: {
    url: databaseUrl,
  },

  schemaFilter: ["public"],
});
