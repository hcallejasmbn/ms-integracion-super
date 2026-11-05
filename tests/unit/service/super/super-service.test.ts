import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NuevaSolicitud } from "@/core/domain/solicitud/solicitud";
import { MiSuperNoDisponibleError, SolicitudRechazadaError } from "@/core/domain/solicitud/solicitud.errors";
import type { SolicitudSuperDao } from "@/core/repository/dao/solicitud-super.dao";
import type { ApiClientService, Traza } from "@/service/super/api-client-service";
import type { CrearSolicitudRequest } from "@/service/super/model/crear-solicitud-request";
import type { CrearSolicitudResponse } from "@/service/super/model/crear-solicitud-response";
import { MiSuperApiError } from "@/service/super/model/mi-super-api.error";
import { SuperService } from "@/service/super/super-service";

const HOST_SUPER = "https://misuper.test";
const PATH_APPLICATIONS = "api/v2/applications/";
const URL_APPLICATIONS = "https://misuper.test/api/v2/applications/";
const TRACK_ID = "3f1c2b8e-7d4a-4c1e-9b2f-5a6d8e0c1f23";

const solicitud: NuevaSolicitud = {
  tramiteId: "2",
  idSolicitudServicio: "4",
  beneficiario: { tipo: "company", rut: "76000000-0", email: "empresa@test.cl" },
  creador: { rut: "11111111-1", nombre: "Juan", apellido: "Pérez", email: "juan@test.cl" },
  cup: "CUP-1",
};

const solicitudMiSuper: CrearSolicitudRequest = {
  procedure_id: "2",
  service_application_id: "4",
  principal: { type: "company", rut: "76000000-0", email: "empresa@test.cl" },
  creator: { rut: "11111111-1", first_name: "Juan", last_name: "Pérez", email: "juan@test.cl" },
  cup: "CUP-1",
};

const traza: Traza = { trackId: TRACK_ID, operacion: "CREAR_SOLICITUD" };

describe("SuperService.crearSolicitud", () => {
  const request: RequestInit = { headers: { Authorization: "Token abc" }, body: JSON.stringify(solicitudMiSuper) };
  const createRequest = vi.fn();
  const getResponse = vi.fn();
  const crear = vi.fn();
  let superService: SuperService;

  beforeEach(() => {
    vi.stubEnv("HOST_SUPER", HOST_SUPER);
    vi.stubEnv("PATH_APPLICATIONS_SUPER", PATH_APPLICATIONS);
    createRequest.mockReset().mockResolvedValue(request);
    getResponse.mockReset();
    crear.mockReset();
    const apiClientService = { createRequest, getResponse } as unknown as ApiClientService;
    const solicitudSuperDao = { crear } as unknown as SolicitudSuperDao;
    superService = new SuperService(apiClientService, solicitudSuperDao);
  });

  it("traduce la solicitud al formato de Mi Súper, la envía por POST y devuelve la solicitud creada", async () => {
    const respuesta: CrearSolicitudResponse = {
      status: "OK",
      ms_application_id: 1494624,
      message: "La solicitud de permiso se ha creado con éxito",
    };
    getResponse.mockResolvedValue(respuesta);

    await expect(superService.crearSolicitud(solicitud, TRACK_ID)).resolves.toEqual({
      idSolicitudMiSuper: 1494624,
      mensaje: "La solicitud de permiso se ha creado con éxito",
    });

    expect(createRequest).toHaveBeenCalledWith(solicitudMiSuper, traza);
    expect(getResponse).toHaveBeenCalledWith(URL_APPLICATIONS, "POST", request, traza);
  });

  it("guarda el expediente con el ms_application_id y el trackId cuando Mi Súper crea la solicitud", async () => {
    getResponse.mockResolvedValue({ status: "OK", ms_application_id: 1494624, message: "ok" });

    await superService.crearSolicitud(solicitud, TRACK_ID);

    expect(crear).toHaveBeenCalledWith({ codigoExpediente: "4", msApplicationId: 1494624, trackId: TRACK_ID });
  });

  it("envía el cup vacío cuando la solicitud no lo trae", async () => {
    getResponse.mockResolvedValue({ status: "OK", ms_application_id: 1, message: "ok" });
    const { cup: _, ...sinCup } = solicitud;

    await superService.crearSolicitud(sinCup, TRACK_ID);

    expect(createRequest).toHaveBeenCalledWith(expect.objectContaining({ cup: "" }), traza);
  });

  it("convierte el rechazo de Mi Súper en SolicitudRechazadaError con su mensaje", async () => {
    getResponse.mockRejectedValue(new MiSuperApiError(400, '{"status":"ERROR","message":"No proporcionó el \'procedure_id\'"}'));

    const error = superService.crearSolicitud(solicitud, TRACK_ID);

    await expect(error).rejects.toBeInstanceOf(SolicitudRechazadaError);
    await expect(error).rejects.toThrow("No proporcionó el 'procedure_id'");
  });

  it("entrega el detalle que devuelve Mi Súper al rechazar la solicitud", async () => {
    getResponse.mockRejectedValue(new MiSuperApiError(422, '{"detail":"cup duplicado"}'));

    await expect(superService.crearSolicitud(solicitud, TRACK_ID)).rejects.toMatchObject({
      name: "SolicitudRechazadaError",
      message: "cup duplicado",
    });
  });

  it("usa un mensaje genérico si el rechazo no trae un JSON con mensaje", async () => {
    getResponse.mockRejectedValue(new MiSuperApiError(400, "Bad Request"));

    await expect(superService.crearSolicitud(solicitud, TRACK_ID)).rejects.toThrow("Mi Súper rechazó la solicitud");
  });

  it("no guarda el expediente si Mi Súper rechaza la solicitud", async () => {
    getResponse.mockRejectedValue(new MiSuperApiError(400, "Bad Request"));

    await expect(superService.crearSolicitud(solicitud, TRACK_ID)).rejects.toBeInstanceOf(SolicitudRechazadaError);
    expect(crear).not.toHaveBeenCalled();
  });

  it("informa que Mi Súper no está disponible cuando responde con un error 5xx", async () => {
    getResponse.mockRejectedValue(new MiSuperApiError(503, "Service Unavailable"));

    await expect(superService.crearSolicitud(solicitud, TRACK_ID)).rejects.toBeInstanceOf(MiSuperNoDisponibleError);
  });

  it("no envía la solicitud si Mi Súper no entrega el token", async () => {
    createRequest.mockRejectedValue(new MiSuperApiError(401, '{"detail":"credencial inválida"}'));

    await expect(superService.crearSolicitud(solicitud, TRACK_ID)).rejects.toBeInstanceOf(MiSuperNoDisponibleError);
    expect(getResponse).not.toHaveBeenCalled();
  });

  it("no envía la solicitud si falta PATH_APPLICATIONS_SUPER", async () => {
    vi.stubEnv("PATH_APPLICATIONS_SUPER", "");

    await expect(superService.crearSolicitud(solicitud, TRACK_ID)).rejects.toThrow(
      "Falta la variable de entorno PATH_APPLICATIONS_SUPER",
    );
    expect(getResponse).not.toHaveBeenCalled();
  });
});
