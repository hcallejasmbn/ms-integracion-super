import { index, integer, text } from "drizzle-orm/pg-core";
import { estadosSuper } from "./estado-super.entity";
import { procesos } from "./proceso.entity";
import { superSchema } from "./super.schema";

export const actividades = superSchema.table(
  "actividades",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    nombre: text("nombre").notNull(),
    procesoCodigo: text("proceso_codigo")
      .notNull()
      .references(() => procesos.codigo),
    // Estado SUPER que se informa cuando un expediente pasa por la actividad; null si no informa a SUPER.
    // Único: un estado SUPER pertenece a una sola actividad (1:1)
    estadoSuperId: integer("estado_super_id")
      .unique("actividades_estado_super_id_uq")
      .references(() => estadosSuper.id, { onDelete: "restrict", onUpdate: "cascade" }),
  },
  (table) => [index("actividades_proceso_codigo_idx").on(table.procesoCodigo)],
);

export type ActividadEntity = typeof actividades.$inferSelect;
export type NuevaActividadEntity = typeof actividades.$inferInsert;
