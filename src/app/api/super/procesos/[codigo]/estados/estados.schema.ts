import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { ErrorResponseSchema } from "../../../../openapi/common.schema";

export const ProcesoSuperParamsSchema = z.object({
  codigo: z.string().trim().min(1, "El código del proceso SUPER es obligatorio").meta({ example: "OLP" }),
});

export const EstadoSuperSchema = z
  .object({
    id: z.int().meta({ example: 1 }),
    procesoSuperCodigo: z.string().meta({ example: "OLP" }),
    code: z.string().meta({ description: "CODE de la séxtupla", example: "IWSP-1" }),
    stageCode: z.string().meta({ description: "Código interno de stage_codes", example: "1" }),
    stageValue: z.string().meta({ description: "STAGE_CODE en SUPER", example: "ENTRY" }),
    status: z.string().meta({ example: "Solicitud ingresada" }),
    statusCode: z.string().meta({ description: "Código interno de status_codes", example: "1" }),
    statusValue: z.string().meta({ description: "STATUS_CODE en SUPER", example: "ENTERED" }),
    subtask: z.string().meta({ example: "Solicitud recibida" }),
    useWorkingDays: z.string().meta({ example: "DÍAS HÁBILES" }),
    responsibleType: z.string().meta({ example: "TITULAR" }),
    suspensionType: z.string().nullable().meta({ description: "Causal de suspensión, si tiene" }),
  })
  .meta({ id: "EstadoSuper" });

export const EstadosSuperResponseSchema = z.array(EstadoSuperSchema).meta({ id: "EstadosSuper" });

export type EstadosSuperResponse = z.infer<typeof EstadosSuperResponseSchema>;

export function registerEstadosSuperPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/super/procesos/{codigo}/estados",
    tags: ["Configuración SUPER"],
    summary: "Lista los estados SUPER configurados para un proceso SUPER",
    request: { params: ProcesoSuperParamsSchema },
    responses: {
      200: {
        description: "Estados del proceso SUPER, en el orden en que se crearon",
        content: { "application/json": { schema: EstadosSuperResponseSchema } },
      },
      400: {
        description: "El código viene vacío",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      404: {
        description: "El proceso SUPER no existe",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });
}
