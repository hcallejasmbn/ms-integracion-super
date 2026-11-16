import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RUTA_PORTAL } from "../../../auth/redireccion";
import { obtenerUsuario } from "../../../auth/sesion.cookies";
import LoginFragment from "../../components/fragments/login/LoginFragment";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

// Se sirve en /ms-integracion-super/login. El callback del SSO redirige aquí con ?error=<codigo> cuando falla.
// Con una sesión activa no tiene sentido mostrar el login: se va al portal
export default async function LoginPage() {
  if (await obtenerUsuario()) {
    redirect(RUTA_PORTAL);
  }
  return <LoginFragment />;
}
