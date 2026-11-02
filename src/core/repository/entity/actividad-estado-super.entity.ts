import { integer } from "drizzle-orm/pg-core";
import { actividades } from "./actividad.entity";
import { estadosSuper } from "./estado-super.entity";
import { superSchema } from "./super.schema";

// Configuración: qué estado de SUPER se informa cuando un expediente pasa por cada actividad.
// Una actividad sin fila aquí no se informa a SUPER
export const actividadesEstadosSuper = superSchema.table("actividades_estados_super", {
  // PK = una actividad informa como máximo un estado SUPER
  actividadId: integer("actividad_id")
    .primaryKey()
    .references(() => actividades.id),
  estadoSuperId: integer("estado_super_id")
    .notNull()
    .references(() => estadosSuper.id),
});

export type ActividadEstadoSuperEntity = typeof actividadesEstadosSuper.$inferSelect;
export type NuevaActividadEstadoSuperEntity = typeof actividadesEstadosSuper.$inferInsert;
