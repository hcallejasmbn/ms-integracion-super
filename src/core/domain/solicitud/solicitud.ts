export interface Persona {
  readonly rut: string;
  readonly nombre: string;
  readonly apellido: string;
  readonly email: string;
}

// Titular de la solicitud (principal en Mi Súper): una empresa o una persona
export interface Beneficiario {
  readonly tipo: string;
  readonly rut: string;
  readonly email: string;
}

export interface NuevaSolicitud {
  readonly tramiteId: string;
  readonly idSolicitudServicio: string;
  readonly beneficiario: Beneficiario;
  readonly creador: Persona;
  readonly cup?: string;
}

export interface SolicitudCreada {
  readonly idSolicitudMiSuper: number;
  readonly mensaje: string;
}

export interface Documento {
  readonly tipo: string;
  readonly url: string;
  readonly nombreArchivo: string;
}

// Suspende los plazos de la solicitud desde fechaInicio (ISO 8601 sin zona, como lo espera Mi Súper)
export interface Suspension {
  readonly fechaInicio: string;
  readonly documentos?: readonly Documento[];
}

// Una subtarea informada a Mi Súper; codigo es el CODE configurado en estados_super
export interface Tarea {
  readonly codigo: string;
  readonly referencia: string;
  readonly comentario?: string;
  readonly urlAccionPrincipal?: string;
  readonly idResponsable?: string;
  readonly documentos?: readonly Documento[];
  readonly suspension?: Suspension;
}

export interface ActualizacionSolicitud {
  readonly tareas: readonly Tarea[];
}

export interface SolicitudActualizada {
  readonly idSolicitudMiSuper: number;
  readonly mensaje?: string;
}
