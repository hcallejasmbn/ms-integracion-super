import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProcesoNoEncontradoError } from "@/core/domain/proceso/proceso.errors";
import { ConfiguracionSuperService } from "@/service/configuracion-super/configuracion-super.service";
import { ProcesoService } from "@/service/proceso/proceso.service";
import { requerirUsuario } from "../../../../../auth/sesion";
import ProcesoDetalleFragment, {
  PESTANAS_PROCESO,
  type PestanaProceso,
} from "../../../../components/fragments/procesos/ProcesoDetalleFragment";
import { parametroTexto } from "../../../../components/ui/busqueda";
import { guardarActividad, guardarEstadoSuper } from "./acciones";

const procesoService = new ProcesoService();
const configuracionSuperService = new ConfiguracionSuperService();

export async function generateMetadata({ params }: PageProps<"/procesos/[codigo]">): Promise<Metadata> {
  const { codigo } = await params;
  return { title: `Proceso ${decodificar(codigo)}` };
}

// Se sirve en /ms-integracion-super/procesos/{codigo}?tab=actividades|estados-super. Sin sesión redirige a
// /login; un proceso que no existe da 404. Los cambios se guardan con las Server Actions de ./acciones
export default async function ProcesoDetallePage({ params, searchParams }: PageProps<"/procesos/[codigo]">) {
  await requerirUsuario();
  const codigo = decodificar((await params).codigo);
  const { q, tab } = await searchParams;

  try {
    // Las dos pestañas usan las actividades y los estados (para los selects y la columna de asignación)
    const [proceso, actividades, estados, stageCodes, statusCodes, tiposDias, tiposResponsable] = await Promise.all([
      procesoService.obtenerProceso(codigo),
      procesoService.listarActividades(codigo),
      configuracionSuperService.listarEstados(codigo),
      configuracionSuperService.listarStageCodes(),
      configuracionSuperService.listarStatusCodes(),
      configuracionSuperService.listarTiposDias(),
      configuracionSuperService.listarTiposResponsable(),
    ]);
    return (
      <ProcesoDetalleFragment
        proceso={proceso}
        actividades={actividades}
        estados={estados}
        stageCodes={stageCodes}
        statusCodes={statusCodes}
        tiposDias={tiposDias}
        tiposResponsable={tiposResponsable}
        pestana={pestana(parametroTexto(tab))}
        q={parametroTexto(q)}
        guardarActividad={guardarActividad}
        guardarEstadoSuper={guardarEstadoSuper}
      />
    );
  } catch (error) {
    if (error instanceof ProcesoNoEncontradoError) {
      notFound();
    }
    throw error;
  }
}

// Un ?tab= desconocido muestra las actividades
function pestana(valor: string): PestanaProceso {
  return PESTANAS_PROCESO.find((id) => id === valor) ?? "actividades";
}

// El código llega codificado en la URL (por ejemplo "T%201"); un "%" suelto haría fallar decodeURIComponent
function decodificar(codigo: string): string {
  try {
    return decodeURIComponent(codigo);
  } catch {
    return codigo;
  }
}
