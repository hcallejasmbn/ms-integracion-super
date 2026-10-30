import { relations } from "drizzle-orm";
import { actividades } from "./actividad.entity";
import { procesos } from "./proceso.entity";

// Las relaciones van aparte para que las entidades no se importen entre sí en ambos sentidos
export const procesosRelations = relations(procesos, ({ many }) => ({
  actividades: many(actividades),
}));

export const actividadesRelations = relations(actividades, ({ one }) => ({
  proceso: one(procesos, {
    fields: [actividades.procesoCodigo],
    references: [procesos.codigo],
  }),
}));
