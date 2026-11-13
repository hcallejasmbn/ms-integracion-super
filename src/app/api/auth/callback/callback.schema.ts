import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Solo documenta la respuesta de Azure; la valida openid-client (state, PKCE y nonce)
export const CallbackQuerySchema = z.object({
  code: z.string().optional().meta({ description: "Código de autorización emitido por Azure" }),
  state: z.string().optional().meta({ description: "Debe coincidir con el generado en /api/auth/login" }),
  error: z.string().optional().meta({ description: "Error devuelto por Azure", example: "access_denied" }),
  error_description: z.string().optional(),
});

export function registerCallbackPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/auth/callback",
    tags: ["Autenticación"],
    summary: "Callback del SSO de Azure (Redirect URI)",
    description:
      "Azure redirige aquí después del login. Canjea el código por los tokens, valida el id_token, crea la cookie de sesión (ms_sesion) y vuelve a returnTo. Es la Redirect URI que se registra en la app de Azure (plataforma Web).",
    request: { query: CallbackQuerySchema },
    responses: {
      302: {
        description:
          "Login correcto: redirige a returnTo. Error: redirige a /login?error= autenticacion_fallida, login_expirado o azure_no_disponible",
      },
    },
  });
}
