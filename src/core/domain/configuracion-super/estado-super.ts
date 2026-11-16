import { ConfiguracionSuperInvalidaError } from "./configuracion-super.errors";

// Séxtupla de SUPER configurada para un proceso
export interface EstadoSuper {
  readonly id: number;
  readonly procesoCodigo: string;
  readonly code: string;
  // Código interno del catálogo y su valor en SUPER, por ejemplo "1" y ENTRY
  readonly stageCode: string;
  readonly stageValue: string;
  readonly status: string;
  readonly statusCode: string;
  readonly statusValue: string;
  readonly subtask: string;
  // Código de type_works_days y su descripción
  readonly useWorkingDays: string;
  readonly useWorkingDaysDescripcion: string;
  // Código de type_responsible y su descripción
  readonly responsibleType: string;
  readonly responsibleTypeDescripcion: string;
  readonly suspensionType: string | null;
}

// Largos de las columnas de estados_super; el esquema Zod de la API los importa de aquí
export const MAX_ESTADO_SUPER = {
  code: 20,
  stageCode: 50,
  status: 150,
  statusCode: 50,
  subtask: 255,
  useWorkingDays: 50,
  responsibleType: 50,
  suspensionType: 10,
} as const;

// Datos para crear una séxtupla; stageCode, statusCode, useWorkingDays y responsibleType son códigos de sus catálogos
export interface NuevoEstadoSuper {
  readonly procesoCodigo: string;
  readonly code: string;
  readonly stageCode: string;
  readonly status: string;
  readonly statusCode: string;
  readonly subtask: string;
  readonly useWorkingDays: string;
  readonly responsibleType: string;
  readonly suspensionType?: string | null;
}

// Datos editables de una séxtupla existente: todo menos el proceso, que no cambia
export type DatosEstadoSuper = Omit<NuevoEstadoSuper, "procesoCodigo">;

// Los campos se guardan tal como los define SUPER: solo se valida que vengan y quepan en la columna
export function crearNuevoEstadoSuper(datos: NuevoEstadoSuper): NuevoEstadoSuper {
  const suspensionType = datos.suspensionType?.trim();
  return {
    procesoCodigo: datos.procesoCodigo,
    code: textoValido("code", datos.code, MAX_ESTADO_SUPER.code),
    stageCode: textoValido("stageCode", datos.stageCode, MAX_ESTADO_SUPER.stageCode),
    status: textoValido("status", datos.status, MAX_ESTADO_SUPER.status),
    statusCode: textoValido("statusCode", datos.statusCode, MAX_ESTADO_SUPER.statusCode),
    subtask: textoValido("subtask", datos.subtask, MAX_ESTADO_SUPER.subtask),
    useWorkingDays: textoValido("useWorkingDays", datos.useWorkingDays, MAX_ESTADO_SUPER.useWorkingDays),
    responsibleType: textoValido("responsibleType", datos.responsibleType, MAX_ESTADO_SUPER.responsibleType),
    // Vacío equivale a sin causal de suspensión
    suspensionType: suspensionType
      ? textoValido("suspensionType", suspensionType, MAX_ESTADO_SUPER.suspensionType)
      : null,
  };
}

// Recorta espacios y exige un texto no vacío dentro del largo de la columna
function textoValido(campo: string, valor: string, maximo: number): string {
  const texto = valor.trim();
  if (texto.length === 0) {
    throw new ConfiguracionSuperInvalidaError(`${campo} es obligatorio`);
  }
  if (texto.length > maximo) {
    throw new ConfiguracionSuperInvalidaError(`${campo} no puede superar ${maximo} caracteres`);
  }
  return texto;
}
