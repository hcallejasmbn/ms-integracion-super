import type { Document } from "./document";

export interface Suspension {
  start_date: string;
  documents?: Document[];
}
