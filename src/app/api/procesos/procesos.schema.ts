import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

export const ProcesoSchema = z
  .object({
    codigo: z.string().meta({ example: "9" }),
    nombre: z.string().meta({ example: "Concesion OLP" }),
    codigoSuper: z
      .string()
      .nullable()
      .meta({ description: "Código del proceso en SUPER; null si no está configurado", example: "CONCESION_OLP" }),
  })
  .meta({ id: "Proceso" });

export const ProcesosResponseSchema = z.array(ProcesoSchema).meta({ id: "Procesos" });

export type ProcesosResponse = z.infer<typeof ProcesosResponseSchema>;

export function registerProcesosPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/procesos",
    tags: ["Procesos"],
    summary: "Lista los procesos cargados",
    responses: {
      200: {
        description: "Procesos ordenados por código",
        content: { "application/json": { schema: ProcesosResponseSchema } },
      },
    },
  });
}
