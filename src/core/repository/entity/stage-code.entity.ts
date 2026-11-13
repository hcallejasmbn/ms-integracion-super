import { varchar } from "drizzle-orm/pg-core";
import { superSchema } from "./super.schema";

// Catálogo de STAGE_CODE de SUPER: estados_super.stage_code solo acepta códigos registrados aquí.
// Los valores los ingresa el usuario
export const stageCodes = superSchema.table("stage_codes", {
  // Código interno, por ejemplo "1"; lo asigna quien inserta
  code: varchar("code", { length: 50 }).primaryKey(),
  // Valor que define SUPER, por ejemplo ENTRY
  value: varchar("value", { length: 50 }).notNull().unique(),
});

export type StageCodeEntity = typeof stageCodes.$inferSelect;
export type NuevoStageCodeEntity = typeof stageCodes.$inferInsert;
