import { ProcesoSuperNoEncontradoError } from "@/core/domain/configuracion-super/configuracion-super.errors";
import { ConfiguracionSuperService } from "@/service/configuracion-super/configuracion-super.service";
import type { ErrorResponse } from "../../../../openapi/common.schema";
import { ProcesoSuperParamsSchema, type EstadosSuperResponse } from "./estados.schema";

const configuracionSuperService = new ConfiguracionSuperService();

export async function GET(_request: Request, ctx: RouteContext<"/api/super/procesos/[codigo]/estados">) {
  const params = ProcesoSuperParamsSchema.safeParse(await ctx.params);
  if (!params.success) {
    return errorResponse(400, params.error.issues[0].message);
  }

  try {
    const response: EstadosSuperResponse = await configuracionSuperService.listarEstados(params.data.codigo);
    return Response.json(response);
  } catch (error) {
    if (error instanceof ProcesoSuperNoEncontradoError) {
      return errorResponse(404, error.message);
    }
    throw error;
  }
}

function errorResponse(status: number, message: string) {
  const body: ErrorResponse = { error: message };
  return Response.json(body, { status });
}
