import type { Creator } from "./creator";
import type { Principal } from "./principal";

// Los nombres en snake_case se mantienen porque son los del JSON que espera Mi Súper
export interface CrearSolicitudRequest {
  procedure_id: string;
  service_application_id: string;
  principal: Principal;
  creator: Creator;
  cup: string;
}
