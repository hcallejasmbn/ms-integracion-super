import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { ErrorResponseSchema } from "../../../openapi/common.schema";
import { EstadoSuperSchema } from "../../../super/procesos/[codigo]/estados/estados.schema";
import { ActividadSchema, ProcesoParamsSchema } from "../actividades/actividades.schema";

export const ActividadConEstadoSuperSchema = z
  .object({
    actividad: ActividadSchema,
    estadoSuper: EstadoSuperSchema.nullable().meta({ description: "null si la actividad no informa a SUPER" }),
  })
  .meta({ id: "ActividadConEstadoSuper" });

export const ActividadesConEstadoSuperResponseSchema = z
  .array(ActividadConEstadoSuperSchema)
  .meta({ id: "ActividadesConEstadoSuper" });

export type ActividadesConEstadoSuperResponse = z.infer<typeof ActividadesConEstadoSuperResponseSchema>;

export function registerEstadosSuperProcesoPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/procesos/{codigo}/estados-super",
    tags: ["Procesos"],
    summary: "Lista el estado SUPER configurado para cada actividad de un proceso",
    description:
      "Devuelve el estado SUPER asignado a cada actividad del proceso (actividades.estado_super_id). " +
      "Incluye todas las actividades: las que no tienen estado configurado vienen con estadoSuper null.",
    request: { params: ProcesoParamsSchema },
    responses: {
      200: {
        description: "Actividades del proceso con su estado SUPER, en el orden en que se crearon",
        content: { "application/json": { schema: ActividadesConEstadoSuperResponseSchema } },
      },
      400: {
        description: "El código viene vacío",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      404: {
        description: "El proceso no existe",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });
}
