import type { NuevaSolicitud, Persona, SolicitudCreada } from "@/core/domain/solicitud/solicitud";
import type { CrearSolicitudRequest } from "./model/crear-solicitud-request";
import type { CrearSolicitudResponse } from "./model/crear-solicitud-response";
import type { Data } from "./model/data";

// Traduce entre el dominio (camelCase) y el JSON de Mi Súper (snake_case).
// service_id no viene en la solicitud: es el id de ChileAtiende configurado para esta integración
export function toCrearSolicitudRequest(solicitud: NuevaSolicitud, serviceId: string): CrearSolicitudRequest {
  return {
    service_id: serviceId,
    procedure_id: solicitud.tramiteId,
    // Mi Súper espera "" cuando no hay entrada previa
    ms_entry_id: solicitud.entradaId ?? "",
    service_application_id: solicitud.idSolicitudServicio,
    beneficiary_type: solicitud.tipoBeneficiario,
    creator: { type: solicitud.creador.tipo, data: toData(solicitud.creador.datos) },
    petitioner: solicitud.solicitante && toData(solicitud.solicitante),
    petitioner_rut: solicitud.rutSolicitante,
    company_rut: solicitud.rutEmpresa,
    cup: solicitud.cup ?? "",
    region: solicitud.region,
    commune: solicitud.comuna,
    address: solicitud.direccion,
  };
}

export function toSolicitudCreada(response: CrearSolicitudResponse): SolicitudCreada {
  return { idSolicitudMiSuper: response.ms_application_id, mensaje: response.message };
}

function toData(persona: Persona): Data {
  return {
    rut: persona.rut,
    first_name: persona.nombre,
    last_name: persona.apellido,
    email: persona.email,
  };
}
