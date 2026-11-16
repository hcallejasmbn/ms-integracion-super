import type { Metadata } from "next";
import { ProcesoService } from "@/service/proceso/proceso.service";
import { requerirUsuario } from "../../../../auth/sesion";
import ProcesosFragment from "../../../components/fragments/procesos/ProcesosFragment";
import { parametroTexto } from "../../../components/ui/busqueda";

export const metadata: Metadata = {
  title: "Procesos",
};

const procesoService = new ProcesoService();

// Se sirve en /ms-integracion-super/procesos. Sin sesión redirige a /login
export default async function ProcesosPage({ searchParams }: PageProps<"/procesos">) {
  await requerirUsuario();
  const q = parametroTexto((await searchParams).q);
  const procesos = await procesoService.listarProcesos();
  return <ProcesosFragment procesos={procesos} q={q} />;
}
