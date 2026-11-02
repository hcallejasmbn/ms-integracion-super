import { EnvConfig } from "@/config/env.config";
import type { NuevaSolicitud, SolicitudCreada } from "@/core/domain/solicitud/solicitud";
import { MiSuperNoDisponibleError, SolicitudRechazadaError } from "@/core/domain/solicitud/solicitud.errors";
import { ApiClientService } from "./api-client-service";
import type { CrearSolicitudResponse } from "./model/crear-solicitud-response";
import { MiSuperApiError } from "./model/mi-super-api.error";
import { toCrearSolicitudRequest, toSolicitudCreada } from "./solicitud.mapper";

export class SuperService {
  constructor(private readonly apiClientService = new ApiClientService()) { }

  async crearSolicitud(solicitud: NuevaSolicitud): Promise<SolicitudCreada> {
    const crearSolicitudRequest = toCrearSolicitudRequest(solicitud, EnvConfig.miSuperChileAtiendeId);

    let request: RequestInit;
    try {
      request = await this.apiClientService.createRequest(crearSolicitudRequest);
    } catch (error) {
      // Si falla el token, el problema es de credenciales o de Mi Súper, no de la solicitud
      if (error instanceof MiSuperApiError) {
        throw new MiSuperNoDisponibleError(`Mi Súper no entregó el token (estado ${error.status})`);
      }
      throw error;
    }

    try {
      const response = await this.apiClientService.getResponse<CrearSolicitudResponse>(
        EnvConfig.miSuperEndpointSolicitud,
        "POST",
        request,
      );
      return toSolicitudCreada(response);
    } catch (error) {
      if (error instanceof MiSuperApiError) {
        throw error.status < 500
          ? new SolicitudRechazadaError(mensajeDeMiSuper(error.body))
          : new MiSuperNoDisponibleError(`Mi Súper respondió con estado ${error.status}`);
      }
      throw error;
    }
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
