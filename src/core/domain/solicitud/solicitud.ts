export interface Persona {
  readonly rut: string;
  readonly nombre: string;
  readonly apellido: string;
  readonly email: string;
}

export interface Creador {
  readonly tipo: string;
  readonly datos: Persona;
}

export interface NuevaSolicitud {
  readonly tramiteId: string;
  // Entrada previa en Mi Súper de la que nace la solicitud, si existe
  readonly entradaId?: number;
  readonly idSolicitudServicio: string;
  readonly tipoBeneficiario: string;
  readonly creador: Creador;
  readonly solicitante?: Persona;
  readonly rutSolicitante: string;
  readonly rutEmpresa: string;
  readonly cup?: string;
  readonly region?: number;
  readonly comuna?: number;
  readonly direccion?: string;
}

export interface SolicitudCreada {
  readonly idSolicitudMiSuper: number;
  readonly mensaje: string;
}
