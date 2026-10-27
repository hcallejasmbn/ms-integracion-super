import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { EnvConfig } from "@/config/env.config";
import * as schema from "@/core/repository/entity";

export type Database = NodePgDatabase<typeof schema>;

// Se guarda en globalThis para que la recarga en caliente de `next dev` no abra un pool nuevo en cada cambio
const globalForDb = globalThis as unknown as { db?: Database };

export function getDb(): Database {
  globalForDb.db ??= drizzle({ connection: EnvConfig.databaseUrl, schema });
  return globalForDb.db;
}
