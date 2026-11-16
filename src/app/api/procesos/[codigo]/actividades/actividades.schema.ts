import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { ErrorResponseSchema } from "../../../openapi/common.schema";
import { EstadoSuperSchema } from "../estados-super/estados-super.schema";
import { ProcesoParamsSchema } from "../proceso.schema";

export const ActividadSchema = z
  .object({
    id: z.int().meta({ example: 3 }),
    nombre: z.string().meta({ example: "Ingresar Solicitud" }),
    procesoCodigo: z.string().meta({ example: "9" }),
    estadoSuper: EstadoSuperSchema.nullable().meta({ description: "Estado que se informa a SUPER; null si la actividad no informa" }),
    debeNotificar: z.boolean().meta({
      description: "Si la actividad debe notificarse por el servicio de notificación (independiente de SUPER)",
      example: false,
    }),
  })
  .meta({ id: "Actividad" });

export const ActividadesResponseSchema = z.array(ActividadSchema).meta({ id: "Actividades" });

export type ActividadesResponse = z.infer<typeof ActividadesResponseSchema>;

export function registerActividadesPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/procesos/{codigo}/actividades",
    tags: ["Procesos"],
    summary: "Lista las actividades de un proceso con su estado SUPER",
    request: { params: ProcesoParamsSchema },
    responses: {
      200: {
        description: "Actividades del proceso, en el orden en que se crearon. Las que no informan a SUPER traen estadoSuper null",
        content: { "application/json": { schema: ActividadesResponseSchema } },
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
