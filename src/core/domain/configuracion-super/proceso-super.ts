import { ConfiguracionSuperInvalidaError } from "./configuracion-super.errors";

// Largos de las columnas de procesos_super; el esquema Zod de la API los importa de aquí
export const MAX_CODIGO_PROCESO_SUPER = 50;
export const MAX_NOMBRE_PROCESO_SUPER = 150;

export interface ProcesoSuper {
  readonly codigo: string;
  readonly nombre: string;
}

// El código lo asigna quien crea el proceso; no se autogenera
export function crearProcesoSuper(datos: ProcesoSuper): ProcesoSuper {
  return {
    codigo: textoValido("codigo", datos.codigo, MAX_CODIGO_PROCESO_SUPER),
    nombre: textoValido("nombre", datos.nombre, MAX_NOMBRE_PROCESO_SUPER),
  };
}

// Recorta espacios y exige un texto no vacío dentro del largo de la columna
export function textoValido(campo: string, valor: string, maximo: number): string {
  const texto = valor.trim();
  if (texto.length === 0) {
    throw new ConfiguracionSuperInvalidaError(`${campo} es obligatorio`);
  }
  if (texto.length > maximo) {
    throw new ConfiguracionSuperInvalidaError(`${campo} no puede superar ${maximo} caracteres`);
  }
  return texto;
}
