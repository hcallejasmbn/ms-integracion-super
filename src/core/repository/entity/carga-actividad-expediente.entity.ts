import { bigint, index, integer, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { superSchema } from "./super.schema";

// Movimientos de actividad de los expedientes, cargados a diario por un procedimiento externo.
// Es solo de entrada: el job la lee y registra los cambios en expedientes_tramitando.
// No tiene FK para que una carga con expedientes o actividades desconocidas no falle
export const cargaActividadesExpedientes = superSchema.table(
  "carga_actividades_expedientes",
  {
    // bigint porque se acumula una carga por día
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    // Se cruza con solicitudes_super; los expedientes sin solicitud en SUPER se ignoran
    codigoExpediente: varchar("codigo_expediente", { length: 50 }).notNull(),
    // Id de actividades; con actividades_estados_super se obtiene el estado SUPER
    actividadId: integer("actividad_id").notNull(),
    // Cuándo entró el expediente a la actividad
    fechaActividad: timestamp("fecha_actividad", { withTimezone: true }).notNull(),
    // Se envía como responsible_id cuando el responsable no es el titular
    responsable: varchar("responsable", { length: 255 }),
    // Se envía como comment de la tarea
    comentario: text("comentario"),
    fechaCarga: timestamp("fecha_carga", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Recargar el mismo movimiento no lo duplica
    unique("carga_actividades_expedientes_movimiento_uq").on(
      table.codigoExpediente,
      table.actividadId,
      table.fechaActividad,
    ),
    // Lectura de la carga del día
    index("carga_actividades_expedientes_fecha_carga_idx").on(table.fechaCarga),
  ],
);

export type CargaActividadExpedienteEntity = typeof cargaActividadesExpedientes.$inferSelect;
export type NuevaCargaActividadExpedienteEntity = typeof cargaActividadesExpedientes.$inferInsert;
