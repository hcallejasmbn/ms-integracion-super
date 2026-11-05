export class ProcesoNoEncontradoError extends Error {
  constructor(codigo: string) {
    super(`No existe el proceso ${codigo}`);
    this.name = "ProcesoNoEncontradoError";
  }
}

export class ActividadNoEncontradaError extends Error {
  constructor(id: number) {
    super(`No existe la actividad ${id}`);
    this.name = "ActividadNoEncontradaError";
  }
}
