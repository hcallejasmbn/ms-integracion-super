import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NuevaSolicitud } from "@/core/domain/solicitud/solicitud";
import { MiSuperNoDisponibleError, SolicitudRechazadaError } from "@/core/domain/solicitud/solicitud.errors";
import type { ApiClientService } from "@/service/super/api-client-service";
import type { CrearSolicitudRequest } from "@/service/super/model/crear-solicitud-request";
import type { CrearSolicitudResponse } from "@/service/super/model/crear-solicitud-response";
import { MiSuperApiError } from "@/service/super/model/mi-super-api.error";
import { SuperService } from "@/service/super/super-service";

const ENDPOINT_SOLICITUD = "https://misuper.test/api/v1/applications/";
const CHILE_ATIENDE_ID = "AQ999";

const persona = { rut: "11111111-1", nombre: "Juan", apellido: "Pérez", email: "juan@test.cl" };

const solicitud: NuevaSolicitud = {
  tramiteId: "2",
  entradaId: 3,
  idSolicitudServicio: "4",
  tipoBeneficiario: "titular",
  creador: { tipo: "person", datos: persona },
  solicitante: persona,
  rutSolicitante: "11111111-1",
  rutEmpresa: "76000000-0",
  cup: "CUP-1",
};

const personaMiSuper = { rut: "11111111-1", first_name: "Juan", last_name: "Pérez", email: "juan@test.cl" };

const solicitudMiSuper: CrearSolicitudRequest = {
  // Sale de MISUPER_CHILE_ATIENDE_ID, no de la solicitud
  service_id: CHILE_ATIENDE_ID,
  procedure_id: "2",
  ms_entry_id: 3,
  service_application_id: "4",
  beneficiary_type: "titular",
  creator: { type: "person", data: personaMiSuper },
  petitioner: personaMiSuper,
  petitioner_rut: "11111111-1",
  company_rut: "76000000-0",
  cup: "CUP-1",
  region: undefined,
  commune: undefined,
  address: undefined,
};

describe("SuperService.crearSolicitud", () => {
  const request: RequestInit = { headers: { Authorization: "Token abc" }, body: JSON.stringify(solicitudMiSuper) };
  const createRequest = vi.fn();
  const getResponse = vi.fn();
  let superService: SuperService;

  beforeEach(() => {
    vi.stubEnv("MISUPER_ENDPOINT_SOLICITUD", ENDPOINT_SOLICITUD);
    vi.stubEnv("MISUPER_CHILE_ATIENDE_ID", CHILE_ATIENDE_ID);
    createRequest.mockReset().mockResolvedValue(request);
    getResponse.mockReset();
    const apiClientService = { createRequest, getResponse } as unknown as ApiClientService;
    superService = new SuperService(apiClientService);
  });

  it("traduce la solicitud al formato de Mi Súper, la envía por POST y devuelve la solicitud creada", async () => {
    const respuesta: CrearSolicitudResponse = {
      status: "OK",
      ms_application_id: 1494624,
      message: "La solicitud de permiso se ha creado con éxito",
    };
    getResponse.mockResolvedValue(respuesta);

    await expect(superService.crearSolicitud(solicitud)).resolves.toEqual({
      idSolicitudMiSuper: 1494624,
      mensaje: "La solicitud de permiso se ha creado con éxito",
    });

    expect(createRequest).toHaveBeenCalledWith(solicitudMiSuper);
    expect(getResponse).toHaveBeenCalledWith(ENDPOINT_SOLICITUD, "POST", request);
  });

  it("envía ms_entry_id y cup vacíos cuando la solicitud no los trae", async () => {
    getResponse.mockResolvedValue({ status: "OK", ms_application_id: 1, message: "ok" });
    const { entradaId: _, cup: __, ...sinOpcionales } = solicitud;

    await superService.crearSolicitud(sinOpcionales);

    expect(createRequest).toHaveBeenCalledWith(expect.objectContaining({ ms_entry_id: "", cup: "" }));
  });

  it("convierte el rechazo de Mi Súper en SolicitudRechazadaError con su mensaje", async () => {
    getResponse.mockRejectedValue(new MiSuperApiError(400, '{"status":"ERROR","message":"No proporcionó el \'service_id\'"}'));

    const error = superService.crearSolicitud(solicitud);

    await expect(error).rejects.toBeInstanceOf(SolicitudRechazadaError);
    await expect(error).rejects.toThrow("No proporcionó el 'service_id'");
  });

  it("entrega el detalle que devuelve Mi Súper al rechazar la solicitud", async () => {
    getResponse.mockRejectedValue(new MiSuperApiError(422, '{"detail":"cup duplicado"}'));

    await expect(superService.crearSolicitud(solicitud)).rejects.toMatchObject({
      name: "SolicitudRechazadaError",
      message: "cup duplicado",
    });
  });

  it("usa un mensaje genérico si el rechazo no trae un JSON con mensaje", async () => {
    getResponse.mockRejectedValue(new MiSuperApiError(400, "Bad Request"));

    await expect(superService.crearSolicitud(solicitud)).rejects.toThrow("Mi Súper rechazó la solicitud");
  });

  it("informa que Mi Súper no está disponible cuando responde con un error 5xx", async () => {
    getResponse.mockRejectedValue(new MiSuperApiError(503, "Service Unavailable"));

    await expect(superService.crearSolicitud(solicitud)).rejects.toBeInstanceOf(MiSuperNoDisponibleError);
  });

  it("no envía la solicitud si Mi Súper no entrega el token", async () => {
    createRequest.mockRejectedValue(new MiSuperApiError(401, '{"detail":"credencial inválida"}'));

    await expect(superService.crearSolicitud(solicitud)).rejects.toBeInstanceOf(MiSuperNoDisponibleError);
    expect(getResponse).not.toHaveBeenCalled();
  });

  it("falla sin llamar a Mi Súper si falta MISUPER_ENDPOINT_SOLICITUD", async () => {
    vi.stubEnv("MISUPER_ENDPOINT_SOLICITUD", "");

    await expect(superService.crearSolicitud(solicitud)).rejects.toThrow(
      "Falta la variable de entorno MISUPER_ENDPOINT_SOLICITUD",
    );
    expect(getResponse).not.toHaveBeenCalled();
  });

  it("falla sin pedir el token si falta MISUPER_CHILE_ATIENDE_ID", async () => {
    vi.stubEnv("MISUPER_CHILE_ATIENDE_ID", "");

    await expect(superService.crearSolicitud(solicitud)).rejects.toThrow(
      "Falta la variable de entorno MISUPER_CHILE_ATIENDE_ID",
    );
    expect(createRequest).not.toHaveBeenCalled();
  });
});
