import { EnvConfig } from "@/config/env.config";
import { MiSuperApiError } from "./model/mi-super-api.error";
import type { TokenMiSuperRequest } from "./model/token-mi-super.request";
import type { TokenMiSuperResponse } from "./model/token-mi-super.response";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiClientService {
  private async getTokenMiSuper(): Promise<string> {
    const tokenRequest: TokenMiSuperRequest = {
      api_key: EnvConfig.miSuperApiKey,
      chile_atiende_id: EnvConfig.miSuperChileAtiendeId,
    };

    const response = await fetch(EnvConfig.miSuperEndpointToken, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tokenRequest),
    });

    if (!response.ok) {
      throw new MiSuperApiError(response.status, await response.text());
    }

    const body: TokenMiSuperResponse = await response.json();
    return body.token;
  }

  private createHeadersToken(token: string): HeadersInit {
    return {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
  }

  async getResponse<T>(uri: string, httpMethod: HttpMethod, request: RequestInit): Promise<T> {
    const response = await fetch(uri, { ...request, method: httpMethod });
    const text = await response.text();

    if (!response.ok) {
      // No se registran los headers porque incluyen el token
      console.error("Error al obtener la respuesta", { uri, httpMethod, status: response.status, body: text });
      console.error("Con el siguiente requerimiento", request.body ?? "nulo");
      throw new MiSuperApiError(response.status, text);
    }

    return (text ? JSON.parse(text) : undefined) as T;
  }

  /**
   * Devuelve los headers (con el token de Mi Súper) y el body de la solicitud.
   * Para solicitudes GET sin body, se llama sin argumento.
   */
  async createRequest<T>(requestJson?: T): Promise<RequestInit> {
    const headers = this.createHeadersToken(await this.getTokenMiSuper());

    if (requestJson === undefined || requestJson === null || requestJson === "") {
      return { headers };
    }

    return { headers, body: JSON.stringify(requestJson) };
  }
}
