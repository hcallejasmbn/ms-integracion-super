import type { Creator } from "./creator";
import type { Petitioner } from "./petitioner";

// Los nombres en snake_case se mantienen porque son los del JSON que espera Mi Súper
export interface CrearSolicitudRequest {
  service_id: string;
  procedure_id: string;
  // Mi Súper acepta "" cuando la solicitud no viene de una entrada previa
  ms_entry_id: number | "";
  service_application_id: string;
  beneficiary_type: string;
  creator: Creator;
  petitioner?: Petitioner;
  petitioner_rut?: string;
  company_rut: string;
  cup: string;
  region?: number;
  commune?: number;
  address?: string;
}
