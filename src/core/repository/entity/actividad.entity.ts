import { index, integer, text } from "drizzle-orm/pg-core";
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
  },
  (table) => [index("actividades_proceso_codigo_idx").on(table.procesoCodigo)],
);

export type ActividadEntity = typeof actividades.$inferSelect;
export type NuevaActividadEntity = typeof actividades.$inferInsert;
