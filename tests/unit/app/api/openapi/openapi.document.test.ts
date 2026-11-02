import { describe, expect, it } from "vitest";
import { openApiDocument } from "@/app/api/openapi/openapi.document";

describe("openApiDocument", () => {
  it("se genera con la versión OpenAPI 3.1.0", () => {
    expect(openApiDocument.openapi).toBe("3.1.0");
  });

  it("no publica GET /api/hello, que solo es el ejemplo de referencia", () => {
    expect(openApiDocument.paths?.["/api/hello"]).toBeUndefined();
  });

  it("documenta POST /api/super/solicitudes con sus respuestas", () => {
    const responses = openApiDocument.paths?.["/api/super/solicitudes"]?.post?.responses;

    expect(Object.keys(responses ?? {})).toEqual(["201", "400", "422", "502"]);
  });
});
