import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// drizzle-kit corre fuera de Next.js, así que carga el .env igual que lo haría Next
loadEnvConfig(process.cwd());

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/core/repository/entity/index.ts",
  // Historial de migraciones: un .sql por cambio, versionado en git
  out: "./drizzle",
  // Solo se administra el esquema "super"; ahí también queda la tabla __drizzle_migrations
  schemaFilter: ["super"],
  migrations: {
    schema: "super",
  },
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
