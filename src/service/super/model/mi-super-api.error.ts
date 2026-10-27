export class MiSuperApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`Mi Súper respondió con estado ${status}`);
    this.name = "MiSuperApiError";
  }
}
