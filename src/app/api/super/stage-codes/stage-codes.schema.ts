import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

export const StageCodeSchema = z
  .object({
    code: z.string().meta({ description: "Código interno; es el que guarda estados_super.stage_code", example: "1" }),
    value: z.string().meta({ description: "STAGE_CODE en SUPER", example: "ENTRY" }),
  })
  .meta({ id: "StageCode" });

export const StageCodesResponseSchema = z.array(StageCodeSchema).meta({ id: "StageCodes" });

export type StageCodesResponse = z.infer<typeof StageCodesResponseSchema>;

export function registerStageCodesPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/super/stage-codes",
    tags: ["Configuración SUPER"],
    summary: "Lista el catálogo de STAGE_CODE de SUPER",
    responses: {
      200: {
        description: "Códigos del catálogo stage_codes, ordenados por código",
        content: { "application/json": { schema: StageCodesResponseSchema } },
      },
    },
  });
}
