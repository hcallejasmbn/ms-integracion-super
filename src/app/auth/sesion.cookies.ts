import { cookies } from "next/headers";
import { BASE_PATH } from "@/config/base-path";
import { EnvConfig } from "@/config/env.config";
import type { FlujoLogin, Usuario } from "@/core/domain/auth/usuario";
import { SesionService } from "@/service/auth/sesion.service";

// Cookies de autenticación. Su path empieza con el basePath para que las otras apps del mismo host no las reciban.
// Las usan las rutas /api/auth/* y, más adelante, las páginas y el proxy.
// Escribir cookies solo funciona en Route Handlers y Server Functions, no al renderizar un Server Component
const COOKIE_SESION = "ms_sesion";
const COOKIE_FLUJO = "ms_auth_flujo";
// El flujo solo se necesita en el callback
const PATH_FLUJO = `${BASE_PATH}/api/auth`;
const PATH_SESION = BASE_PATH;

const sesionService = new SesionService();

// Lax: el navegador envía la cookie en la redirección de Azure al callback (navegación GET de primer nivel)
function opciones(maxAge: number, path: string) {
  return { httpOnly: true, secure: EnvConfig.cookiesSeguras, sameSite: "lax" as const, path, maxAge };
}

export async function guardarSesion(usuario: Usuario): Promise<void> {
  const { token, duracionSegundos } = await sesionService.sellarSesion(usuario);
  (await cookies()).set(COOKIE_SESION, token, opciones(duracionSegundos, PATH_SESION));
}

// null si no hay sesión o no es válida
export async function obtenerUsuario(): Promise<Usuario | null> {
  return sesionService.abrirSesion((await cookies()).get(COOKIE_SESION)?.value);
}

export async function borrarSesion(): Promise<void> {
  (await cookies()).set(COOKIE_SESION, "", opciones(0, PATH_SESION));
}

export async function guardarFlujo(flujo: FlujoLogin): Promise<void> {
  const { token, duracionSegundos } = await sesionService.sellarFlujo(flujo);
  (await cookies()).set(COOKIE_FLUJO, token, opciones(duracionSegundos, PATH_FLUJO));
}

// Lee el flujo y lo borra: cada flujo sirve para un solo callback
export async function tomarFlujo(): Promise<FlujoLogin | null> {
  const almacen = await cookies();
  const flujo = await sesionService.abrirFlujo(almacen.get(COOKIE_FLUJO)?.value);
  almacen.set(COOKIE_FLUJO, "", opciones(0, PATH_FLUJO));
  return flujo;
}
