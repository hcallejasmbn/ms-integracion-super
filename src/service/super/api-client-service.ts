import { EnvConfig } from "@/config/env.config";
import { LogEjecucionDao } from "@/core/repository/dao/log-ejecucion.dao";
import { MiSuperApiError } from "./model/mi-super-api.error";
import type { TokenMiSuperRequest } from "./model/token-mi-super.request";
import type { TokenMiSuperResponse } from "./model/token-mi-super.response";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Identifica la operación en log_ejecucion. Sin traza, las llamadas no se registran
export interface Traza {
  trackId: string;
  operacion: string;
}

export class ApiClientService {
  constructor(private readonly logEjecucionDao = new LogEjecucionDao()) { }

  private async getTokenMiSuper(traza?: Traza): Promise<string> {
    const tokenRequest: TokenMiSuperRequest = {
      api_key: EnvConfig.miSuperApiKey,
      chile_atiende_id: EnvConfig.miSuperChileAtiendeId,
    };

    const { response, text } = await this.fetchConTraza(
      EnvConfig.miSuperUrlToken,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tokenRequest),
      },
      // Ni la api key ni el token llegan al log
      traza && { trackId: traza.trackId, operacion: "OBTENER_TOKEN" },
      { ...tokenRequest, api_key: "***" },
      ocultarToken,
    );

    if (!response.ok) {
      throw new MiSuperApiError(response.status, text);
    }

    const body: TokenMiSuperResponse = JSON.parse(text);
    return body.token;
  }

  private createHeadersToken(token: string): HeadersInit {
    return {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
  }

  async getResponse<T>(uri: string, httpMethod: HttpMethod, request: RequestInit, traza?: Traza): Promise<T> {
    const requestJson = typeof request.body === "string" ? JSON.parse(request.body) : undefined;
    const { response, text } = await this.fetchConTraza(uri, { ...request, method: httpMethod }, traza, requestJson);

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
  async createRequest<T>(requestJson?: T, traza?: Traza): Promise<RequestInit> {
    const headers = this.createHeadersToken(await this.getTokenMiSuper(traza));

    if (requestJson === undefined || requestJson === null || requestJson === "") {
      return { headers };
    }

    return { headers, body: JSON.stringify(requestJson) };
  }

  // Hace la llamada y, si hay traza, la registra en log_ejecucion con su resultado y duración
  private async fetchConTraza(
    url: string,
    init: RequestInit,
    traza: Traza | undefined,
    requestJson: unknown,
    enmascararRespuesta: (text: string) => string = (text) => text,
  ): Promise<{ response: Response; text: string }> {
    const inicio = Date.now();
    const base = { url, metodo: init.method ?? "GET", requestJson };

    try {
      const response = await fetch(url, init);
      const text = await response.text();
      await this.registrar(traza, {
        ...base,
        responseStatus: response.status,
        responseBody: enmascararRespuesta(text),
        resultado: response.ok ? "OK" : "ERROR",
        duracionMs: Date.now() - inicio,
      });
      return { response, text };
    } catch (error) {
      // Sin respuesta HTTP: timeout, DNS, conexión rechazada
      await this.registrar(traza, {
        ...base,
        error: error instanceof Error ? error.message : String(error),
        resultado: "ERROR",
        duracionMs: Date.now() - inicio,
      });
      throw error;
    }
  }

  // Un fallo al escribir el log no debe interrumpir la llamada a Mi Súper
  private async registrar(
    traza: Traza | undefined,
    datos: Omit<Parameters<LogEjecucionDao["crear"]>[0], "trackId" | "operacion">,
  ): Promise<void> {
    if (!traza) return;
    try {
      await this.logEjecucionDao.crear({ ...datos, trackId: traza.trackId, operacion: traza.operacion });
    } catch (error) {
      console.error("No se pudo registrar la llamada en log_ejecucion", { trackId: traza.trackId, error });
    }
  }
}

// Reemplaza el valor de "token" en la respuesta de Mi Súper; si no es JSON la deja igual
function ocultarToken(text: string): string {
  try {
    const body: unknown = JSON.parse(text);
    if (body && typeof body === "object" && "token" in body) {
      return JSON.stringify({ ...body, token: "***" });
    }
  } catch {
    // El cuerpo no es JSON
  }
  return text;
}
