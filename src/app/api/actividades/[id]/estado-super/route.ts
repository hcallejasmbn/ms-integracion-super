import {
  EstadoSuperNoEncontradoError,
  EstadoSuperYaAsignadoError,
} from "@/core/domain/configuracion-super/configuracion-super.errors";
import { ActividadNoEncontradaError } from "@/core/domain/proceso/proceso.errors";
import { ProcesoService } from "@/service/proceso/proceso.service";
import type { ErrorResponse } from "../../../openapi/common.schema";
import {
  ActividadParamsSchema,
  AsignarEstadoSuperSchema,
  type ActividadConEstadoSuperResponse,
} from "./estado-super.schema";

const procesoService = new ProcesoService();

export async function PUT(request: Request, ctx: RouteContext<"/api/actividades/[id]/estado-super">) {
  const params = ActividadParamsSchema.safeParse(await ctx.params);
  if (!params.success) {
    return errorResponse(400, params.error.issues[0].message);
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return errorResponse(400, "El cuerpo de la petición debe ser un JSON válido");
  }

  const body = AsignarEstadoSuperSchema.safeParse(json);
  if (!body.success) {
    const issue = body.error.issues[0];
    return errorResponse(400, `${issue.path.join(".") || "body"}: ${issue.message}`);
  }

  try {
    const response: ActividadConEstadoSuperResponse = await procesoService.asignarEstadoSuper(
      params.data.id,
      body.data.estadoSuperId,
    );
    return Response.json(response);
  } catch (error) {
    if (error instanceof ActividadNoEncontradaError) return errorResponse(404, error.message);
    if (error instanceof EstadoSuperNoEncontradoError) return errorResponse(422, error.message);
    if (error instanceof EstadoSuperYaAsignadoError) return errorResponse(409, error.message);
    throw error;
  }
}

function errorResponse(status: number, message: string) {
  const body: ErrorResponse = { error: message };
  return Response.json(body, { status });
}
