import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientService } from "@/service/super/api-client-service";
import type { CrearSolicitudResponse } from "@/service/super/model/crear-solicitud-response";

const ENDPOINT_TOKEN = "https://misuper.test/api/v1/api-token-auth";
const ENDPOINT_SOLICITUD = "https://misuper.test/api/v1/applications/";
const API_KEY = "api-key-test";
const CHILE_ATIENDE_ID = "chile-atiende-id-test";
const TOKEN = "token-test";

const headers: HeadersInit = { "Content-Type": "application/json", Authorization: `Token ${TOKEN}` };

describe("ApiClientService.createRequest", () => {
  const fetch = vi.fn();
  let apiClientService: ApiClientService;

  beforeEach(() => {
    vi.stubEnv("MISUPER_ENDPOINT_TOKEN", ENDPOINT_TOKEN);
    vi.stubEnv("MISUPER_API_KEY", API_KEY);
    vi.stubEnv("MISUPER_CHILE_ATIENDE_ID", CHILE_ATIENDE_ID);
    fetch.mockReset().mockImplementation(async () => Response.json({ token: TOKEN }));
    vi.stubGlobal("fetch", fetch);
    apiClientService = new ApiClientService();
  });

  it("pide el token con la api key y el id de ChileAtiende y devuelve solo los headers", async () => {
    await expect(apiClientService.createRequest()).resolves.toEqual({ headers });

    expect(fetch).toHaveBeenCalledWith(ENDPOINT_TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: API_KEY, chile_atiende_id: CHILE_ATIENDE_ID }),
    });
  });

  it("agrega el objeto recibido como body en formato JSON", async () => {
    const datos = { service_id: "1", procedure_id: "2" };

    await expect(apiClientService.createRequest(datos)).resolves.toEqual({ headers, body: JSON.stringify(datos) });
  });

  it("no agrega body cuando recibe un texto vacío", async () => {
    await expect(apiClientService.createRequest("")).resolves.toEqual({ headers });
  });

  it("no agrega body cuando recibe null", async () => {
    await expect(apiClientService.createRequest(null)).resolves.toEqual({ headers });
  });

  it("lanza el estado y el detalle cuando Mi Súper no entrega el token", async () => {
    fetch.mockResolvedValue(new Response('{"detail":"credencial inválida"}', { status: 401 }));

    await expect(apiClientService.createRequest()).rejects.toMatchObject({
      status: 401,
      body: '{"detail":"credencial inválida"}',
    });
  });

  it("no pide el token si falta MISUPER_API_KEY", async () => {
    vi.stubEnv("MISUPER_API_KEY", "");

    await expect(apiClientService.createRequest()).rejects.toThrow("Falta la variable de entorno MISUPER_API_KEY");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("no pide el token si falta MISUPER_CHILE_ATIENDE_ID", async () => {
    vi.stubEnv("MISUPER_CHILE_ATIENDE_ID", "");

    await expect(apiClientService.createRequest()).rejects.toThrow(
      "Falta la variable de entorno MISUPER_CHILE_ATIENDE_ID",
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("ApiClientService.getResponse", () => {
  const request: RequestInit = { headers, body: '{"service_id":"1"}' };
  const fetch = vi.fn();
  const consoleError = vi.fn();
  let apiClientService: ApiClientService;

  beforeEach(() => {
    fetch.mockReset();
    consoleError.mockReset();
    vi.stubGlobal("fetch", fetch);
    vi.stubGlobal("console", { ...console, error: consoleError });
    apiClientService = new ApiClientService();
  });

  it("devuelve el JSON de la respuesta y usa el método HTTP indicado", async () => {
    const respuesta: CrearSolicitudResponse = {
      status: "OK",
      ms_application_id: 1494624,
      message: "La solicitud de permiso se ha creado con éxito",
    };
    fetch.mockResolvedValue(Response.json(respuesta));

    await expect(apiClientService.getResponse(ENDPOINT_SOLICITUD, "POST", request)).resolves.toEqual(respuesta);

    expect(fetch).toHaveBeenCalledWith(ENDPOINT_SOLICITUD, { ...request, method: "POST" });
  });

  it("devuelve undefined cuando la respuesta viene sin contenido", async () => {
    fetch.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiClientService.getResponse(ENDPOINT_SOLICITUD, "GET", { headers })).resolves.toBeUndefined();
  });

  it("registra el error sin los headers del token cuando la respuesta no es exitosa", async () => {
    fetch.mockResolvedValue(new Response('{"detail":"inválido"}', { status: 400 }));

    await expect(apiClientService.getResponse(ENDPOINT_SOLICITUD, "POST", request)).rejects.toMatchObject({
      status: 400,
      body: '{"detail":"inválido"}',
    });

    expect(consoleError).toHaveBeenCalledWith("Error al obtener la respuesta", {
      uri: ENDPOINT_SOLICITUD,
      httpMethod: "POST",
      status: 400,
      body: '{"detail":"inválido"}',
    });
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(TOKEN);
  });
});
