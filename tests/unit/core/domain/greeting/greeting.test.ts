import { describe, expect, it } from "vitest";
import { createGreeting, MAX_NAME_LENGTH } from "@/core/domain/greeting/greeting";
import { InvalidNameError } from "@/core/domain/greeting/greeting.errors";

const SALUDO = "Hola";
const CREATED_AT = new Date("2026-10-27T12:00:00.000Z");

describe("createGreeting", () => {
  it("arma el mensaje con el nombre y conserva la fecha recibida", () => {
    expect(createGreeting(SALUDO, "Juan", CREATED_AT)).toEqual({ message: "¡Hola, Juan!", createdAt: CREATED_AT });
  });

  it("saluda a Mundo cuando no recibe nombre", () => {
    expect(createGreeting(SALUDO, undefined, CREATED_AT).message).toBe("¡Hola, Mundo!");
  });

  it("saluda a Mundo cuando el nombre viene vacío", () => {
    expect(createGreeting(SALUDO, "", CREATED_AT).message).toBe("¡Hola, Mundo!");
  });

  it("saluda a Mundo cuando el nombre solo tiene espacios", () => {
    expect(createGreeting(SALUDO, "   ", CREATED_AT).message).toBe("¡Hola, Mundo!");
  });

  it("quita los espacios alrededor del nombre", () => {
    expect(createGreeting(SALUDO, "  Juan  ", CREATED_AT).message).toBe("¡Hola, Juan!");
  });

  it("acepta un nombre con el largo máximo permitido", () => {
    const nombre = "a".repeat(MAX_NAME_LENGTH);

    expect(createGreeting(SALUDO, nombre, CREATED_AT).message).toBe(`¡Hola, ${nombre}!`);
  });

  it("rechaza con InvalidNameError un nombre que supera el largo máximo", () => {
    const nombre = "a".repeat(MAX_NAME_LENGTH + 1);

    expect(() => createGreeting(SALUDO, nombre, CREATED_AT)).toThrow(InvalidNameError);
    expect(() => createGreeting(SALUDO, nombre, CREATED_AT)).toThrow("El nombre no puede superar 50 caracteres");
  });
});
