import type { Document } from "./document";
import type { Suspension } from "./suspension";

export interface Task {
  code: string;
  reference: string;
  comment?: string;
  principal_action_url?: string;
  responsible_id?: string;
  documents?: Document[];
  suspension?: Suspension;
}
