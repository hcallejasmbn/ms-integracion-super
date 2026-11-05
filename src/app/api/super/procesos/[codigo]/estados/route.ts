import {
  CodigoCatalogoNoEncontradoError,
  ConfiguracionSuperInvalidaError,
  EstadoSuperDuplicadoError,
  ProcesoSuperNoEncontradoError,
} from "@/core/domain/configuracion-super/configuracion-super.errors";
import { ConfiguracionSuperService } from "@/service/configuracion-super/configuracion-super.service";
import type { ErrorResponse } from "../../../../openapi/common.schema";
import {
  NuevoEstadoSuperSchema,
  ProcesoSuperParamsSchema,
  type EstadoSuperResponse,
  type EstadosSuperResponse,
} from "./estados.schema";

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

export async function POST(request: Request, ctx: RouteContext<"/api/super/procesos/[codigo]/estados">) {
  const params = ProcesoSuperParamsSchema.safeParse(await ctx.params);
  if (!params.success) {
    return errorResponse(400, params.error.issues[0].message);
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return errorResponse(400, "El cuerpo de la petición debe ser un JSON válido");
  }

  const body = NuevoEstadoSuperSchema.safeParse(json);
  if (!body.success) {
    const issue = body.error.issues[0];
    return errorResponse(400, `${issue.path.join(".") || "body"}: ${issue.message}`);
  }

  try {
    const response: EstadoSuperResponse = await configuracionSuperService.crearEstado({
      ...body.data,
      procesoSuperCodigo: params.data.codigo,
    });
    return Response.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof ConfiguracionSuperInvalidaError) return errorResponse(400, error.message);
    if (error instanceof ProcesoSuperNoEncontradoError) return errorResponse(404, error.message);
    if (error instanceof EstadoSuperDuplicadoError) return errorResponse(409, error.message);
    if (error instanceof CodigoCatalogoNoEncontradoError) return errorResponse(422, error.message);
    throw error;
  }
}

function errorResponse(status: number, message: string) {
  const body: ErrorResponse = { error: message };
  return Response.json(body, { status });
}
