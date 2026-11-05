import type { EstadoSuper } from "@/core/domain/configuracion-super/estado-super";
import { ProcesoSuperNoEncontradoError } from "@/core/domain/configuracion-super/configuracion-super.errors";
import { EstadoSuperDao } from "@/core/repository/dao/estado-super.dao";
import { ProcesoSuperDao } from "@/core/repository/dao/proceso-super.dao";
import { toEstadoSuper } from "./estado-super.mapper";

export class ConfiguracionSuperService {
  constructor(
    private readonly procesoSuperDao = new ProcesoSuperDao(),
    private readonly estadoSuperDao = new EstadoSuperDao(),
  ) { }

  // Distingue un proceso SUPER sin estados (lista vacía) de uno que no existe (error)
  async listarEstados(procesoSuperCodigo: string): Promise<EstadoSuper[]> {
    if (!(await this.procesoSuperDao.existe(procesoSuperCodigo))) {
      throw new ProcesoSuperNoEncontradoError(procesoSuperCodigo);
    }
    const estados = await this.estadoSuperDao.listarConCatalogosPorProceso(procesoSuperCodigo);
    return estados.map(toEstadoSuper);
  }
}
