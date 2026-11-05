import type { Actividad, ActividadConEstadoSuper, Proceso } from "@/core/domain/proceso/proceso";
import {
  EstadoSuperNoEncontradoError,
  EstadoSuperYaAsignadoError,
} from "@/core/domain/configuracion-super/configuracion-super.errors";
import { ActividadNoEncontradaError, ProcesoNoEncontradoError } from "@/core/domain/proceso/proceso.errors";
import { ActividadDao, type ActividadConEstadoSuper as ActividadConEstadoSuperEntity } from "@/core/repository/dao/actividad.dao";
import { EstadoSuperDao } from "@/core/repository/dao/estado-super.dao";
import { ProcesoDao } from "@/core/repository/dao/proceso.dao";
import { toEstadoSuper } from "../configuracion-super/estado-super.mapper";

export class ProcesoService {
  constructor(
    private readonly procesoDao = new ProcesoDao(),
    private readonly actividadDao = new ActividadDao(),
    private readonly estadoSuperDao = new EstadoSuperDao(),
  ) { }

  async listarProcesos(): Promise<Proceso[]> {
    const procesos = await this.procesoDao.listar();
    return procesos.map(({ codigo, nombre }) => ({ codigo, nombre }));
  }

  // Distingue un proceso sin actividades (lista vacía) de uno que no existe (error)
  async listarActividades(procesoCodigo: string): Promise<Actividad[]> {
    if (!(await this.procesoDao.existe(procesoCodigo))) {
      throw new ProcesoNoEncontradoError(procesoCodigo);
    }
    const actividades = await this.actividadDao.listarPorProceso(procesoCodigo);
    return actividades.map(({ id, nombre, procesoCodigo }) => ({ id, nombre, procesoCodigo }));
  }

  // Todas las actividades del proceso; las que no tienen estado SUPER configurado vienen con null
  async listarEstadosSuper(procesoCodigo: string): Promise<ActividadConEstadoSuper[]> {
    if (!(await this.procesoDao.existe(procesoCodigo))) {
      throw new ProcesoNoEncontradoError(procesoCodigo);
    }
    const actividades = await this.actividadDao.listarConEstadoSuperPorProceso(procesoCodigo);
    return actividades.map(toActividadConEstadoSuper);
  }

  /**
   * Asigna un estado SUPER existente a la actividad y reemplaza el que tuviera.
   * La relación es 1:1: si el estado ya pertenece a otra actividad, falla.
   */
  async asignarEstadoSuper(actividadId: number, estadoSuperId: number): Promise<ActividadConEstadoSuper> {
    if (!(await this.actividadDao.existe(actividadId))) {
      throw new ActividadNoEncontradaError(actividadId);
    }
    if (!(await this.estadoSuperDao.existe(estadoSuperId))) {
      throw new EstadoSuperNoEncontradoError(estadoSuperId);
    }
    const asignada = await this.actividadDao.buscarPorEstadoSuper(estadoSuperId);
    if (asignada && asignada.id !== actividadId) {
      throw new EstadoSuperYaAsignadoError(estadoSuperId, asignada.id);
    }

    await this.actividadDao.asignarEstadoSuper(actividadId, estadoSuperId);
    const actividad = await this.actividadDao.buscarConEstadoSuper(actividadId);
    if (!actividad) throw new ActividadNoEncontradaError(actividadId);
    return toActividadConEstadoSuper(actividad);
  }
}

function toActividadConEstadoSuper({
  id,
  nombre,
  procesoCodigo,
  estadoSuper,
}: ActividadConEstadoSuperEntity): ActividadConEstadoSuper {
  return { actividad: { id, nombre, procesoCodigo }, estadoSuper: estadoSuper ? toEstadoSuper(estadoSuper) : null };
}
