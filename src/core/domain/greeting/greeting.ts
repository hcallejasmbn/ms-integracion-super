import { InvalidNameError } from "./greeting.errors";

const DEFAULT_NAME = "Mundo";
export const MAX_NAME_LENGTH = 50;

export interface Greeting {
  readonly message: string;
  readonly createdAt: Date;
}

export function createGreeting(salutation: string, name: string | undefined, createdAt: Date): Greeting {
  const trimmed = name?.trim() || DEFAULT_NAME;

  if (trimmed.length > MAX_NAME_LENGTH) {
    throw new InvalidNameError(`El nombre no puede superar ${MAX_NAME_LENGTH} caracteres`);
  }

  return { message: `¡${salutation}, ${trimmed}!`, createdAt };
}
