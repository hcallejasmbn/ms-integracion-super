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

// Una actividad solo puede tener un estado SUPER de su mismo proceso
export class EstadoSuperDeOtroProcesoError extends Error {
  constructor(estadoSuperId: number, procesoEstado: string, procesoActividad: string) {
    super(
      `El estado SUPER ${estadoSuperId} es del proceso ${procesoEstado} y la actividad del proceso ${procesoActividad}`,
    );
    this.name = "EstadoSuperDeOtroProcesoError";
  }
}

// Los datos no cumplen las reglas de la configuración (obligatorios, largos)
export class ConfiguracionSuperInvalidaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfiguracionSuperInvalidaError";
  }
}

// code es único dentro de cada proceso
export class EstadoSuperDuplicadoError extends Error {
  constructor(procesoCodigo: string, code: string) {
    super(`El proceso ${procesoCodigo} ya tiene un estado SUPER con code ${code}`);
    this.name = "EstadoSuperDuplicadoError";
  }
}

// Tabla de catálogo de cada campo de estados_super que la referencia
const CATALOGOS = {
  stageCode: "stage_codes",
  statusCode: "status_codes",
  useWorkingDays: "type_works_days",
  responsibleType: "type_responsible",
} as const;

// stageCode, statusCode, useWorkingDays o responsibleType no están registrados en su catálogo
export class CodigoCatalogoNoEncontradoError extends Error {
  constructor(campo: keyof typeof CATALOGOS, codigo: string) {
    super(`${campo} ${codigo} no existe en ${CATALOGOS[campo]}`);
    this.name = "CodigoCatalogoNoEncontradoError";
  }
}
