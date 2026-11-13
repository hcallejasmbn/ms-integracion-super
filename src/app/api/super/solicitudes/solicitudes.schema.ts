import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { ErrorResponseSchema } from "../../openapi/common.schema";

const texto = z.string().trim().min(1);

const PersonaSchema = z
  .object({
    rut: texto.meta({ example: "13762927-5" }),
    nombre: texto.meta({ example: "Ignacio" }),
    apellido: texto.meta({ example: "Perez" }),
    email: z.email().meta({ example: "ignacio.perez@example.cl" }),
  })
  .meta({ id: "Persona" });

const BeneficiarioSchema = z
  .object({
    tipo: texto.meta({ description: "Tipo de titular", example: "company" }),
    rut: texto.meta({ example: "72600112-K" }),
    email: z.email().meta({ example: "contacto@constructoradelsur.cl" }),
  })
  .meta({ id: "Beneficiario", description: "Titular de la solicitud (principal en Mi Súper)" });

export const NuevaSolicitudSchema = z
  .object({
    codigoProceso: texto.meta({
      description: "Código del proceso; su código SUPER es el trámite (procedure_id) que se envía a Mi Súper",
      example: "9",
    }),
    // Se guarda como codigo_expediente en solicitudes_super (varchar(50))
    idSolicitudServicio: texto
      .max(50)
      .meta({ description: "Código del expediente en nuestro sistema. Admite una sola solicitud", example: "SL12048" }),
    beneficiario: BeneficiarioSchema,
    creador: PersonaSchema.meta({ description: "Quien crea la solicitud" }),
    cup: z.string().optional().meta({ example: "MTPDND55" }),
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
      404: {
        description: "El proceso (codigoProceso) no existe",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      409: {
        description: "El expediente (idSolicitudServicio) ya tiene una solicitud en Mi Súper",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      422: {
        description: "El proceso no tiene código SUPER configurado",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });
}
