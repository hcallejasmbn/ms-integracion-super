import { desc, sql } from "drizzle-orm";
import { index, integer, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { actividades } from "./actividad.entity";
import { estadosSuper } from "./estado-super.entity";
import { solicitudesSuper } from "./solicitud-super.entity";
import { superSchema } from "./super.schema";

// Historial de cambios de actividad de cada expediente y si ya se informaron a SUPER.
// Solo se inserta cuando la actividad del expediente cambió
export const expedientesTramitando = superSchema.table(
  "expedientes_tramitando",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    codigoExpediente: varchar("codigo_expediente", { length: 50 })
      .notNull()
      .references(() => solicitudesSuper.codigoExpediente),
    actividadId: integer("actividad_id")
      .notNull()
      .references(() => actividades.id),
    // Estado SUPER que correspondía a la actividad al momento del cambio
    estadoSuperId: integer("estado_super_id")
      .notNull()
      .references(() => estadosSuper.id),
    // Cuándo ocurrió el cambio en el sistema externo
    fechaActividad: timestamp("fecha_actividad", { withTimezone: true }).notNull(),
    fechaInsercion: timestamp("fecha_insercion", { withTimezone: true }).notNull().defaultNow(),
    // PENDIENTE, NOTIFICADO, ERROR u OMITIDO
    estadoNotificacion: varchar("estado_notificacion", { length: 20 }).notNull().default("PENDIENTE"),
    // Cuándo SUPER aceptó el cambio
    fechaNotificacion: timestamp("fecha_notificacion", { withTimezone: true }),
    // Referencia a log_ejecucion sin FK, para que la trazabilidad no condicione al negocio
    trackId: uuid("track_id"),
  },
  (table) => [
    // Evita registrar dos veces el mismo cambio si la carga se ejecuta más de una vez
    unique("expedientes_tramitando_cambio_uq").on(table.codigoExpediente, table.actividadId, table.fechaActividad),
    // Último cambio de cada expediente
    index("expedientes_tramitando_ultimo_idx").on(table.codigoExpediente, desc(table.fechaActividad)),
    // Cambios por notificar, en orden
    index("expedientes_tramitando_pendientes_idx")
      .on(table.fechaActividad)
      .where(sql`${table.estadoNotificacion} in ('PENDIENTE', 'ERROR')`),
  ],
);

export type ExpedienteTramitandoEntity = typeof expedientesTramitando.$inferSelect;
export type NuevoExpedienteTramitandoEntity = typeof expedientesTramitando.$inferInsert;
