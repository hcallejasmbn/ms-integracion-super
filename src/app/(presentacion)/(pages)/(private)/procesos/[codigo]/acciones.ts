"use server";
import { refresh } from "next/cache";
import {
  CodigoCatalogoNoEncontradoError,
  ConfiguracionSuperInvalidaError,
  EstadoSuperDeOtroProcesoError,
  EstadoSuperDuplicadoError,
  EstadoSuperNoEncontradoError,
  EstadoSuperYaAsignadoError,
} from "@/core/domain/configuracion-super/configuracion-super.errors";
import {
  ActividadDuplicadaError,
  ActividadInvalidaError,
  ActividadNoEncontradaError,
  ProcesoNoEncontradoError,
} from "@/core/domain/proceso/proceso.errors";
import { ConfiguracionSuperService } from "@/service/configuracion-super/configuracion-super.service";
import { ProcesoService } from "@/service/proceso/proceso.service";
import { requerirUsuario } from "../../../../../auth/sesion";
import type { ResultadoAccion } from "../../../../components/ui/formulario";

// Server Actions de la página del proceso. Son endpoints POST públicos como cualquier ruta: cada una exige
// sesión y trata todo lo que recibe como no confiable (el dominio valida los datos)

const procesoService = new ProcesoService();
const configuracionSuperService = new ConfiguracionSuperService();

// Errores esperables: su mensaje se muestra en el formulario
const ERRORES_DE_NEGOCIO = [
  ProcesoNoEncontradoError,
  ActividadNoEncontradaError,
  ActividadInvalidaError,
  ActividadDuplicadaError,
  EstadoSuperNoEncontradoError,
  EstadoSuperDeOtroProcesoError,
  EstadoSuperYaAsignadoError,
  ConfiguracionSuperInvalidaError,
  EstadoSuperDuplicadoError,
  CodigoCatalogoNoEncontradoError,
] as const;

class FormularioInvalidoError extends Error {}

// Crea la actividad si el formulario no trae id, o la modifica si lo trae
export async function guardarActividad(_previo: ResultadoAccion, datos: FormData): Promise<ResultadoAccion> {
  return ejecutar(async () => {
    const id = idOpcional(datos, "id");
    const actividad = {
      nombre: texto(datos, "nombre"),
      estadoSuperId: idOpcional(datos, "estadoSuperId"),
      debeNotificar: casilla(datos, "debeNotificar"),
    };
    if (id === null) {
      await procesoService.crearActividad(texto(datos, "procesoCodigo"), actividad);
    } else {
      await procesoService.actualizarActividad(id, actividad);
    }
  });
}

// Crea el estado SUPER en el proceso si el formulario no trae id, o lo modifica si lo trae
export async function guardarEstadoSuper(_previo: ResultadoAccion, datos: FormData): Promise<ResultadoAccion> {
  return ejecutar(async () => {
    const id = idOpcional(datos, "id");
    const estado = {
      code: texto(datos, "code"),
      stageCode: texto(datos, "stageCode"),
      status: texto(datos, "status"),
      statusCode: texto(datos, "statusCode"),
      subtask: texto(datos, "subtask"),
      useWorkingDays: texto(datos, "useWorkingDays"),
      responsibleType: texto(datos, "responsibleType"),
      suspensionType: texto(datos, "suspensionType"),
    };
    if (id === null) {
      await configuracionSuperService.crearEstado({ ...estado, procesoCodigo: texto(datos, "procesoCodigo") });
    } else {
      await configuracionSuperService.actualizarEstado(id, estado);
    }
  });
}

// Exige sesión, guarda y refresca la página. Los errores de negocio vuelven como mensaje; los demás se registran
async function ejecutar(guardar: () => Promise<void>): Promise<ResultadoAccion> {
  await requerirUsuario();
  try {
    await guardar();
  } catch (error) {
    if (error instanceof FormularioInvalidoError || ERRORES_DE_NEGOCIO.some((tipo) => error instanceof tipo)) {
      return { ok: false, error: (error as Error).message };
    }
    console.error("No se pudo guardar el formulario del proceso", error);
    return { ok: false, error: "No se pudo guardar. Intenta nuevamente." };
  }
  refresh();
  return { ok: true };
}

// Un campo ausente o que no es texto se trata como vacío; el dominio decide si es obligatorio
function texto(datos: FormData, campo: string): string {
  const valor = datos.get(campo);
  return typeof valor === "string" ? valor : "";
}

// Un checkbox solo viaja en el formulario cuando está marcado (con value="true")
function casilla(datos: FormData, campo: string): boolean {
  return texto(datos, campo) === "true";
}

// Vacío = sin id (alta, o actividad sin estado SUPER)
function idOpcional(datos: FormData, campo: string): number | null {
  const valor = texto(datos, campo).trim();
  if (valor === "") return null;
  const id = Number(valor);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new FormularioInvalidoError(`${campo} debe ser un número entero positivo`);
  }
  return id;
}
