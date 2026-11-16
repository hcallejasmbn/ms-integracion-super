// Una llamada HTTP a SUPER registrada en log_ejecucion. Los intentos de una misma operación comparten trackId
export interface Ejecucion {
  readonly id: number;
  readonly trackId: string;
  // OBTENER_TOKEN, CREAR_SOLICITUD, ACTUALIZAR_SOLICITUD
  readonly operacion: string;
  readonly intento: number;
  readonly url: string;
  readonly metodo: string;
  // Lo enviado, ya sin api_key ni token; null si la llamada no llevaba body
  readonly request: unknown;
  // null si no hubo respuesta HTTP (timeout, error de red)
  readonly responseStatus: number | null;
  // Texto tal como respondió SUPER (puede no ser JSON ante un 5xx)
  readonly responseBody: string | null;
  // Excepción cuando no hubo respuesta HTTP
  readonly error: string | null;
  readonly resultado: ResultadoEjecucion;
  readonly fechaInicio: Date;
  readonly duracionMs: number | null;
}

export const RESULTADOS_EJECUCION = ["OK", "ERROR"] as const;
export type ResultadoEjecucion = (typeof RESULTADOS_EJECUCION)[number];

export const TAMANO_PAGINA_EJECUCIONES = 20;

// Filtros de la consulta; los ausentes no filtran
export interface FiltroEjecuciones {
  readonly resultado?: ResultadoEjecucion;
  readonly operacion?: string;
  // Busca en el track ID y en la URL
  readonly texto?: string;
  // Desde 1
  readonly pagina: number;
}

export interface PaginaEjecuciones {
  readonly ejecuciones: readonly Ejecucion[];
  // Total que cumple el filtro, para la paginación
  readonly total: number;
  readonly pagina: number;
  readonly totalPaginas: number;
  // Cuántas hay de cada resultado con los demás filtros (sin el de resultado), para las pestañas
  readonly porResultado: Readonly<Record<ResultadoEjecucion, number>>;
}

// Cualquier valor que no sea un entero >= 1 es la primera página
export function normalizarPagina(pagina: number): number {
  return Number.isSafeInteger(pagina) && pagina >= 1 ? pagina : 1;
}

export function esResultadoEjecucion(valor: string): valor is ResultadoEjecucion {
  return (RESULTADOS_EJECUCION as readonly string[]).includes(valor);
}
