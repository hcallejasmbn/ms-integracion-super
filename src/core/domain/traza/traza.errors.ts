export class EjecucionNoEncontradaError extends Error {
  constructor(id: number) {
    super(`No existe la ejecución ${id}`);
    this.name = "EjecucionNoEncontradaError";
  }
}

// El rango de fechas de la limpieza no cumple sus reglas
export class RangoLimpiezaInvalidoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RangoLimpiezaInvalidoError";
  }
}
