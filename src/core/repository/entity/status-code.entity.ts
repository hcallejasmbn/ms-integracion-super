import { varchar } from "drizzle-orm/pg-core";
import { superSchema } from "./super.schema";

// Catálogo de STATUS_CODE de SUPER: estados_super.status_code solo acepta códigos registrados aquí.
// Los valores los ingresa el usuario
export const statusCodes = superSchema.table("status_codes", {
  // Código interno, por ejemplo "1"; lo asigna quien inserta
  code: varchar("code", { length: 50 }).primaryKey(),
  // Valor que define SUPER, por ejemplo ENTERED
  value: varchar("value", { length: 50 }).notNull().unique(),
});

export type StatusCodeEntity = typeof statusCodes.$inferSelect;
export type NuevoStatusCodeEntity = typeof statusCodes.$inferInsert;
