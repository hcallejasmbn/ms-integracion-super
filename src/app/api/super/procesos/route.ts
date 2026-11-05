import {
  ConfiguracionSuperInvalidaError,
  ProcesoSuperYaExisteError,
} from "@/core/domain/configuracion-super/configuracion-super.errors";
import { ConfiguracionSuperService } from "@/service/configuracion-super/configuracion-super.service";
import type { ErrorResponse } from "../../openapi/common.schema";
import { NuevoProcesoSuperSchema, type ProcesoSuperResponse } from "./procesos-super.schema";

const configuracionSuperService = new ConfiguracionSuperService();

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return errorResponse(400, "El cuerpo de la petición debe ser un JSON válido");
  }

  const body = NuevoProcesoSuperSchema.safeParse(json);
  if (!body.success) {
    const issue = body.error.issues[0];
    return errorResponse(400, `${issue.path.join(".") || "body"}: ${issue.message}`);
  }

  try {
    const response: ProcesoSuperResponse = await configuracionSuperService.crearProcesoSuper(body.data);
    return Response.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof ConfiguracionSuperInvalidaError) return errorResponse(400, error.message);
    if (error instanceof ProcesoSuperYaExisteError) return errorResponse(409, error.message);
    throw error;
  }
}

function errorResponse(status: number, message: string) {
  const body: ErrorResponse = { error: message };
  return Response.json(body, { status });
}
