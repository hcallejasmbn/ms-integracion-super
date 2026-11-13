import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

export const TipoDiasSchema = z
  .object({
    code: z.string().meta({
      description: "Valor USE_WORKING_DAYS en SUPER; es el que guarda estados_super.use_working_days",
      example: "DÍAS HÁBILES",
    }),
    descripcion: z.string().meta({ example: "Plazo en días hábiles: lunes a viernes, sin feriados" }),
  })
  .meta({ id: "TipoDias" });

export const TiposDiasResponseSchema = z.array(TipoDiasSchema).meta({ id: "TiposDias" });

export type TiposDiasResponse = z.infer<typeof TiposDiasResponseSchema>;

export function registerTypeWorksDaysPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/super/type-works-days",
    tags: ["Configuración SUPER"],
    summary: "Lista el catálogo de USE_WORKING_DAYS de SUPER",
    responses: {
      200: {
        description: "Opciones del catálogo type_works_days, ordenadas por código",
        content: { "application/json": { schema: TiposDiasResponseSchema } },
      },
    },
  });
}
