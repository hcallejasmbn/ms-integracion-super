import { varchar } from "drizzle-orm/pg-core";
import { superSchema } from "./super.schema";

// Configuración de SUPER: cada proceso agrupa los estados que se informan a la plataforma
export const procesosSuper = superSchema.table("procesos_super", {
  // El código lo asigna quien inserta el proceso; no se autogenera
  codigo: varchar("codigo", { length: 50 }).primaryKey(),
  nombre: varchar("nombre", { length: 150 }).notNull(),
});

export type ProcesoSuperEntity = typeof procesosSuper.$inferSelect;
export type NuevoProcesoSuperEntity = typeof procesosSuper.$inferInsert;
