import { text } from "drizzle-orm/pg-core";
import { superSchema } from "./super.schema";

export const procesos = superSchema.table("procesos", {
  // El código lo asigna quien inserta el proceso; no se autogenera
  codigo: text("codigo").primaryKey(),
  nombre: text("nombre").notNull(),
});

export type ProcesoEntity = typeof procesos.$inferSelect;
export type NuevoProcesoEntity = typeof procesos.$inferInsert;
