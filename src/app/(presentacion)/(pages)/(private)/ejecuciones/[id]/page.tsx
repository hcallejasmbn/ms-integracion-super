import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EjecucionNoEncontradaError } from "@/core/domain/traza/traza.errors";
import { TrazaService } from "@/service/traza/traza.service";
import { requerirUsuario } from "../../../../../auth/sesion";
import EjecucionDetalleFragment from "../../../../components/fragments/ejecuciones/EjecucionDetalleFragment";

const trazaService = new TrazaService();

export async function generateMetadata({ params }: PageProps<"/ejecuciones/[id]">): Promise<Metadata> {
  return { title: `Ejecución ${(await params).id}` };
}

// Se sirve en /ms-integracion-super/ejecuciones/{id}. Sin sesión redirige a /login; un id inválido o inexistente da 404
export default async function EjecucionDetallePage({ params }: PageProps<"/ejecuciones/[id]">) {
  await requerirUsuario();
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    notFound();
  }

  try {
    const ejecucion = await trazaService.obtenerEjecucion(id);
    const relacionadas = await trazaService.listarPorTrackId(ejecucion.trackId);
    return <EjecucionDetalleFragment ejecucion={ejecucion} relacionadas={relacionadas} />;
  } catch (error) {
    if (error instanceof EjecucionNoEncontradaError) {
      notFound();
    }
    throw error;
  }
}
