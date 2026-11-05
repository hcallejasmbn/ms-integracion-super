export class ProcesoSuperNoEncontradoError extends Error {
  constructor(codigo: string) {
    super(`No existe el proceso SUPER ${codigo}`);
    this.name = "ProcesoSuperNoEncontradoError";
  }
}
