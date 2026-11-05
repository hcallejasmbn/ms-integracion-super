// Séxtupla de SUPER configurada para un proceso SUPER
export interface EstadoSuper {
  readonly id: number;
  readonly procesoSuperCodigo: string;
  readonly code: string;
  // Código interno del catálogo y su valor en SUPER, por ejemplo "1" y ENTRY
  readonly stageCode: string;
  readonly stageValue: string;
  readonly status: string;
  readonly statusCode: string;
  readonly statusValue: string;
  readonly subtask: string;
  readonly useWorkingDays: string;
  readonly responsibleType: string;
  readonly suspensionType: string | null;
}
