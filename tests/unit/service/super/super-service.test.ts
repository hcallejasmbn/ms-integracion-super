import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiClientService } from "@/service/super/api-client-service";
import type { CrearSolicitudRequest } from "@/service/super/model/crear-solicitud-request";
import type { CrearSolicitudResponse } from "@/service/super/model/crear-solicitud-response";
import { MiSuperApiError } from "@/service/super/model/mi-super-api.error";
import { SuperService } from "@/service/super/super-service";

const ENDPOINT_SOLICITUD = "https://misuper.test/api/v1/applications/";

const solicitud: CrearSolicitudRequest = {
  service_id: "1",
  procedure_id: "2",
  ms_entry_id: 3,
  service_application_id: "4",
  beneficiary_type: "titular",
  creator: {
    type: "person",
    data: { rut: "11111111-1", first_name: "Juan", last_name: "Pérez", email: "juan@test.cl" },
  },
  petitioner: { rut: "11111111-1", first_name: "Juan", last_name: "Pérez", email: "juan@test.cl" },
  petitioner_rut: "11111111-1",
  company_rut: "76000000-0",
  cup: "CUP-1",
};

describe("SuperService.crearSolicitud", () => {
  const request: RequestInit = { headers: { Authorization: "Token abc" }, body: JSON.stringify(solicitud) };
  const createRequest = vi.fn();
  const getResponse = vi.fn();
  let superService: SuperService;

  beforeEach(() => {
    vi.stubEnv("MISUPER_ENDPOINT_SOLICITUD", ENDPOINT_SOLICITUD);
    createRequest.mockReset().mockResolvedValue(request);
    getResponse.mockReset();
    const apiClientService = { createRequest, getResponse } as unknown as ApiClientService;
    superService = new SuperService(apiClientService);
  });

  it("envía la solicitud por POST al endpoint de solicitudes y devuelve la respuesta", async () => {
    const respuesta: CrearSolicitudResponse = {
      status: "OK",
      ms_application_id: 1494624,
      message: "La solicitud de permiso se ha creado con éxito",
    };
    getResponse.mockResolvedValue(respuesta);

    await expect(superService.crearSolicitud(solicitud)).resolves.toEqual(respuesta);

    expect(createRequest).toHaveBeenCalledWith(solicitud);
    expect(getResponse).toHaveBeenCalledWith(ENDPOINT_SOLICITUD, "POST", request);
  });

  it("propaga el error cuando Mi Súper rechaza la solicitud", async () => {
    getResponse.mockRejectedValue(new MiSuperApiError(400, '{"detail":"inválido"}'));

    await expect(superService.crearSolicitud(solicitud)).rejects.toMatchObject({ status: 400 });
  });

  it("falla sin llamar a Mi Súper si falta MISUPER_ENDPOINT_SOLICITUD", async () => {
    vi.stubEnv("MISUPER_ENDPOINT_SOLICITUD", "");

    await expect(superService.crearSolicitud(solicitud)).rejects.toThrow(
      "Falta la variable de entorno MISUPER_ENDPOINT_SOLICITUD",
    );
    expect(getResponse).not.toHaveBeenCalled();
  });

  it("no envía la solicitud si Mi Súper no entrega el token", async () => {
    createRequest.mockRejectedValue(new MiSuperApiError(401, '{"detail":"credencial inválida"}'));

    await expect(superService.crearSolicitud(solicitud)).rejects.toMatchObject({ status: 401 });
    expect(getResponse).not.toHaveBeenCalled();
  });

  it("entrega el detalle que devuelve Mi Súper al rechazar la solicitud", async () => {
    getResponse.mockRejectedValue(new MiSuperApiError(422, '{"detail":"cup duplicado"}'));

    await expect(superService.crearSolicitud(solicitud)).rejects.toMatchObject({
      name: "MiSuperApiError",
      status: 422,
      body: '{"detail":"cup duplicado"}',
    });
  });
});
