import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { MAX_CODIGO_PROCESO_SUPER, MAX_NOMBRE_PROCESO_SUPER } from "@/core/domain/configuracion-super/proceso-super";
import { ErrorResponseSchema } from "../../openapi/common.schema";

export const NuevoProcesoSuperSchema = z
  .object({
    codigo: z
      .string("El código es obligatorio")
      .trim()
      .min(1, "El código es obligatorio")
      .max(MAX_CODIGO_PROCESO_SUPER, `El código no puede superar ${MAX_CODIGO_PROCESO_SUPER} caracteres`)
      .meta({ description: "Lo asigna quien crea el proceso", example: "OLP" }),
    nombre: z
      .string("El nombre es obligatorio")
      .trim()
      .min(1, "El nombre es obligatorio")
      .max(MAX_NOMBRE_PROCESO_SUPER, `El nombre no puede superar ${MAX_NOMBRE_PROCESO_SUPER} caracteres`)
      .meta({ example: "Concesión onerosa de largo plazo" }),
  })
  .meta({ id: "NuevoProcesoSuper" });

export const ProcesoSuperSchema = z
  .object({
    codigo: z.string().meta({ example: "OLP" }),
    nombre: z.string().meta({ example: "Concesión onerosa de largo plazo" }),
  })
  .meta({ id: "ProcesoSuper" });

export type ProcesoSuperResponse = z.infer<typeof ProcesoSuperSchema>;

export function registerProcesosSuperPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "post",
    path: "/api/super/procesos",
    tags: ["Configuración SUPER"],
    summary: "Crea un proceso SUPER",
    request: {
      body: { content: { "application/json": { schema: NuevoProcesoSuperSchema } } },
    },
    responses: {
      201: {
        description: "Proceso SUPER creado",
        content: { "application/json": { schema: ProcesoSuperSchema } },
      },
      400: {
        description: "El cuerpo no es JSON o no cumple el contrato",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      409: {
        description: "Ya existe un proceso SUPER con ese código",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });
}
