import { varchar } from "drizzle-orm/pg-core";
import { superSchema } from "./super.schema";

// Catálogo de RESPONSIBLE_TYPE de SUPER: estados_super.responsible_type solo acepta códigos registrados aquí
export const typeResponsible = superSchema.table("type_responsible", {
  // Valor que se envía a SUPER, por ejemplo TITULAR
  code: varchar("code", { length: 50 }).primaryKey(),
  descripcion: varchar("descripcion", { length: 255 }).notNull(),
});

export type TypeResponsibleEntity = typeof typeResponsible.$inferSelect;
export type NuevoTypeResponsibleEntity = typeof typeResponsible.$inferInsert;
