import { ProcesoNoEncontradoError } from "@/core/domain/proceso/proceso.errors";
import { ProcesoService } from "@/service/proceso/proceso.service";
import type { ErrorResponse } from "../../../openapi/common.schema";
import { ProcesoParamsSchema } from "../actividades/actividades.schema";
import type { ActividadesConEstadoSuperResponse } from "./estados-super.schema";

const procesoService = new ProcesoService();

export async function GET(_request: Request, ctx: RouteContext<"/api/procesos/[codigo]/estados-super">) {
  const params = ProcesoParamsSchema.safeParse(await ctx.params);
  if (!params.success) {
    return errorResponse(400, params.error.issues[0].message);
  }

  try {
    const response: ActividadesConEstadoSuperResponse = await procesoService.listarEstadosSuper(params.data.codigo);
    return Response.json(response);
  } catch (error) {
    if (error instanceof ProcesoNoEncontradoError) {
      return errorResponse(404, error.message);
    }
    throw error;
  }
}

function errorResponse(status: number, message: string) {
  const body: ErrorResponse = { error: message };
  return Response.json(body, { status });
}
