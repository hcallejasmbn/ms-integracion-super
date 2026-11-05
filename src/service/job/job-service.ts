import { ActividadEstadoSuperDao } from "@/core/repository/dao/actividad-estado-super.dao";
import {
  CargaActividadExpedienteDao,
  type CargaConActividadEntity,
} from "@/core/repository/dao/carga-actividad-expediente.dao";
import {
  ExpedienteTramitandoDao,
  type ExpedienteTramitandoConActividadEntity,
} from "@/core/repository/dao/expediente-tramitando.dao";
import type { EstadoSuperEntity } from "@/core/repository/entity/estado-super.entity";

// Movimiento que cambió de actividad y el estado SUPER que se informará.
// estadoSuper es undefined si la actividad no tiene estado configurado
export interface CambioActividad {
  readonly movimiento: CargaConActividadEntity;
  readonly estadoSuper?: EstadoSuperEntity;
}

export class JobService {
  constructor(
    private readonly cargaActividadExpedienteDao = new CargaActividadExpedienteDao(),
    private readonly expedienteTramitandoDao = new ExpedienteTramitandoDao(),
    private readonly actividadEstadoSuperDao = new ActividadEstadoSuperDao(),
  ) { }

  /**
   * Notifica a SUPER los cambios de actividad de los expedientes.
   * Compara por nombre la última actividad cargada de cada expediente con la última registrada
   * en expedientes_tramitando y obtiene el estado SUPER de las que cambiaron. Se compara el nombre
   * y no el id porque el id es interno: un cambio de flujo puede dar otro id a la misma actividad.
   */
  async jobNotificacionSuper(): Promise<CambioActividad[]> {
    const movimientos = await this.cargaActividadExpedienteDao.listarUltimoPorExpediente();
    const cambios = await this.detectarCambios(movimientos);
    return Promise.all(cambios.map((movimiento) => this.obtenerEstadoSuper(movimiento)));
  }

  // Una sola consulta trae la última actividad registrada de todos los expedientes cargados
  private async detectarCambios(
    movimientos: CargaConActividadEntity[],
  ): Promise<CargaConActividadEntity[]> {
    const ultimos = await this.expedienteTramitandoDao.listarUltimosPorExpedientes(
      movimientos.map((movimiento) => movimiento.codigoExpediente),
    );
    return movimientos.filter(actividadConocida).filter(cambioDeActividad(actividadPorExpediente(ultimos)));
  }

  // El estado SUPER sale de la configuración actividades_estados_super de la actividad
  private async obtenerEstadoSuper(movimiento: CargaConActividadEntity): Promise<CambioActividad> {
    const estadoSuper = await this.actividadEstadoSuperDao.buscarEstadoPorActividad(movimiento.actividadId);
    return { movimiento, estadoSuper };
  }
}

function actividadPorExpediente(ultimos: ExpedienteTramitandoConActividadEntity[]): Map<string, string> {
  return new Map(ultimos.map((ultimo) => [ultimo.codigoExpediente, ultimo.actividadNombre]));
}

// Sin nombre no se puede comparar: el actividad_id cargado no existe en actividades
function actividadConocida(movimiento: CargaConActividadEntity): boolean {
  if (movimiento.actividadNombre === null) {
    console.warn("Movimiento con actividad desconocida; se omite", {
      codigoExpediente: movimiento.codigoExpediente,
      actividadId: movimiento.actividadId,
    });
    return false;
  }
  return true;
}

// Misma actividad (por nombre): no hay nada que informar. Un expediente sin registros siempre es un cambio
function cambioDeActividad(actividades: Map<string, string>): (movimiento: CargaConActividadEntity) => boolean {
  return (movimiento) => actividades.get(movimiento.codigoExpediente) !== movimiento.actividadNombre;
}
