import { redirect } from "next/navigation";
import { cache } from "react";
import type { Usuario } from "@/core/domain/auth/usuario";
import { RUTA_LOGIN } from "./redireccion";
import { obtenerUsuario } from "./sesion.cookies";

/**
 * Verificación de sesión para las páginas privadas: devuelve el usuario o redirige a /login.
 * Cada página de (private) la llama (no el layout, que no se vuelve a renderizar al navegar entre páginas).
 * cache() evita descifrar la cookie más de una vez en el mismo render. redirect() agrega el basePath
 */
export const requerirUsuario = cache(async (): Promise<Usuario> => {
  const usuario = await obtenerUsuario();
  if (!usuario) {
    redirect(RUTA_LOGIN);
  }
  return usuario;
});
