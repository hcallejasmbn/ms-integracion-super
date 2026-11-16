import { describe, expect, it, vi } from "vitest";
import { EnvConfig } from "@/config/env.config";

const VALOR = "valor-test";

describe("EnvConfig", () => {
  it("devuelve HOST_SUPER cuando está definida", () => {
    vi.stubEnv("HOST_SUPER", VALOR);

    expect(EnvConfig.hostSuper).toBe(VALOR);
  });

  it("devuelve PATH_TOKEN_SUPER cuando está definida", () => {
    vi.stubEnv("PATH_TOKEN_SUPER", VALOR);

    expect(EnvConfig.pathToken).toBe(VALOR);
  });

  it("devuelve PATH_APPLICATIONS_SUPER cuando está definida", () => {
    vi.stubEnv("PATH_APPLICATIONS_SUPER", VALOR);

    expect(EnvConfig.pathApplications).toBe(VALOR);
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

  it("arma la URL del token uniendo HOST_SUPER y PATH_TOKEN_SUPER", () => {
    vi.stubEnv("HOST_SUPER", "https://misuper.test");
    vi.stubEnv("PATH_TOKEN_SUPER", "/api/v1/api-token-auth");

    expect(EnvConfig.miSuperUrlToken).toBe("https://misuper.test/api/v1/api-token-auth");
  });

  it("arma la URL de applications terminada en / aunque el path no la traiga", () => {
    vi.stubEnv("HOST_SUPER", "https://misuper.test/");
    vi.stubEnv("PATH_APPLICATIONS_SUPER", "api/v2/applications");

    expect(EnvConfig.miSuperUrlApplications).toBe("https://misuper.test/api/v2/applications/");
  });

  it("avisa cuál variable falta si HOST_SUPER está vacía", () => {
    vi.stubEnv("HOST_SUPER", "");

    expect(() => EnvConfig.hostSuper).toThrow("Falta la variable de entorno HOST_SUPER");
  });

  it("avisa cuál variable falta si PATH_TOKEN_SUPER está vacía", () => {
    vi.stubEnv("PATH_TOKEN_SUPER", "");

    expect(() => EnvConfig.pathToken).toThrow("Falta la variable de entorno PATH_TOKEN_SUPER");
  });

  it("avisa cuál variable falta si PATH_APPLICATIONS_SUPER está vacía", () => {
    vi.stubEnv("PATH_APPLICATIONS_SUPER", "");

    expect(() => EnvConfig.pathApplications).toThrow("Falta la variable de entorno PATH_APPLICATIONS_SUPER");
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
