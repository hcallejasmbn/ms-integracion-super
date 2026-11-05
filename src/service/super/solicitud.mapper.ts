import type {
  ActualizacionSolicitud,
  Beneficiario,
  Documento,
  NuevaSolicitud,
  Persona,
  SolicitudCreada,
  Tarea,
} from "@/core/domain/solicitud/solicitud";
import type { ActualizarSolicitudRequest } from "./model/actualizar-solicitud-request";
import type { CrearSolicitudRequest } from "./model/crear-solicitud-request";
import type { CrearSolicitudResponse } from "./model/crear-solicitud-response";
import type { Creator } from "./model/creator";
import type { Principal } from "./model/principal";
import type { Document } from "./model/document";
import type { Task } from "./model/task";

// Traduce entre el dominio (camelCase) y el JSON de Mi Súper (snake_case)
export function toCrearSolicitudRequest(solicitud: NuevaSolicitud): CrearSolicitudRequest {
  return {
    procedure_id: solicitud.tramiteId,
    service_application_id: solicitud.idSolicitudServicio,
    principal: toPrincipal(solicitud.beneficiario),
    creator: toCreator(solicitud.creador),
    // Mi Súper espera "" cuando no hay CUP
    cup: solicitud.cup ?? "",
  };
}

export function toSolicitudCreada(response: CrearSolicitudResponse): SolicitudCreada {
  return { idSolicitudMiSuper: response.ms_application_id, mensaje: response.message };
}

export function toActualizarSolicitudRequest(actualizacion: ActualizacionSolicitud): ActualizarSolicitudRequest {
  return { tasks: actualizacion.tareas.map(toTask) };
}

function toTask(tarea: Tarea): Task {
  return {
    code: tarea.codigo,
    reference: tarea.referencia,
    comment: tarea.comentario,
    principal_action_url: tarea.urlAccionPrincipal,
    responsible_id: tarea.idResponsable,
    documents: tarea.documentos?.map(toDocument),
    suspension: tarea.suspension && {
      start_date: tarea.suspension.fechaInicio,
      documents: tarea.suspension.documentos?.map(toDocument),
    },
  };
}

function toDocument(documento: Documento): Document {
  return { type: documento.tipo, url: documento.url, filename: documento.nombreArchivo };
}

function toPrincipal(beneficiario: Beneficiario): Principal {
  return { type: beneficiario.tipo, rut: beneficiario.rut, email: beneficiario.email };
}

function toCreator(persona: Persona): Creator {
  return {
    rut: persona.rut,
    first_name: persona.nombre,
    last_name: persona.apellido,
    email: persona.email,
  };
}
