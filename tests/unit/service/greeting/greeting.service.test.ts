import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GreetingRepository } from "@/core/repository/greeting.repository";
import { GreetingService } from "@/service/greeting/greeting.service";

const AHORA = new Date("2026-10-27T12:00:00.000Z");

describe("GreetingService.getGreeting", () => {
  const saludo = vi.fn();
  let greetingService: GreetingService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(AHORA);
    saludo.mockReset().mockReturnValue("Buenas");
    const greetingRepository = { saludo } as unknown as GreetingRepository;
    greetingService = new GreetingService(greetingRepository);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("arma el mensaje con el saludo que entrega el repositorio", () => {
    expect(greetingService.getGreeting("Juan").message).toBe("¡Buenas, Juan!");

    expect(saludo).toHaveBeenCalled();
  });

  it("asigna la fecha y hora actual al saludo", () => {
    expect(greetingService.getGreeting("Juan").createdAt).toEqual(AHORA);
  });
});
