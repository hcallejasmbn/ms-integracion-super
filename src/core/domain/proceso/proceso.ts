import type { EstadoSuper } from "../configuracion-super/estado-super";
import { ActividadInvalidaError, ProcesoInvalidoError } from "./proceso.errors";

// Largo de procesos.codigo_super; el esquema Zod de la API lo importa de aquí
export const MAX_CODIGO_SUPER_PROCESO = 150;

export interface Proceso {
  readonly codigo: string;
  readonly nombre: string;
  // Código del proceso en SUPER; null mientras no esté configurado en SUPER
  readonly codigoSuper: string | null;
}

// estadoSuper es el estado que se informa cuando un expediente pasa por la actividad; null si no informa a SUPER.
// debeNotificar es para el servicio de notificación, independiente de SUPER
export interface Actividad {
  readonly id: number;
  readonly nombre: string;
  readonly procesoCodigo: string;
  readonly estadoSuper: EstadoSuper | null;
  readonly debeNotificar: boolean;
}

// Largo máximo del nombre de una actividad (la columna es text; el límite es de negocio)
export const MAX_NOMBRE_ACTIVIDAD = 255;

// Datos para crear o modificar una actividad; estadoSuperId null la deja sin informar a SUPER
export interface DatosActividad {
  readonly nombre: string;
  readonly estadoSuperId: number | null;
  readonly debeNotificar: boolean;
}

// Recorta espacios y exige un nombre no vacío dentro del largo permitido
export function normalizarNombreActividad(nombre: string): string {
  const texto = nombre.trim();
  if (texto.length === 0) {
    throw new ActividadInvalidaError("El nombre de la actividad es obligatorio");
  }
  if (texto.length > MAX_NOMBRE_ACTIVIDAD) {
    throw new ActividadInvalidaError(`El nombre de la actividad no puede superar ${MAX_NOMBRE_ACTIVIDAD} caracteres`);
  }
  return texto;
}

// Recorta espacios; vacío o null deja el proceso sin código SUPER
export function normalizarCodigoSuper(codigoSuper: string | null): string | null {
  const codigo = codigoSuper?.trim();
  if (!codigo) {
    return null;
  }
  if (codigo.length > MAX_CODIGO_SUPER_PROCESO) {
    throw new ProcesoInvalidoError(`codigoSuper no puede superar ${MAX_CODIGO_SUPER_PROCESO} caracteres`);
  }
  return codigo;
}
