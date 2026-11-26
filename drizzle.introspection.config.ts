
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing. Check .env.local");
}

export default defineConfig({
  dialect: "postgresql",

  out: "./drizzle/introspection",

  dbCredentials: {
    url: databaseUrl,
  },

  schemaFilter: ["public"],

  introspect: {
    casing: "camel",
  },
});