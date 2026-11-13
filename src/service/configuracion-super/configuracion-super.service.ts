import type { CodigoSuper } from "@/core/domain/configuracion-super/codigo-super";
import type { TipoSuper } from "@/core/domain/configuracion-super/tipo-super";
import {
  CodigoCatalogoNoEncontradoError,
  EstadoSuperDuplicadoError,
  EstadoSuperNoEncontradoError,
} from "@/core/domain/configuracion-super/configuracion-super.errors";
import {
  crearNuevoEstadoSuper,
  type DatosEstadoSuper,
  type EstadoSuper,
  type NuevoEstadoSuper,
} from "@/core/domain/configuracion-super/estado-super";
import { ProcesoNoEncontradoError } from "@/core/domain/proceso/proceso.errors";
import { EstadoSuperDao } from "@/core/repository/dao/estado-super.dao";
import { ProcesoDao } from "@/core/repository/dao/proceso.dao";
import { StageCodeDao } from "@/core/repository/dao/stage-code.dao";
import { StatusCodeDao } from "@/core/repository/dao/status-code.dao";
import { TypeResponsibleDao } from "@/core/repository/dao/type-responsible.dao";
import { TypeWorksDaysDao } from "@/core/repository/dao/type-works-days.dao";
import { toEstadoSuper } from "./estado-super.mapper";

export class ConfiguracionSuperService {
  constructor(
    private readonly procesoDao = new ProcesoDao(),
    private readonly estadoSuperDao = new EstadoSuperDao(),
    private readonly stageCodeDao = new StageCodeDao(),
    private readonly statusCodeDao = new StatusCodeDao(),
    private readonly typeWorksDaysDao = new TypeWorksDaysDao(),
    private readonly typeResponsibleDao = new TypeResponsibleDao(),
  ) { }

  async listarStageCodes(): Promise<CodigoSuper[]> {
    const codigos = await this.stageCodeDao.listar();
    return codigos.map(({ code, value }) => ({ code, value }));
  }

  async listarStatusCodes(): Promise<CodigoSuper[]> {
    const codigos = await this.statusCodeDao.listar();
    return codigos.map(({ code, value }) => ({ code, value }));
  }

  async listarTiposDias(): Promise<TipoSuper[]> {
    const tipos = await this.typeWorksDaysDao.listar();
    return tipos.map(({ code, descripcion }) => ({ code, descripcion }));
  }

  async listarTiposResponsable(): Promise<TipoSuper[]> {
    const tipos = await this.typeResponsibleDao.listar();
    return tipos.map(({ code, descripcion }) => ({ code, descripcion }));
  }

  // Distingue un proceso sin estados SUPER (lista vacía) de uno que no existe (error)
  async listarEstados(procesoCodigo: string): Promise<EstadoSuper[]> {
    if (!(await this.procesoDao.existe(procesoCodigo))) {
      throw new ProcesoNoEncontradoError(procesoCodigo);
    }
    const estados = await this.estadoSuperDao.listarConCatalogosPorProceso(procesoCodigo);
    return estados.map(toEstadoSuper);
  }

  /**
   * Crea una séxtupla en el proceso, sin asignarla a ninguna actividad.
   * stageCode, statusCode, useWorkingDays y responsibleType deben existir en sus catálogos y code no puede repetirse en el proceso.
   */
  async crearEstado(datos: NuevoEstadoSuper): Promise<EstadoSuper> {
    const estado = crearNuevoEstadoSuper(datos);
    if (!(await this.procesoDao.existe(estado.procesoCodigo))) {
      throw new ProcesoNoEncontradoError(estado.procesoCodigo);
    }
    await this.validarEstado(estado);

    const { id } = await this.estadoSuperDao.crear(estado);
    return this.obtenerEstado(id);
  }

  // Modifica los campos de una séxtupla con las mismas reglas que al crearla; el proceso no cambia
  async actualizarEstado(id: number, datos: DatosEstadoSuper): Promise<EstadoSuper> {
    const actual = await this.estadoSuperDao.buscar(id);
    if (!actual) {
      throw new EstadoSuperNoEncontradoError(id);
    }
    const { procesoCodigo, ...estado } = crearNuevoEstadoSuper({ ...datos, procesoCodigo: actual.procesoCodigo });
    await this.validarEstado({ procesoCodigo, ...estado }, id);

    await this.estadoSuperDao.actualizar(id, estado);
    return this.obtenerEstado(id);
  }

  // Catálogos y code único en el proceso (excluirId omite el propio estado al modificarlo)
  private async validarEstado(estado: NuevoEstadoSuper, excluirId?: number): Promise<void> {
    if (!(await this.stageCodeDao.existe(estado.stageCode))) {
      throw new CodigoCatalogoNoEncontradoError("stageCode", estado.stageCode);
    }
    if (!(await this.statusCodeDao.existe(estado.statusCode))) {
      throw new CodigoCatalogoNoEncontradoError("statusCode", estado.statusCode);
    }
    if (!(await this.typeWorksDaysDao.existe(estado.useWorkingDays))) {
      throw new CodigoCatalogoNoEncontradoError("useWorkingDays", estado.useWorkingDays);
    }
    if (!(await this.typeResponsibleDao.existe(estado.responsibleType))) {
      throw new CodigoCatalogoNoEncontradoError("responsibleType", estado.responsibleType);
    }
    if (await this.estadoSuperDao.existeCodeEnProceso(estado.procesoCodigo, estado.code, excluirId)) {
      throw new EstadoSuperDuplicadoError(estado.procesoCodigo, estado.code);
    }
  }

  private async obtenerEstado(id: number): Promise<EstadoSuper> {
    const estado = await this.estadoSuperDao.buscarConCatalogos(id);
    if (!estado) throw new EstadoSuperNoEncontradoError(id);
    return toEstadoSuper(estado);
  }
}
