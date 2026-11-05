import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { ErrorResponseSchema } from "../../../openapi/common.schema";
import { ActividadConEstadoSuperSchema } from "../../../procesos/[codigo]/estados-super/estados-super.schema";

export const ActividadParamsSchema = z.object({
  id: z.coerce
    .number("El id de la actividad debe ser un número")
    .int("El id de la actividad debe ser un entero positivo")
    .positive("El id de la actividad debe ser un entero positivo")
    .meta({ example: 3 }),
});

export const AsignarEstadoSuperSchema = z
  .object({
    estadoSuperId: z
      .int("estadoSuperId debe ser un entero positivo")
      .positive("estadoSuperId debe ser un entero positivo")
      .meta({ description: "Id de estados_super", example: 1 }),
  })
  .meta({ id: "AsignarEstadoSuper" });

export type ActividadConEstadoSuperResponse = z.infer<typeof ActividadConEstadoSuperSchema>;

export function registerEstadoSuperActividadPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "put",
    path: "/api/actividades/{id}/estado-super",
    tags: ["Procesos"],
    summary: "Asigna un estado SUPER existente a una actividad",
    description:
      "Reemplaza el estado SUPER que tuviera la actividad. La relación es 1:1: " +
      "un estado SUPER pertenece a una sola actividad. Repetir la misma asignación no falla.",
    request: {
      params: ActividadParamsSchema,
      body: { content: { "application/json": { schema: AsignarEstadoSuperSchema } } },
    },
    responses: {
      200: {
        description: "Actividad con el estado SUPER asignado",
        content: { "application/json": { schema: ActividadConEstadoSuperSchema } },
      },
      400: {
        description: "El id o el cuerpo no son válidos",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      404: {
        description: "La actividad no existe",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      409: {
        description: "El estado SUPER ya está asignado a otra actividad",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      422: {
        description: "El estado SUPER no existe",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });
}
