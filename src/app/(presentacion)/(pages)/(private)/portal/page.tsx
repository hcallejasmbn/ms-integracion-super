import type { Metadata } from "next";
import { requerirUsuario } from "../../../../auth/sesion";
import PortalFragment from "../../../components/fragments/portal/PortalFragment";

export const metadata: Metadata = {
  title: "Portal",
};

// Se sirve en /ms-integracion-super/portal. Sin sesión redirige a /login
export default async function PortalPage() {
  const usuario = await requerirUsuario();
  return <PortalFragment usuario={usuario} />;
}
