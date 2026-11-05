import { bigint, index, integer, jsonb, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { superSchema } from "./super.schema";

// Trazabilidad de las llamadas a SUPER: una fila por llamada HTTP. Los intentos de una misma
// operación comparten track_id, que las tablas de negocio guardan sin FK
export const logEjecucion = superSchema.table(
  "log_ejecucion",
  {
    // bigint porque es la tabla que más crece
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    trackId: uuid("track_id").notNull(),
    // OBTENER_TOKEN, CREAR_SOLICITUD, ACTUALIZAR_SOLICITUD
    operacion: varchar("operacion", { length: 50 }).notNull(),
    intento: integer("intento").notNull().default(1),
    url: varchar("url", { length: 500 }).notNull(),
    metodo: varchar("metodo", { length: 10 }).notNull(),
    // Sin api_key ni token: se enmascaran antes de guardar
    requestJson: jsonb("request_json"),
    // Null si no hubo respuesta (timeout, error de red)
    responseStatus: integer("response_status"),
    // Text y no jsonb: ante un 5xx SUPER puede responder HTML o vacío
    responseBody: text("response_body"),
    // Excepción cuando no hubo respuesta HTTP
    error: text("error"),
    // OK o ERROR
    resultado: varchar("resultado", { length: 10 }).notNull(),
    fechaInicio: timestamp("fecha_inicio", { withTimezone: true }).notNull().defaultNow(),
    duracionMs: integer("duracion_ms"),
  },
  (table) => [index("log_ejecucion_track_id_idx").on(table.trackId)],
);

export type LogEjecucionEntity = typeof logEjecucion.$inferSelect;
export type NuevoLogEjecucionEntity = typeof logEjecucion.$inferInsert;
