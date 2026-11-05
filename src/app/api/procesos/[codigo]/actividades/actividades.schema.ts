import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { ErrorResponseSchema } from "../../../openapi/common.schema";

export const ProcesoParamsSchema = z.object({
  codigo: z.string().trim().min(1, "El código del proceso es obligatorio").meta({ example: "9" }),
});

export const ActividadSchema = z
  .object({
    id: z.int().meta({ example: 3 }),
    nombre: z.string().meta({ example: "Ingresar Solicitud" }),
    procesoCodigo: z.string().meta({ example: "9" }),
  })
  .meta({ id: "Actividad" });

export const ActividadesResponseSchema = z.array(ActividadSchema).meta({ id: "Actividades" });

export type ActividadesResponse = z.infer<typeof ActividadesResponseSchema>;

export function registerActividadesPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/procesos/{codigo}/actividades",
    tags: ["Procesos"],
    summary: "Lista las actividades de un proceso",
    request: { params: ProcesoParamsSchema },
    responses: {
      200: {
        description: "Actividades del proceso, en el orden en que se crearon",
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
