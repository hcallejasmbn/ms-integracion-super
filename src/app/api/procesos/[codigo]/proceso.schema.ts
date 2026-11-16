import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { MAX_CODIGO_SUPER_PROCESO } from "@/core/domain/proceso/proceso";
import { ErrorResponseSchema } from "../../openapi/common.schema";
import { ProcesoSchema } from "../procesos.schema";

// Lo usan todas las rutas bajo /api/procesos/{codigo}
export const ProcesoParamsSchema = z.object({
  codigo: z.string().trim().min(1, "El código del proceso es obligatorio").meta({ example: "9" }),
});

export const ActualizarProcesoSchema = z
  .object({
    codigoSuper: z
      .string("codigoSuper debe ser texto o null")
      .trim()
      .max(MAX_CODIGO_SUPER_PROCESO, `codigoSuper no puede superar ${MAX_CODIGO_SUPER_PROCESO} caracteres`)
      .nullable()
      .meta({ description: "Código del proceso en SUPER; null o vacío lo quita", example: "CONCESION_OLP" }),
  })
  .meta({ id: "ActualizarProceso" });

export type ProcesoResponse = z.infer<typeof ProcesoSchema>;

export function registerProcesoPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "patch",
    path: "/api/procesos/{codigo}",
    tags: ["Procesos"],
    summary: "Actualiza el código SUPER de un proceso",
    description: "Los procesos se crean por semilla; aquí solo se configura su código en SUPER.",
    request: {
      params: ProcesoParamsSchema,
      body: { content: { "application/json": { schema: ActualizarProcesoSchema } } },
    },
    responses: {
      200: {
        description: "Proceso actualizado",
        content: { "application/json": { schema: ProcesoSchema } },
      },
      400: {
        description: "El código o el cuerpo no son válidos",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      404: {
        description: "El proceso no existe",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });
}
