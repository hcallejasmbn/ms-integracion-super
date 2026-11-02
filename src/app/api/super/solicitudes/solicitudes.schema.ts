import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { ErrorResponseSchema } from "../../openapi/common.schema";

const texto = z.string().trim().min(1);

const PersonaSchema = z
  .object({
    rut: texto.meta({ example: "12546655-1" }),
    nombre: texto.meta({ example: "Claudio" }),
    apellido: texto.meta({ example: "Perez" }),
    email: z.email().meta({ example: "claudio@test.cl" }),
  })
  .meta({ id: "Persona" });

export const NuevaSolicitudSchema = z
  .object({
    tramiteId: texto.meta({ description: "Trámite en Mi Súper", example: "59296" }),
    entradaId: z.int().positive().optional().meta({ description: "Entrada previa en Mi Súper, si existe" }),
    idSolicitudServicio: texto.meta({ description: "Identificador de la solicitud en nuestro sistema", example: "SL12048" }),
    tipoBeneficiario: texto.meta({ example: "company" }),
    creador: z.object({
      tipo: texto.meta({ example: "petitioner" }),
      datos: PersonaSchema,
    }),
    solicitante: PersonaSchema.optional(),
    rutSolicitante: texto.meta({ example: "16418825-7" }),
    rutEmpresa: texto.meta({ example: "35793623-3" }),
    cup: z.string().optional(),
    region: z.int().positive().optional().meta({ example: 15 }),
    comuna: z.int().positive().optional().meta({ example: 15101 }),
    direccion: texto.optional().meta({ example: "agustinas 1212" }),
  })
  .meta({ id: "NuevaSolicitud" });

export const SolicitudCreadaSchema = z
  .object({
    idSolicitudMiSuper: z.int().meta({ example: 1494624 }),
    mensaje: z.string().meta({ example: "La solicitud de permiso se ha creado con éxito" }),
  })
  .meta({ id: "SolicitudCreada" });

export type SolicitudCreadaResponse = z.infer<typeof SolicitudCreadaSchema>;

export function registerSolicitudesPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "post",
    path: "/api/super/solicitudes",
    tags: ["Mi Súper"],
    summary: "Crea una solicitud en Mi Súper",
    request: {
      body: { content: { "application/json": { schema: NuevaSolicitudSchema } } },
    },
    responses: {
      201: {
        description: "Solicitud creada en Mi Súper",
        content: { "application/json": { schema: SolicitudCreadaSchema } },
      },
      400: {
        description: "El cuerpo no es JSON o no cumple el contrato",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      422: {
        description: "Mi Súper rechazó la solicitud; el mensaje es el que entrega Mi Súper",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      502: {
        description: "No se pudo obtener el token o Mi Súper falló",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });
}
