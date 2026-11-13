import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export function registerLogoutPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/auth/logout",
    tags: ["Autenticación"],
    summary: "Cierra la sesión de la app",
    description:
      "Cierra solo la sesión de esta app: borra la cookie ms_sesion y redirige a /login. No cierra la sesión de Microsoft, así que las otras apps del navegador siguen conectadas. Se abre como navegación.",
    responses: {
      302: { description: "Redirección a /login" },
    },
  });
}
