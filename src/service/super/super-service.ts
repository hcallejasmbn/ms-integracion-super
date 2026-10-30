import { EnvConfig } from "@/config/env.config";
import { ApiClientService } from "./api-client-service";
import type { CrearSolicitudRequest } from "./model/crear-solicitud-request";
import type { CrearSolicitudResponse } from "./model/crear-solicitud-response";

export class SuperService {
  constructor(private readonly apiClientService = new ApiClientService()) { }

  async crearSolicitud(crearSolicitudRequest: CrearSolicitudRequest): Promise<CrearSolicitudResponse> {
    const request = await this.apiClientService.createRequest(crearSolicitudRequest);
    return this.apiClientService.getResponse<CrearSolicitudResponse>(
      EnvConfig.miSuperEndpointSolicitud,
      "POST",
      request,
    );
  }

  async updateSolicitud(): Promise<String> {
    return "null";
  }
}
