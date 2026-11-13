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

// El proceso existe pero no tiene codigo_super, así que no se puede crear una solicitud en Mi Súper
export class ProcesoSinCodigoSuperError extends Error {
  constructor(codigo: string) {
    super(`El proceso ${codigo} no tiene código SUPER configurado`);
    this.name = "ProcesoSinCodigoSuperError";
  }
}

// Los datos del proceso no cumplen sus reglas (largos)
export class ProcesoInvalidoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProcesoInvalidoError";
  }
}

// Los datos de la actividad no cumplen sus reglas (obligatorio, largo)
export class ActividadInvalidaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActividadInvalidaError";
  }
}

// La carga diaria identifica la actividad por proceso + nombre, así que el nombre no puede repetirse en el proceso
export class ActividadDuplicadaError extends Error {
  constructor(procesoCodigo: string, nombre: string) {
    super(`El proceso ${procesoCodigo} ya tiene una actividad llamada "${nombre}"`);
    this.name = "ActividadDuplicadaError";
  }
}
