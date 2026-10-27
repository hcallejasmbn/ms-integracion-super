import { describe, expect, it } from "vitest";
import { ApiClientService } from "@/service/super/api-client-service";
import { SuperService } from "@/service/super/super-service";
import { crearSolicitudRequestFixture } from "../../fixtures/crear-solicitud-request.fixture";

// Crear una solicitud deja un registro real en Mi Súper, por eso hay que activarlo explícitamente
const crearSolicitudActivado = process.env.MISUPER_INTEGRATION_CREAR_SOLICITUD === "true";

describe("Mi Súper (API real)", () => {
  it("obtiene un token y arma el header Authorization", async () => {
    const request = await new ApiClientService().createRequest();

    expect(request.headers).toMatchObject({ Authorization: expect.stringMatching(/^Token \S+$/) });
    expect(request.body).toBeUndefined();
  });

  it.runIf(crearSolicitudActivado)("crea una solicitud", async () => {
    const respuesta = await new SuperService().crearSolicitud(crearSolicitudRequestFixture);

    expect(respuesta).toMatchObject({
      status: "OK",
      ms_application_id: expect.any(Number),
      message: expect.any(String),
    });
  });
});
