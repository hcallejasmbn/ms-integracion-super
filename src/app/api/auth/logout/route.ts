import { redirigir, RUTA_LOGIN } from "../../../auth/redireccion";
import { borrarSesion } from "../../../auth/sesion.cookies";

// Cierra solo la sesión de esta app (borra ms_sesion). No llama al logout de Azure a propósito:
// ese cierra la sesión de Microsoft del navegador y saca al usuario de las otras apps que la usan
export async function GET() {
  await borrarSesion();
  return redirigir(RUTA_LOGIN);
}
