import { BASE_PATH } from "@/config/base-path";
import { EnvConfig } from "@/config/env.config";

// Página de login de la interfaz; recibe ?error=<codigo> cuando el SSO falla
export const RUTA_LOGIN = "/login";

// Página de inicio de un usuario con sesión
export const RUTA_PORTAL = "/portal";

export type CodigoErrorLogin = "autenticacion_fallida" | "login_expirado" | "azure_no_disponible";

// ruta es una ruta de la app sin el basePath (como en <Link href>), por ejemplo /login o el returnTo.
// Response.redirect no agrega el basePath, por eso se agrega aquí. Se usa el origen público de la app
// (el de la Redirect URI) y no el del request, que detrás de un proxy o en Docker puede ser un host interno
export function redirigir(ruta: string): Response {
  return Response.redirect(new URL(`${BASE_PATH}${ruta}`, EnvConfig.azureRedirectUri), 302);
}

export function redirigirALogin(error: CodigoErrorLogin): Response {
  return redirigir(`${RUTA_LOGIN}?error=${error}`);
}
