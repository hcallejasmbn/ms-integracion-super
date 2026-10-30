import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/hello/route";

const URL_HELLO = "http://localhost:3000/api/hello";

describe("GET /api/hello", () => {
  it("responde 200 saludando a Mundo cuando no se envía name", async () => {
    const response = GET(new Request(URL_HELLO));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ message: "¡Hola, Mundo!", timestamp: expect.any(String) });
  });

  it("responde 200 saludando al name recibido en la query", async () => {
    const response = GET(new Request(`${URL_HELLO}?name=Juan`));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ message: "¡Hola, Juan!", timestamp: expect.any(String) });
  });

  it("responde 400 cuando name supera los 50 caracteres", async () => {
    const response = GET(new Request(`${URL_HELLO}?name=${"a".repeat(51)}`));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "El nombre no puede superar 50 caracteres" });
  });

  // Zod valida el largo antes de que el dominio recorte los espacios
  it("responde 400 cuando name con espacios alrededor supera los 50 caracteres", async () => {
    const nombre = encodeURIComponent(`${" ".repeat(25)}Juan${" ".repeat(25)}`);
    const response = GET(new Request(`${URL_HELLO}?name=${nombre}`));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "El nombre no puede superar 50 caracteres" });
  });
});
