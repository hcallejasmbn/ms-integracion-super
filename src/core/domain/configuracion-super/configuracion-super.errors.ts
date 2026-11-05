export class ProcesoSuperNoEncontradoError extends Error {
  constructor(codigo: string) {
    super(`No existe el proceso SUPER ${codigo}`);
    this.name = "ProcesoSuperNoEncontradoError";
  }
}

export class EstadoSuperNoEncontradoError extends Error {
  constructor(id: number) {
    super(`No existe el estado SUPER ${id}`);
    this.name = "EstadoSuperNoEncontradoError";
  }
}

// Un estado SUPER pertenece a una sola actividad
export class EstadoSuperYaAsignadoError extends Error {
  constructor(estadoSuperId: number, actividadId: number) {
    super(`El estado SUPER ${estadoSuperId} ya está asignado a la actividad ${actividadId}`);
    this.name = "EstadoSuperYaAsignadoError";
  }
}

// Los datos no cumplen las reglas de la configuración (obligatorios, largos)
export class ConfiguracionSuperInvalidaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfiguracionSuperInvalidaError";
  }
}

export class ProcesoSuperYaExisteError extends Error {
  constructor(codigo: string) {
    super(`Ya existe el proceso SUPER ${codigo}`);
    this.name = "ProcesoSuperYaExisteError";
  }
}

// code es único dentro de cada proceso SUPER
export class EstadoSuperDuplicadoError extends Error {
  constructor(procesoSuperCodigo: string, code: string) {
    super(`El proceso SUPER ${procesoSuperCodigo} ya tiene un estado con code ${code}`);
    this.name = "EstadoSuperDuplicadoError";
  }
}

// stageCode o statusCode no están registrados en su catálogo
export class CodigoCatalogoNoEncontradoError extends Error {
  constructor(campo: "stageCode" | "statusCode", codigo: string) {
    super(`${campo} ${codigo} no existe en ${campo === "stageCode" ? "stage_codes" : "status_codes"}`);
    this.name = "CodigoCatalogoNoEncontradoError";
  }
}
