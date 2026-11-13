import { integer, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { superSchema } from "./super.schema";

// Solicitud creada en SUPER para cada expediente (relación 1:1)
export const solicitudesSuper = superSchema.table("solicitudes_super", {
  codigoExpediente: varchar("codigo_expediente", { length: 50 }).primaryKey(),
  // ms_application_id que devuelve SUPER al crear la solicitud
  msApplicationId: integer("ms_application_id").notNull().unique(),
  fechaCreacion: timestamp("fecha_creacion", { withTimezone: true }).notNull().defaultNow(),
  // Referencia a log_ejecucion sin FK, para que la trazabilidad no condicione al negocio
  trackId: uuid("track_id"),
});

export type SolicitudSuperEntity = typeof solicitudesSuper.$inferSelect;
export type NuevaSolicitudSuperEntity = typeof solicitudesSuper.$inferInsert;
