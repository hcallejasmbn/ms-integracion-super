// Mi Súper recibió la solicitud y la rechazó (datos inválidos o duplicados)
export class SolicitudRechazadaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SolicitudRechazadaError";
  }
}

// No se pudo completar la llamada: falló el token o Mi Súper respondió con un error propio
export class MiSuperNoDisponibleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MiSuperNoDisponibleError";
  }
}
