import type { CodigoSuper } from "@/core/domain/configuracion-super/codigo-super";
import {
  CodigoCatalogoNoEncontradoError,
  EstadoSuperDuplicadoError,
  ProcesoSuperNoEncontradoError,
  ProcesoSuperYaExisteError,
} from "@/core/domain/configuracion-super/configuracion-super.errors";
import {
  crearNuevoEstadoSuper,
  type EstadoSuper,
  type NuevoEstadoSuper,
} from "@/core/domain/configuracion-super/estado-super";
import { crearProcesoSuper, type ProcesoSuper } from "@/core/domain/configuracion-super/proceso-super";
import { EstadoSuperDao } from "@/core/repository/dao/estado-super.dao";
import { ProcesoSuperDao } from "@/core/repository/dao/proceso-super.dao";
import { StageCodeDao } from "@/core/repository/dao/stage-code.dao";
import { StatusCodeDao } from "@/core/repository/dao/status-code.dao";
import { toEstadoSuper } from "./estado-super.mapper";

export class ConfiguracionSuperService {
  constructor(
    private readonly procesoSuperDao = new ProcesoSuperDao(),
    private readonly estadoSuperDao = new EstadoSuperDao(),
    private readonly stageCodeDao = new StageCodeDao(),
    private readonly statusCodeDao = new StatusCodeDao(),
  ) { }

  async listarStageCodes(): Promise<CodigoSuper[]> {
    const codigos = await this.stageCodeDao.listar();
    return codigos.map(({ code, value }) => ({ code, value }));
  }

  async listarStatusCodes(): Promise<CodigoSuper[]> {
    const codigos = await this.statusCodeDao.listar();
    return codigos.map(({ code, value }) => ({ code, value }));
  }

  // Distingue un proceso SUPER sin estados (lista vacía) de uno que no existe (error)
  async listarEstados(procesoSuperCodigo: string): Promise<EstadoSuper[]> {
    if (!(await this.procesoSuperDao.existe(procesoSuperCodigo))) {
      throw new ProcesoSuperNoEncontradoError(procesoSuperCodigo);
    }
    const estados = await this.estadoSuperDao.listarConCatalogosPorProceso(procesoSuperCodigo);
    return estados.map(toEstadoSuper);
  }

  async crearProcesoSuper(datos: ProcesoSuper): Promise<ProcesoSuper> {
    const procesoSuper = crearProcesoSuper(datos);
    if (await this.procesoSuperDao.existe(procesoSuper.codigo)) {
      throw new ProcesoSuperYaExisteError(procesoSuper.codigo);
    }
    const { codigo, nombre } = await this.procesoSuperDao.crear(procesoSuper);
    return { codigo, nombre };
  }

  /**
   * Crea una séxtupla en el proceso SUPER, sin asignarla a ninguna actividad.
   * stageCode y statusCode deben existir en sus catálogos y code no puede repetirse en el proceso.
   */
  async crearEstado(datos: NuevoEstadoSuper): Promise<EstadoSuper> {
    const estado = crearNuevoEstadoSuper(datos);
    if (!(await this.procesoSuperDao.existe(estado.procesoSuperCodigo))) {
      throw new ProcesoSuperNoEncontradoError(estado.procesoSuperCodigo);
    }
    if (!(await this.stageCodeDao.existe(estado.stageCode))) {
      throw new CodigoCatalogoNoEncontradoError("stageCode", estado.stageCode);
    }
    if (!(await this.statusCodeDao.existe(estado.statusCode))) {
      throw new CodigoCatalogoNoEncontradoError("statusCode", estado.statusCode);
    }
    if (await this.estadoSuperDao.existeCodeEnProceso(estado.procesoSuperCodigo, estado.code)) {
      throw new EstadoSuperDuplicadoError(estado.procesoSuperCodigo, estado.code);
    }

    const { id } = await this.estadoSuperDao.crear(estado);
    const creado = await this.estadoSuperDao.buscarConCatalogos(id);
    if (!creado) throw new Error(`No se encontró el estado SUPER ${id} recién creado`);
    return toEstadoSuper(creado);
  }
}
