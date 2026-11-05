import { relations } from "drizzle-orm";
import { actividades } from "./actividad.entity";
import { estadosSuper } from "./estado-super.entity";
import { expedientesTramitando } from "./expediente-tramitando.entity";
import { procesos } from "./proceso.entity";
import { procesosSuper } from "./proceso-super.entity";
import { solicitudesSuper } from "./solicitud-super.entity";
import { stageCodes } from "./stage-code.entity";
import { statusCodes } from "./status-code.entity";

// Las relaciones van aparte para que las entidades no se importen entre sí en ambos sentidos
export const procesosRelations = relations(procesos, ({ many }) => ({
  actividades: many(actividades),
}));

export const actividadesRelations = relations(actividades, ({ one }) => ({
  proceso: one(procesos, {
    fields: [actividades.procesoCodigo],
    references: [procesos.codigo],
  }),
  estadoSuper: one(estadosSuper, {
    fields: [actividades.estadoSuperId],
    references: [estadosSuper.id],
  }),
}));

export const procesosSuperRelations = relations(procesosSuper, ({ many }) => ({
  estados: many(estadosSuper),
}));

export const estadosSuperRelations = relations(estadosSuper, ({ one }) => ({
  // Sin fields: la FK está en actividades.estado_super_id
  actividad: one(actividades),
  procesoSuper: one(procesosSuper, {
    fields: [estadosSuper.procesoSuperCodigo],
    references: [procesosSuper.codigo],
  }),
  // "Info" porque stageCode y statusCode ya son los nombres de las columnas
  stageCodeInfo: one(stageCodes, {
    fields: [estadosSuper.stageCode],
    references: [stageCodes.code],
  }),
  statusCodeInfo: one(statusCodes, {
    fields: [estadosSuper.statusCode],
    references: [statusCodes.code],
  }),
}));

export const stageCodesRelations = relations(stageCodes, ({ many }) => ({
  estados: many(estadosSuper),
}));

export const statusCodesRelations = relations(statusCodes, ({ many }) => ({
  estados: many(estadosSuper),
}));

export const solicitudesSuperRelations = relations(solicitudesSuper, ({ many }) => ({
  expedientes: many(expedientesTramitando),
}));

export const expedientesTramitandoRelations = relations(expedientesTramitando, ({ one }) => ({
  solicitudSuper: one(solicitudesSuper, {
    fields: [expedientesTramitando.codigoExpediente],
    references: [solicitudesSuper.codigoExpediente],
  }),
  actividad: one(actividades, {
    fields: [expedientesTramitando.actividadId],
    references: [actividades.id],
  }),
  estadoSuper: one(estadosSuper, {
    fields: [expedientesTramitando.estadoSuperId],
    references: [estadosSuper.id],
  }),
}));
