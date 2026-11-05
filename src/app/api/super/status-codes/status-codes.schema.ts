import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

export const StatusCodeSchema = z
  .object({
    code: z.string().meta({ description: "Código interno; es el que guarda estados_super.status_code", example: "1" }),
    value: z.string().meta({ description: "STATUS_CODE en SUPER", example: "ENTERED" }),
  })
  .meta({ id: "StatusCode" });

export const StatusCodesResponseSchema = z.array(StatusCodeSchema).meta({ id: "StatusCodes" });

export type StatusCodesResponse = z.infer<typeof StatusCodesResponseSchema>;

export function registerStatusCodesPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/super/status-codes",
    tags: ["Configuración SUPER"],
    summary: "Lista el catálogo de STATUS_CODE de SUPER",
    responses: {
      200: {
        description: "Códigos del catálogo status_codes, ordenados por código",
        content: { "application/json": { schema: StatusCodesResponseSchema } },
      },
    },
  });
}
