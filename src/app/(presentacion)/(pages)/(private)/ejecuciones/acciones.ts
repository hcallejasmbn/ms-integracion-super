"use server";
import { refresh } from "next/cache";
import { RangoLimpiezaInvalidoError } from "@/core/domain/traza/traza.errors";
import { TrazaService } from "@/service/traza/traza.service";
import { requerirUsuario } from "../../../../auth/sesion";
import type { ResultadoAccion } from "../../../components/ui/formulario";

// Server Actions de la traza de ejecuciones. Son endpoints POST públicos como cualquier ruta: cada una exige
// sesión y trata todo lo que recibe como no confiable (el dominio valida el rango)

const trazaService = new TrazaService();

// Elimina las trazas entre las fechas desde y hasta del formulario (ambos días incluidos). Vuelve a validar
// el rango aunque la página ya lo haya revisado, y no confía en la cantidad que mostró la vista previa
export async function eliminarTrazas(_previo: ResultadoAccion, datos: FormData): Promise<ResultadoAccion> {
  const usuario = await requerirUsuario();
  try {
    const { rango, eliminadas } = await trazaService.limpiar(texto(datos, "desde"), texto(datos, "hasta"));
    // Queda registro de quién limpió qué, ya que la acción no se puede deshacer
    console.info("Limpieza de log_ejecucion", { usuario: usuario.email, ...rango, eliminadas });
  } catch (error) {
    if (error instanceof RangoLimpiezaInvalidoError) {
      return { ok: false, error: error.message };
    }
    console.error("No se pudo limpiar log_ejecucion", error);
    return { ok: false, error: "No se pudieron eliminar las trazas. Intenta nuevamente." };
  }
  refresh();
  return { ok: true };
}

function texto(datos: FormData, campo: string): string {
  const valor = datos.get(campo);
  return typeof valor === "string" ? valor : "";
}
