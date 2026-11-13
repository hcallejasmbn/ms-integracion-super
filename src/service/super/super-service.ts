import { EnvConfig } from "@/config/env.config";
import type {
  ActualizacionSolicitud,
  NuevaSolicitud,
  SolicitudActualizada,
  SolicitudCreada,
} from "@/core/domain/solicitud/solicitud";
import { ProcesoNoEncontradoError, ProcesoSinCodigoSuperError } from "@/core/domain/proceso/proceso.errors";
import { MiSuperNoDisponibleError, SolicitudRechazadaError } from "@/core/domain/solicitud/solicitud.errors";
import { ProcesoDao } from "@/core/repository/dao/proceso.dao";
import { SolicitudSuperDao } from "@/core/repository/dao/solicitud-super.dao";
import { ApiClientService, type Traza } from "./api-client-service";
import type { ActualizarSolicitudResponse } from "./model/actualizar-solicitud-response";
import type { CrearSolicitudResponse } from "./model/crear-solicitud-response";
import { MiSuperApiError } from "./model/mi-super-api.error";
import { toActualizarSolicitudRequest, toCrearSolicitudRequest, toSolicitudCreada } from "./solicitud.mapper";

export class SuperService {
  constructor(
    private readonly apiClientService = new ApiClientService(),
    private readonly solicitudSuperDao = new SolicitudSuperDao(),
    private readonly procesoDao = new ProcesoDao(),
  ) { }

  /**
   * Comprueba que el proceso exista y tenga codigo_super, para rechazar la solicitud antes de aceptarla.
   * crearSolicitud lo vuelve a resolver al enviarla, por si el proceso cambió entremedio.
   */
  async verificarProceso(codigoProceso: string): Promise<void> {
    await this.obtenerCodigoSuper(codigoProceso);
  }

  // Un expediente tiene una sola solicitud en Mi Súper
  async existeSolicitud(idSolicitudServicio: string): Promise<boolean> {
    return (await this.solicitudSuperDao.buscarPorCodigoExpediente(idSolicitudServicio)) !== undefined;
  }

  /**
   * Crea la solicitud en Mi Súper y guarda la relación expediente ⇄ ms_application_id.
   * El trámite (procedure_id) es el codigo_super del proceso de la solicitud.
   * Cada llamada HTTP queda en log_ejecucion con el trackId recibido.
   */
  async crearSolicitud(solicitud: NuevaSolicitud, trackId: string): Promise<SolicitudCreada> {
    const codigoSuper = await this.obtenerCodigoSuper(solicitud.codigoProceso);
    const crearSolicitudRequest = toCrearSolicitudRequest(solicitud, codigoSuper);
    const traza: Traza = { trackId, operacion: "CREAR_SOLICITUD" };

    const request = await this.crearRequest(crearSolicitudRequest, traza);
    const response = await this.enviar<CrearSolicitudResponse>(EnvConfig.miSuperUrlApplications, request, traza);
    const solicitudCreada = toSolicitudCreada(response);

    // Si esto falla, el ms_application_id igual queda en la respuesta registrada en log_ejecucion
    await this.solicitudSuperDao.crear({
      codigoExpediente: solicitud.idSolicitudServicio,
      msApplicationId: solicitudCreada.idSolicitudMiSuper,
      trackId,
    });
    return solicitudCreada;
  }

  /**
   * Informa a Mi Súper las tareas de una solicitud ya creada (POST {PATH_APPLICATIONS_SUPER}{ms_application_id}).
   * No se expone como API: la usará el proceso que detecta cambios de actividad.
   * Cada llamada HTTP queda en log_ejecucion con el trackId recibido.
   */
  async actualizarSolicitud(
    idSolicitudMiSuper: number,
    actualizacion: ActualizacionSolicitud,
    trackId: string,
  ): Promise<SolicitudActualizada> {
    const traza: Traza = { trackId, operacion: "ACTUALIZAR_SOLICITUD" };
    const url = new URL(String(idSolicitudMiSuper), EnvConfig.miSuperUrlApplications);

    const request = await this.crearRequest(toActualizarSolicitudRequest(actualizacion), traza);
    const response = await this.enviar<ActualizarSolicitudResponse | undefined>(url.toString(), request, traza);
    return { idSolicitudMiSuper, mensaje: response?.message };
  }

  private async obtenerCodigoSuper(codigoProceso: string): Promise<string> {
    const proceso = await this.procesoDao.buscar(codigoProceso);
    if (!proceso) {
      throw new ProcesoNoEncontradoError(codigoProceso);
    }
    if (!proceso.codigoSuper) {
      throw new ProcesoSinCodigoSuperError(codigoProceso);
    }
    return proceso.codigoSuper;
  }

  private async crearRequest<T>(body: T, traza: Traza): Promise<RequestInit> {
    try {
      return await this.apiClientService.createRequest(body, traza);
    } catch (error) {
      // Si falla el token, el problema es de credenciales o de Mi Súper, no de la solicitud
      if (error instanceof MiSuperApiError) {
        throw new MiSuperNoDisponibleError(`Mi Súper no entregó el token (estado ${error.status})`);
      }
      throw error;
    }
  }

  // Mi Súper solo recibe POST en estos endpoints; 4xx es rechazo de la solicitud y 5xx, falla de Mi Súper
  private async enviar<T>(url: string, request: RequestInit, traza: Traza): Promise<T> {
    try {
      return await this.apiClientService.getResponse<T>(url, "POST", request, traza);
    } catch (error) {
      if (error instanceof MiSuperApiError) {
        throw error.status < 500
          ? new SolicitudRechazadaError(mensajeDeMiSuper(error.body))
          : new MiSuperNoDisponibleError(`Mi Súper respondió con estado ${error.status}`);
      }
      throw error;
    }
  }
}

// Mi Súper responde {"status":"ERROR","message":"..."}; si el cuerpo no trae mensaje se usa uno genérico
function mensajeDeMiSuper(body: string): string {
  try {
    const parsed: unknown = JSON.parse(body);
    if (parsed && typeof parsed === "object") {
      const { message, detail } = parsed as { message?: unknown; detail?: unknown };
      if (typeof message === "string") return message;
      if (typeof detail === "string") return detail;
    }
  } catch {
    // El cuerpo no es JSON
  }
  return "Mi Súper rechazó la solicitud";
}
