import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { MAX_NAME_LENGTH } from "@/core/domain/greeting/greeting";
import { ErrorResponseSchema } from "../openapi/common.schema";

export const HelloQuerySchema = z.object({
  name: z
    .string()
    .max(MAX_NAME_LENGTH, { error: `El nombre no puede superar ${MAX_NAME_LENGTH} caracteres` })
    .optional()
    .meta({ description: 'Nombre a saludar. Si se omite se usa "Mundo".', example: "Juan" }),
});

export const HelloResponseSchema = z
  .object({
    message: z.string().meta({ example: "¡Hola, Juan!" }),
    timestamp: z.iso.datetime().meta({ example: "2026-10-21T13:57:13.535Z" }),
  })
  .meta({ id: "HelloResponse" });

export type HelloResponse = z.infer<typeof HelloResponseSchema>;

export function registerHelloPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/hello",
    tags: ["Greeting"],
    summary: "Devuelve un saludo",
    request: { query: HelloQuerySchema },
    responses: {
      200: {
        description: "Saludo generado",
        content: { "application/json": { schema: HelloResponseSchema } },
      },
      400: {
        description: "Parámetros inválidos",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });
}
