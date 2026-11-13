import type { Metadata } from "next";
import { esResultadoEjecucion } from "@/core/domain/traza/ejecucion";
import { RangoLimpiezaInvalidoError } from "@/core/domain/traza/traza.errors";
import { hoyEnZonaHoraria } from "@/core/domain/zona-horaria";
import { TrazaService } from "@/service/traza/traza.service";
import { requerirUsuario } from "../../../../auth/sesion";
import EjecucionesFragment from "../../../components/fragments/ejecuciones/EjecucionesFragment";
import type { LimpiezaPanelProps, RevisionLimpieza } from "../../../components/fragments/ejecuciones/LimpiezaPanel";
import { parametroTexto } from "../../../components/ui/busqueda";
import { eliminarTrazas } from "./acciones";

export const metadata: Metadata = {
  title: "Traza ejecuciones",
};

const trazaService = new TrazaService();

// Se sirve en /ms-integracion-super/ejecuciones?resultado=OK|ERROR&operacion=&q=&pagina= y, para la pestaña de
// limpieza, ?tab=limpieza&desde=&hasta=. Sin sesión redirige a /login
export default async function EjecucionesPage({ searchParams }: PageProps<"/ejecuciones">) {
  await requerirUsuario();
  const parametros = await searchParams;
  const q = parametroTexto(parametros.q);
  const operacion = parametroTexto(parametros.operacion);
  const valorResultado = parametroTexto(parametros.resultado);
  // Un resultado desconocido muestra todas
  const resultado = esResultadoEjecucion(valorResultado) ? valorResultado : undefined;
  const enLimpieza = parametroTexto(parametros.tab) === "limpieza";

  const [pagina, operaciones, limpieza] = await Promise.all([
    // En la pestaña de limpieza se usa solo para los contadores de las pestañas
    trazaService.listarEjecuciones({
      resultado,
      operacion: operacion || undefined,
      texto: q,
      pagina: Number(parametroTexto(parametros.pagina) || 1),
    }),
    trazaService.listarOperaciones(),
    enLimpieza ? datosLimpieza(parametroTexto(parametros.desde), parametroTexto(parametros.hasta)) : undefined,
  ]);
  return (
    <EjecucionesFragment
      pagina={pagina}
      operaciones={operaciones}
      resultado={resultado}
      operacion={operacion}
      q={q}
      limpieza={limpieza}
    />
  );
}

// Revisa el rango elegido (?desde=&hasta=): cuántas trazas se eliminarían o por qué el rango no sirve
async function datosLimpieza(desde: string, hasta: string): Promise<LimpiezaPanelProps> {
  const [revision, rangoTabla] = await Promise.all([revisar(desde, hasta), trazaService.rangoFechas()]);
  return { revision, desde, hasta, hoy: hoyEnZonaHoraria(), rangoTabla, eliminarTrazas };
}

async function revisar(desde: string, hasta: string): Promise<RevisionLimpieza> {
  if (!desde && !hasta) {
    return { tipo: "sin-rango" };
  }
  try {
    const { rango, cantidad } = await trazaService.contarParaLimpieza(desde, hasta);
    return { tipo: "valido", rango, cantidad };
  } catch (error) {
    if (error instanceof RangoLimpiezaInvalidoError) {
      return { tipo: "invalido", error: error.message };
    }
    throw error;
  }
}
