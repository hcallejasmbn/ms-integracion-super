import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

export const TipoResponsableSchema = z
  .object({
    code: z.string().meta({
      description: "Valor RESPONSIBLE_TYPE en SUPER; es el que guarda estados_super.responsible_type",
      example: "TITULAR",
    }),
    descripcion: z.string().meta({ example: "El titular de la solicitud" }),
  })
  .meta({ id: "TipoResponsable" });

export const TiposResponsableResponseSchema = z.array(TipoResponsableSchema).meta({ id: "TiposResponsable" });

export type TiposResponsableResponse = z.infer<typeof TiposResponsableResponseSchema>;

export function registerTypeResponsiblePaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/super/type-responsible",
    tags: ["Configuración SUPER"],
    summary: "Lista el catálogo de RESPONSIBLE_TYPE de SUPER",
    responses: {
      200: {
        description: "Opciones del catálogo type_responsible, ordenadas por código",
        content: { "application/json": { schema: TiposResponsableResponseSchema } },
      },
    },
  });
}
