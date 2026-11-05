import type { Task } from "./task";

// Body de POST /v2/applications/{ms_application_id}
export interface ActualizarSolicitudRequest {
  tasks: Task[];
}
