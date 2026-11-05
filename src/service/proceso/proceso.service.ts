import type { Actividad, ActividadConEstadoSuper, Proceso } from "@/core/domain/proceso/proceso";
import { ProcesoNoEncontradoError } from "@/core/domain/proceso/proceso.errors";
import { ActividadDao } from "@/core/repository/dao/actividad.dao";
import { ProcesoDao } from "@/core/repository/dao/proceso.dao";
import { toEstadoSuper } from "../configuracion-super/estado-super.mapper";

export class ProcesoService {
  constructor(
    private readonly procesoDao = new ProcesoDao(),
    private readonly actividadDao = new ActividadDao(),
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
    return actividades.map(({ id, nombre, procesoCodigo, configuracionSuper }) => ({
      actividad: { id, nombre, procesoCodigo },
      estadoSuper: configuracionSuper ? toEstadoSuper(configuracionSuper.estadoSuper) : null,
    }));
  }
}
