// Zona horaria del Ministerio: en ella se muestran las fechas y se interpretan los días que elige el usuario
export const ZONA_HORARIA = "America/Santiago";

// Fecha de hoy (YYYY-MM-DD) en la zona horaria del Ministerio, sin depender de la del servidor
export function hoyEnZonaHoraria(ahora: Date = new Date()): string {
  // en-CA formatea como YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA }).format(ahora);
}
