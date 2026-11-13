import {
  esResultadoEjecucion,
  normalizarPagina,
  TAMANO_PAGINA_EJECUCIONES,
  type Ejecucion,
  type FiltroEjecuciones,
  type PaginaEjecuciones,
} from "@/core/domain/traza/ejecucion";
import { crearRangoLimpieza, type RangoLimpieza } from "@/core/domain/traza/limpieza";
import { EjecucionNoEncontradaError } from "@/core/domain/traza/traza.errors";
import { hoyEnZonaHoraria, ZONA_HORARIA } from "@/core/domain/zona-horaria";
import { LogEjecucionDao } from "@/core/repository/dao/log-ejecucion.dao";
import type { LogEjecucionEntity } from "@/core/repository/entity/log-ejecucion.entity";

// Consulta y limpieza de la traza de llamadas a SUPER (log_ejecucion). Las filas las escribe ApiClientService
export class TrazaService {
  constructor(
    private readonly logEjecucionDao = new LogEjecucionDao(),
    // Hoy (YYYY-MM-DD) en la zona horaria del Ministerio; los tests pueden fijarlo
    private readonly hoy: () => string = hoyEnZonaHoraria,
  ) { }

  // Valida el rango (días en la zona horaria del Ministerio) y cuenta cuántas trazas se eliminarían
  async contarParaLimpieza(desde: string, hasta: string): Promise<{ rango: RangoLimpieza; cantidad: number }> {
    const rango = crearRangoLimpieza(desde, hasta, this.hoy());
    const cantidad = await this.logEjecucionDao.contarEntreDias(rango.desde, rango.hasta, ZONA_HORARIA);
    return { rango, cantidad };
  }

  // Elimina las trazas del rango (ambos días incluidos) y devuelve cuántas se eliminaron. No se puede deshacer
  async limpiar(desde: string, hasta: string): Promise<{ rango: RangoLimpieza; eliminadas: number }> {
    const rango = crearRangoLimpieza(desde, hasta, this.hoy());
    const eliminadas = await this.logEjecucionDao.eliminarEntreDias(rango.desde, rango.hasta, ZONA_HORARIA);
    return { rango, eliminadas };
  }

  // Fecha de la traza más antigua y de la más reciente, para orientar la limpieza
  async rangoFechas(): Promise<{ primera: Date | null; ultima: Date | null }> {
    return this.logEjecucionDao.rangoFechas();
  }

  // Página de ejecuciones (de la más reciente a la más antigua) y cuántas hay de cada resultado
  async listarEjecuciones(filtro: FiltroEjecuciones): Promise<PaginaEjecuciones> {
    const texto = filtro.texto?.trim() || undefined;
    const sinResultado = { operacion: filtro.operacion || undefined, texto };
    const porResultado = await this.logEjecucionDao.contarPorResultado(sinResultado);
    const conteo = { OK: porResultado.OK ?? 0, ERROR: porResultado.ERROR ?? 0 };

    const total = filtro.resultado ? conteo[filtro.resultado] : conteo.OK + conteo.ERROR;
    const totalPaginas = Math.max(1, Math.ceil(total / TAMANO_PAGINA_EJECUCIONES));
    // Una página fuera de rango muestra la última
    const pagina = Math.min(normalizarPagina(filtro.pagina), totalPaginas);

    const filas = await this.logEjecucionDao.listar(
      { ...sinResultado, resultado: filtro.resultado },
      TAMANO_PAGINA_EJECUCIONES,
      (pagina - 1) * TAMANO_PAGINA_EJECUCIONES,
    );
    return { ejecuciones: filas.map(toEjecucion), total, pagina, totalPaginas, porResultado: conteo };
  }

  async obtenerEjecucion(id: number): Promise<Ejecucion> {
    const registro = await this.logEjecucionDao.buscar(id);
    if (!registro) {
      throw new EjecucionNoEncontradaError(id);
    }
    return toEjecucion(registro);
  }

  // Todas las llamadas de una misma operación (por ejemplo el token y la creación de una solicitud)
  async listarPorTrackId(trackId: string): Promise<Ejecucion[]> {
    const filas = await this.logEjecucionDao.listarPorTrackId(trackId);
    return filas.map(toEjecucion);
  }

  async listarOperaciones(): Promise<string[]> {
    return this.logEjecucionDao.listarOperaciones();
  }
}

function toEjecucion(registro: LogEjecucionEntity): Ejecucion {
  return {
    id: registro.id,
    trackId: registro.trackId,
    operacion: registro.operacion,
    intento: registro.intento,
    url: registro.url,
    metodo: registro.metodo,
    request: registro.requestJson ?? null,
    responseStatus: registro.responseStatus,
    responseBody: registro.responseBody,
    error: registro.error,
    // La columna es varchar: cualquier valor distinto de OK se muestra como error
    resultado: esResultadoEjecucion(registro.resultado) ? registro.resultado : "ERROR",
    fechaInicio: registro.fechaInicio,
    duracionMs: registro.duracionMs,
  };
}
