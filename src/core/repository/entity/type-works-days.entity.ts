import { varchar } from "drizzle-orm/pg-core";
import { superSchema } from "./super.schema";

// Catálogo de USE_WORKING_DAYS de SUPER: estados_super.use_working_days solo acepta códigos registrados aquí
export const typeWorksDays = superSchema.table("type_works_days", {
  // Valor que se envía a SUPER, por ejemplo DÍAS HÁBILES
  code: varchar("code", { length: 50 }).primaryKey(),
  descripcion: varchar("descripcion", { length: 255 }).notNull(),
});

export type TypeWorksDaysEntity = typeof typeWorksDays.$inferSelect;
export type NuevoTypeWorksDaysEntity = typeof typeWorksDays.$inferInsert;
