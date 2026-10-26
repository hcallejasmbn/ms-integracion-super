import { z } from "zod";

export const ErrorResponseSchema = z
  .object({
    error: z.string().meta({ example: "El nombre no puede superar 50 caracteres" }),
  })
  .meta({ id: "ErrorResponse" });

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
