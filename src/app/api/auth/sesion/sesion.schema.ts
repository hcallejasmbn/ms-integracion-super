import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { ErrorResponseSchema } from "../../openapi/common.schema";

export const UsuarioSchema = z
  .object({
    id: z.string().meta({ description: "oid del usuario en Entra ID", example: "8f3c1e2a-4b5d-4c6e-9f70-1a2b3c4d5e6f" }),
    nombre: z.string().meta({ example: "Ignacio Perez" }),
    email: z.string().meta({ example: "ignacio.perez@empresa.cl" }),
  })
  .meta({ id: "Usuario" });

export type SesionResponse = z.infer<typeof UsuarioSchema>;

export function registerSesionPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/auth/sesion",
    tags: ["Autenticación"],
    summary: "Usuario de la sesión actual",
    responses: {
      200: {
        description: "Hay una sesión válida",
        content: { "application/json": { schema: UsuarioSchema } },
      },
      401: {
        description: "No hay sesión o expiró",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });
}
