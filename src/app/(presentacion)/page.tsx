import { redirect } from "next/navigation";
import { RUTA_LOGIN, RUTA_PORTAL } from "../auth/redireccion";
import { obtenerUsuario } from "../auth/sesion.cookies";

// Raíz de la app (/ms-integracion-super): no tiene contenido propio, solo envía al portal o al login
export default async function Home() {
  const usuario = await obtenerUsuario();
  redirect(usuario ? RUTA_PORTAL : RUTA_LOGIN);
}
