import type { EstadoSuper } from "../configuracion-super/estado-super";

export interface Proceso {
  readonly codigo: string;
  readonly nombre: string;
}

export interface Actividad {
  readonly id: number;
  readonly nombre: string;
  readonly procesoCodigo: string;
}

// Estado SUPER que se informa cuando un expediente pasa por la actividad; null si no tiene uno configurado
export interface ActividadConEstadoSuper {
  readonly actividad: Actividad;
  readonly estadoSuper: EstadoSuper | null;
}
