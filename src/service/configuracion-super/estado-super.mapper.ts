import type { EstadoSuper } from "@/core/domain/configuracion-super/estado-super";
import type { EstadoSuperConCatalogos } from "@/core/repository/dao/estado-super.dao";

export function toEstadoSuper(estado: EstadoSuperConCatalogos): EstadoSuper {
  return {
    id: estado.id,
    procesoSuperCodigo: estado.procesoSuperCodigo,
    code: estado.code,
    stageCode: estado.stageCode,
    stageValue: estado.stageCodeInfo.value,
    status: estado.status,
    statusCode: estado.statusCode,
    statusValue: estado.statusCodeInfo.value,
    subtask: estado.subtask,
    useWorkingDays: estado.useWorkingDays,
    responsibleType: estado.responsibleType,
    suspensionType: estado.suspensionType,
  };
}
