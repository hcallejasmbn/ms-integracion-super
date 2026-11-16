import {
  EstadoSuperDeOtroProcesoError,
  EstadoSuperNoEncontradoError,
  EstadoSuperYaAsignadoError,
} from "@/core/domain/configuracion-super/configuracion-super.errors";
import {
  normalizarNombreActividad,
  normalizarCodigoSuper,
  type Actividad,
  type DatosActividad,
  type Proceso,
} from "@/core/domain/proceso/proceso";
import {
  ActividadDuplicadaError,
  ActividadNoEncontradaError,
  ProcesoNoEncontradoError,
} from "@/core/domain/proceso/proceso.errors";
import { ActividadDao, type ActividadConEstadoSuper } from "@/core/repository/dao/actividad.dao";
import { EstadoSuperDao } from "@/core/repository/dao/estado-super.dao";
import { ProcesoDao } from "@/core/repository/dao/proceso.dao";
import type { ProcesoEntity } from "@/core/repository/entity/proceso.entity";
import { toEstadoSuper } from "../configuracion-super/estado-super.mapper";

export class ProcesoService {
  constructor(
    private readonly procesoDao = new ProcesoDao(),
    private readonly actividadDao = new ActividadDao(),
    private readonly estadoSuperDao = new EstadoSuperDao(),
  ) { }

  async listarProcesos(): Promise<Proceso[]> {
    const procesos = await this.procesoDao.listar();
    return procesos.map(toProceso);
  }

  async obtenerProceso(codigo: string): Promise<Proceso> {
    const proceso = await this.procesoDao.buscar(codigo);
    if (!proceso) {
      throw new ProcesoNoEncontradoError(codigo);
    }
    return toProceso(proceso);
  }

  // null o vacío deja el proceso sin código SUPER
  async actualizarCodigoSuper(codigo: string, codigoSuper: string | null): Promise<Proceso> {
    const actualizado = await this.procesoDao.actualizarCodigoSuper(codigo, normalizarCodigoSuper(codigoSuper));
    if (!actualizado) {
      throw new ProcesoNoEncontradoError(codigo);
    }
    return toProceso(actualizado);
  }

  // Cada actividad con su estado SUPER (null si no tiene). Distingue un proceso sin actividades
  // (lista vacía) de uno que no existe (error)
  async listarActividades(procesoCodigo: string): Promise<Actividad[]> {
    if (!(await this.procesoDao.existe(procesoCodigo))) {
      throw new ProcesoNoEncontradoError(procesoCodigo);
    }
    const actividades = await this.actividadDao.listarConEstadoSuperPorProceso(procesoCodigo);
    return actividades.map(toActividad);
  }

  /**
   * Agrega una actividad al final del flujo del proceso. El nombre no puede repetirse en el proceso
   * (la carga diaria identifica la actividad por proceso + nombre) y el estado SUPER, si viene,
   * debe ser del proceso y no estar asignado a otra actividad.
   */
  async crearActividad(procesoCodigo: string, datos: DatosActividad): Promise<Actividad> {
    const nombre = normalizarNombreActividad(datos.nombre);
    if (!(await this.procesoDao.existe(procesoCodigo))) {
      throw new ProcesoNoEncontradoError(procesoCodigo);
    }
    if (await this.actividadDao.existeNombreEnProceso(procesoCodigo, nombre)) {
      throw new ActividadDuplicadaError(procesoCodigo, nombre);
    }
    if (datos.estadoSuperId !== null) {
      await this.validarEstadoSuper(datos.estadoSuperId, procesoCodigo);
    }

    const { id } = await this.actividadDao.crear({
      nombre,
      procesoCodigo,
      estadoSuperId: datos.estadoSuperId,
      debeNotificar: datos.debeNotificar,
    });
    return this.obtenerActividad(id);
  }

  // Cambia el nombre, el estado SUPER (null deja de informar a SUPER) y si la actividad debe notificarse
  async actualizarActividad(id: number, datos: DatosActividad): Promise<Actividad> {
    const nombre = normalizarNombreActividad(datos.nombre);
    const actividad = await this.actividadDao.buscar(id);
    if (!actividad) {
      throw new ActividadNoEncontradaError(id);
    }
    if (await this.actividadDao.existeNombreEnProceso(actividad.procesoCodigo, nombre, id)) {
      throw new ActividadDuplicadaError(actividad.procesoCodigo, nombre);
    }
    if (datos.estadoSuperId !== null) {
      await this.validarEstadoSuper(datos.estadoSuperId, actividad.procesoCodigo, id);
    }

    await this.actividadDao.actualizar(id, { nombre, estadoSuperId: datos.estadoSuperId, debeNotificar: datos.debeNotificar });
    return this.obtenerActividad(id);
  }

  /**
   * Asigna un estado SUPER existente a la actividad y reemplaza el que tuviera.
   * El estado debe ser del mismo proceso que la actividad, y la relación es 1:1:
   * si el estado ya pertenece a otra actividad, falla.
   */
  async asignarEstadoSuper(actividadId: number, estadoSuperId: number): Promise<Actividad> {
    const actividad = await this.actividadDao.buscar(actividadId);
    if (!actividad) {
      throw new ActividadNoEncontradaError(actividadId);
    }
    await this.validarEstadoSuper(estadoSuperId, actividad.procesoCodigo, actividadId);

    await this.actividadDao.asignarEstadoSuper(actividadId, estadoSuperId);
    return this.obtenerActividad(actividadId);
  }

  // El estado debe existir, ser del proceso y no pertenecer a otra actividad (actividadId es la que lo recibe)
  private async validarEstadoSuper(estadoSuperId: number, procesoCodigo: string, actividadId?: number): Promise<void> {
    const estado = await this.estadoSuperDao.buscar(estadoSuperId);
    if (!estado) {
      throw new EstadoSuperNoEncontradoError(estadoSuperId);
    }
    if (estado.procesoCodigo !== procesoCodigo) {
      throw new EstadoSuperDeOtroProcesoError(estadoSuperId, estado.procesoCodigo, procesoCodigo);
    }
    const asignada = await this.actividadDao.buscarPorEstadoSuper(estadoSuperId);
    if (asignada && asignada.id !== actividadId) {
      throw new EstadoSuperYaAsignadoError(estadoSuperId, asignada.id);
    }
  }

  private async obtenerActividad(id: number): Promise<Actividad> {
    const actividad = await this.actividadDao.buscarConEstadoSuper(id);
    if (!actividad) throw new ActividadNoEncontradaError(id);
    return toActividad(actividad);
  }
}

function toProceso({ codigo, nombre, codigoSuper }: ProcesoEntity): Proceso {
  return { codigo, nombre, codigoSuper };
}

function toActividad({ id, nombre, procesoCodigo, estadoSuper, debeNotificar }: ActividadConEstadoSuper): Actividad {
  return { id, nombre, procesoCodigo, estadoSuper: estadoSuper ? toEstadoSuper(estadoSuper) : null, debeNotificar };
}
