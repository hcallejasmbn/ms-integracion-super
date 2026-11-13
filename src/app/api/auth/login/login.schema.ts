import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

export const LoginQuerySchema = z.object({
  returnTo: z
    .string()
    .optional()
    .meta({ description: "Ruta interna a la que se vuelve después del login; por defecto /", example: "/procesos" }),
});

export function registerLoginPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/auth/login",
    tags: ["Autenticación"],
    summary: "Inicia el login con el SSO de Azure",
    description:
      "Redirige el navegador al login de Microsoft Entra ID (authorization code flow con PKCE). Se abre como navegación, no con fetch.",
    request: { query: LoginQuerySchema },
    responses: {
      302: { description: "Redirección al login de Azure" },
    },
  });
}
