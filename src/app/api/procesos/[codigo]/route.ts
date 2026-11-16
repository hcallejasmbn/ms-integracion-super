import { ProcesoInvalidoError, ProcesoNoEncontradoError } from "@/core/domain/proceso/proceso.errors";
import { ProcesoService } from "@/service/proceso/proceso.service";
import type { ErrorResponse } from "../../openapi/common.schema";
import { ActualizarProcesoSchema, ProcesoParamsSchema, type ProcesoResponse } from "./proceso.schema";

const procesoService = new ProcesoService();

export async function PATCH(request: Request, ctx: RouteContext<"/api/procesos/[codigo]">) {
  const params = ProcesoParamsSchema.safeParse(await ctx.params);
  if (!params.success) {
    return errorResponse(400, params.error.issues[0].message);
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return errorResponse(400, "El cuerpo de la petición debe ser un JSON válido");
  }

  const body = ActualizarProcesoSchema.safeParse(json);
  if (!body.success) {
    const issue = body.error.issues[0];
    return errorResponse(400, `${issue.path.join(".") || "body"}: ${issue.message}`);
  }

  try {
    const response: ProcesoResponse = await procesoService.actualizarCodigoSuper(
      params.data.codigo,
      body.data.codigoSuper,
    );
    return Response.json(response);
  } catch (error) {
    if (error instanceof ProcesoInvalidoError) return errorResponse(400, error.message);
    if (error instanceof ProcesoNoEncontradoError) return errorResponse(404, error.message);
    throw error;
  }
}

function errorResponse(status: number, message: string) {
  const body: ErrorResponse = { error: message };
  return Response.json(body, { status });
}
