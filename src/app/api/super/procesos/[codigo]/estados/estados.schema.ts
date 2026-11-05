import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { MAX_ESTADO_SUPER } from "@/core/domain/configuracion-super/estado-super";
import { ErrorResponseSchema } from "../../../../openapi/common.schema";

export const ProcesoSuperParamsSchema = z.object({
  codigo: z.string().trim().min(1, "El código del proceso SUPER es obligatorio").meta({ example: "OLP" }),
});

function campo(nombre: keyof typeof MAX_ESTADO_SUPER) {
  const maximo = MAX_ESTADO_SUPER[nombre];
  return z
    .string(`${nombre} es obligatorio`)
    .trim()
    .min(1, `${nombre} es obligatorio`)
    .max(maximo, `${nombre} no puede superar ${maximo} caracteres`);
}

export const NuevoEstadoSuperSchema = z
  .object({
    code: campo("code").meta({ description: "CODE de la séxtupla; único en el proceso SUPER", example: "IWSP-1" }),
    stageCode: campo("stageCode").meta({ description: "Código interno de stage_codes", example: "1" }),
    status: campo("status").meta({ example: "Solicitud ingresada" }),
    statusCode: campo("statusCode").meta({ description: "Código interno de status_codes", example: "1" }),
    subtask: campo("subtask").meta({ example: "Solicitud recibida" }),
    useWorkingDays: campo("useWorkingDays").meta({ example: "DÍAS HÁBILES" }),
    responsibleType: campo("responsibleType").meta({ example: "TITULAR" }),
    suspensionType: z
      .string("suspensionType debe ser texto")
      .trim()
      .max(MAX_ESTADO_SUPER.suspensionType, `suspensionType no puede superar ${MAX_ESTADO_SUPER.suspensionType} caracteres`)
      .nullable()
      .optional()
      .meta({ description: "Causal de suspensión, si tiene" }),
  })
  .meta({ id: "NuevoEstadoSuper" });

export const EstadoSuperSchema = z
  .object({
    id: z.int().meta({ example: 1 }),
    procesoSuperCodigo: z.string().meta({ example: "OLP" }),
    code: z.string().meta({ description: "CODE de la séxtupla", example: "IWSP-1" }),
    stageCode: z.string().meta({ description: "Código interno de stage_codes", example: "1" }),
    stageValue: z.string().meta({ description: "STAGE_CODE en SUPER", example: "ENTRY" }),
    status: z.string().meta({ example: "Solicitud ingresada" }),
    statusCode: z.string().meta({ description: "Código interno de status_codes", example: "1" }),
    statusValue: z.string().meta({ description: "STATUS_CODE en SUPER", example: "ENTERED" }),
    subtask: z.string().meta({ example: "Solicitud recibida" }),
    useWorkingDays: z.string().meta({ example: "DÍAS HÁBILES" }),
    responsibleType: z.string().meta({ example: "TITULAR" }),
    suspensionType: z.string().nullable().meta({ description: "Causal de suspensión, si tiene" }),
  })
  .meta({ id: "EstadoSuper" });

export const EstadosSuperResponseSchema = z.array(EstadoSuperSchema).meta({ id: "EstadosSuper" });

export type EstadosSuperResponse = z.infer<typeof EstadosSuperResponseSchema>;
export type EstadoSuperResponse = z.infer<typeof EstadoSuperSchema>;

export function registerEstadosSuperPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/super/procesos/{codigo}/estados",
    tags: ["Configuración SUPER"],
    summary: "Lista los estados SUPER configurados para un proceso SUPER",
    request: { params: ProcesoSuperParamsSchema },
    responses: {
      200: {
        description: "Estados del proceso SUPER, en el orden en que se crearon",
        content: { "application/json": { schema: EstadosSuperResponseSchema } },
      },
      400: {
        description: "El código viene vacío",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      404: {
        description: "El proceso SUPER no existe",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/super/procesos/{codigo}/estados",
    tags: ["Configuración SUPER"],
    summary: "Crea un estado SUPER (séxtupla) en un proceso SUPER",
    description: "El estado queda sin actividad; se asigna con PUT /api/actividades/{id}/estado-super.",
    request: {
      params: ProcesoSuperParamsSchema,
      body: { content: { "application/json": { schema: NuevoEstadoSuperSchema } } },
    },
    responses: {
      201: {
        description: "Estado SUPER creado",
        content: { "application/json": { schema: EstadoSuperSchema } },
      },
      400: {
        description: "El código, o el cuerpo, no son válidos",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      404: {
        description: "El proceso SUPER no existe",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      409: {
        description: "El proceso SUPER ya tiene un estado con ese code",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      422: {
        description: "stageCode o statusCode no existen en su catálogo",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });
}
