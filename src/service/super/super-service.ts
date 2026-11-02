import { EnvConfig } from "@/config/env.config";
import type { NuevaSolicitud, SolicitudCreada } from "@/core/domain/solicitud/solicitud";
import { MiSuperNoDisponibleError, SolicitudRechazadaError } from "@/core/domain/solicitud/solicitud.errors";
import { SolicitudSuperDao } from "@/core/repository/dao/solicitud-super.dao";
import { ApiClientService, type Traza } from "./api-client-service";
import type { CrearSolicitudResponse } from "./model/crear-solicitud-response";
import { MiSuperApiError } from "./model/mi-super-api.error";
import { toCrearSolicitudRequest, toSolicitudCreada } from "./solicitud.mapper";

export class SuperService {
  constructor(
    private readonly apiClientService = new ApiClientService(),
    private readonly solicitudSuperDao = new SolicitudSuperDao(),
  ) { }

  // Un expediente tiene una sola solicitud en Mi Súper
  async existeSolicitud(idSolicitudServicio: string): Promise<boolean> {
    return (await this.solicitudSuperDao.buscarPorCodigoExpediente(idSolicitudServicio)) !== undefined;
  }

  /**
   * Crea la solicitud en Mi Súper y guarda la relación expediente ⇄ ms_application_id.
   * Cada llamada HTTP queda en log_ejecucion con el trackId recibido.
   */
  async crearSolicitud(solicitud: NuevaSolicitud, trackId: string): Promise<SolicitudCreada> {
    const crearSolicitudRequest = toCrearSolicitudRequest(solicitud, EnvConfig.miSuperChileAtiendeId);
    const traza: Traza = { trackId, operacion: "CREAR_SOLICITUD" };

    let request: RequestInit;
    try {
      request = await this.apiClientService.createRequest(crearSolicitudRequest, traza);
    } catch (error) {
      // Si falla el token, el problema es de credenciales o de Mi Súper, no de la solicitud
      if (error instanceof MiSuperApiError) {
        throw new MiSuperNoDisponibleError(`Mi Súper no entregó el token (estado ${error.status})`);
      }
      throw error;
    }

    let solicitudCreada: SolicitudCreada;
    try {
      const response = await this.apiClientService.getResponse<CrearSolicitudResponse>(
        EnvConfig.miSuperEndpointSolicitud,
        "POST",
        request,
        traza,
      );
      solicitudCreada = toSolicitudCreada(response);
    } catch (error) {
      if (error instanceof MiSuperApiError) {
        throw error.status < 500
          ? new SolicitudRechazadaError(mensajeDeMiSuper(error.body))
          : new MiSuperNoDisponibleError(`Mi Súper respondió con estado ${error.status}`);
      }
      throw error;
    }

    // Si esto falla, el ms_application_id igual queda en la respuesta registrada en log_ejecucion
    await this.solicitudSuperDao.crear({
      codigoExpediente: solicitud.idSolicitudServicio,
      msApplicationId: solicitudCreada.idSolicitudMiSuper,
      trackId,
    });
    return solicitudCreada;
  }

  async updateSolicitud(): Promise<String> {
    return "null";
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
