import { describe, expect, it } from "vitest";
import { openApiDocument } from "@/app/api/openapi/openapi.document";

describe("openApiDocument", () => {
  it("se genera con la versión OpenAPI 3.1.0", () => {
    expect(openApiDocument.openapi).toBe("3.1.0");
  });

  it("documenta GET /api/hello con sus respuestas 200 y 400", () => {
    expect(openApiDocument.paths?.["/api/hello"]?.get?.responses).toMatchObject({
      200: { description: "Saludo generado" },
      400: { description: "Parámetros inválidos" },
    });
  });
});
