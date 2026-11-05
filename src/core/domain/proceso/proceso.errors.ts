export class ProcesoNoEncontradoError extends Error {
  constructor(codigo: string) {
    super(`No existe el proceso ${codigo}`);
    this.name = "ProcesoNoEncontradoError";
  }
}
