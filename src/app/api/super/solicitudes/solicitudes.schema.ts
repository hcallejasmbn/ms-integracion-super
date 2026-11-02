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
    // Se guarda como codigo_expediente en solicitudes_super (varchar(50))
    idSolicitudServicio: texto
      .max(50)
      .meta({ description: "Código del expediente en nuestro sistema. Admite una sola solicitud", example: "SL12048" }),
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

export const SolicitudAceptadaSchema = z
  .object({
    trackId: z.uuid().meta({
      description: "Identifica el procesamiento; con él se buscan las llamadas a Mi Súper en log_ejecucion",
      example: "3f1c2b8e-7d4a-4c1e-9b2f-5a6d8e0c1f23",
    }),
    mensaje: z.string().meta({ example: "Solicitud recibida; se enviará a Mi Súper" }),
  })
  .meta({ id: "SolicitudAceptada" });

export type SolicitudAceptadaResponse = z.infer<typeof SolicitudAceptadaSchema>;

export function registerSolicitudesPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "post",
    path: "/api/super/solicitudes",
    tags: ["Mi Súper"],
    summary: "Recibe una solicitud y la crea en Mi Súper de forma asíncrona",
    description:
      "Responde 202 apenas la solicitud pasa las validaciones. La creación en Mi Súper ocurre después; " +
      "su resultado queda en log_ejecucion con el trackId de la respuesta.",
    request: {
      body: { content: { "application/json": { schema: NuevaSolicitudSchema } } },
    },
    responses: {
      202: {
        description: "Solicitud aceptada; se enviará a Mi Súper",
        content: { "application/json": { schema: SolicitudAceptadaSchema } },
      },
      400: {
        description: "El cuerpo no es JSON o no cumple el contrato",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      409: {
        description: "El expediente (idSolicitudServicio) ya tiene una solicitud en Mi Súper",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });
}
