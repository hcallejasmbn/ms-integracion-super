import { RangoLimpiezaInvalidoError } from "./traza.errors";

// Días (YYYY-MM-DD, en la zona horaria del Ministerio) cuyas trazas se eliminan; ambos extremos incluidos
export interface RangoLimpieza {
  readonly desde: string;
  readonly hasta: string;
}

const FORMATO_DIA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Valida el rango que elige el usuario: dos días reales, desde <= hasta y hasta no posterior a hoy.
 * hoy se recibe (YYYY-MM-DD) para no depender del reloj en las reglas.
 */
export function crearRangoLimpieza(desde: string, hasta: string, hoy: string): RangoLimpieza {
  const inicio = diaValido("La fecha desde", desde);
  const fin = diaValido("La fecha hasta", hasta);
  if (inicio > fin) {
    throw new RangoLimpiezaInvalidoError("La fecha desde no puede ser posterior a la fecha hasta");
  }
  if (fin > hoy) {
    throw new RangoLimpiezaInvalidoError("La fecha hasta no puede ser posterior a hoy");
  }
  return { desde: inicio, hasta: fin };
}

// Al ser YYYY-MM-DD, comparar los textos equivale a comparar las fechas
function diaValido(campo: string, valor: string): string {
  const dia = valor.trim();
  if (dia === "") {
    throw new RangoLimpiezaInvalidoError(`${campo} es obligatoria`);
  }
  // new Date acepta 2026-02-31 y lo corre de mes; se descarta comparando con lo que vuelve
  if (!FORMATO_DIA.test(dia) || new Date(`${dia}T00:00:00Z`).toISOString().slice(0, 10) !== dia) {
    throw new RangoLimpiezaInvalidoError(`${campo} no es una fecha válida (AAAA-MM-DD)`);
  }
  return dia;
}
