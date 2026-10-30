import { describe, expect, it, vi } from "vitest";
import { EnvConfig } from "@/config/env.config";

const VALOR = "valor-test";

describe("EnvConfig", () => {
  it("devuelve MISUPER_ENDPOINT_SOLICITUD cuando está definida", () => {
    vi.stubEnv("MISUPER_ENDPOINT_SOLICITUD", VALOR);

    expect(EnvConfig.miSuperEndpointSolicitud).toBe(VALOR);
  });

  it("devuelve MISUPER_ENDPOINT_TOKEN cuando está definida", () => {
    vi.stubEnv("MISUPER_ENDPOINT_TOKEN", VALOR);

    expect(EnvConfig.miSuperEndpointToken).toBe(VALOR);
  });

  it("devuelve MISUPER_API_KEY cuando está definida", () => {
    vi.stubEnv("MISUPER_API_KEY", VALOR);

    expect(EnvConfig.miSuperApiKey).toBe(VALOR);
  });

  it("devuelve MISUPER_CHILE_ATIENDE_ID cuando está definida", () => {
    vi.stubEnv("MISUPER_CHILE_ATIENDE_ID", VALOR);

    expect(EnvConfig.miSuperChileAtiendeId).toBe(VALOR);
  });

  it("devuelve DATABASE_URL cuando está definida", () => {
    vi.stubEnv("DATABASE_URL", VALOR);

    expect(EnvConfig.databaseUrl).toBe(VALOR);
  });

  it("avisa cuál variable falta si MISUPER_ENDPOINT_SOLICITUD está vacía", () => {
    vi.stubEnv("MISUPER_ENDPOINT_SOLICITUD", "");

    expect(() => EnvConfig.miSuperEndpointSolicitud).toThrow("Falta la variable de entorno MISUPER_ENDPOINT_SOLICITUD");
  });

  it("avisa cuál variable falta si MISUPER_ENDPOINT_TOKEN está vacía", () => {
    vi.stubEnv("MISUPER_ENDPOINT_TOKEN", "");

    expect(() => EnvConfig.miSuperEndpointToken).toThrow("Falta la variable de entorno MISUPER_ENDPOINT_TOKEN");
  });

  it("avisa cuál variable falta si MISUPER_API_KEY está vacía", () => {
    vi.stubEnv("MISUPER_API_KEY", "");

    expect(() => EnvConfig.miSuperApiKey).toThrow("Falta la variable de entorno MISUPER_API_KEY");
  });

  it("avisa cuál variable falta si MISUPER_CHILE_ATIENDE_ID está vacía", () => {
    vi.stubEnv("MISUPER_CHILE_ATIENDE_ID", "");

    expect(() => EnvConfig.miSuperChileAtiendeId).toThrow("Falta la variable de entorno MISUPER_CHILE_ATIENDE_ID");
  });

  it("avisa cuál variable falta si DATABASE_URL está vacía", () => {
    vi.stubEnv("DATABASE_URL", "");

    expect(() => EnvConfig.databaseUrl).toThrow("Falta la variable de entorno DATABASE_URL");
  });
});
