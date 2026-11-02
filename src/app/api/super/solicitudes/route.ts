import { MiSuperNoDisponibleError, SolicitudRechazadaError } from "@/core/domain/solicitud/solicitud.errors";
import { SuperService } from "@/service/super/super-service";
import type { ErrorResponse } from "../../openapi/common.schema";
import { NuevaSolicitudSchema, type SolicitudCreadaResponse } from "./solicitudes.schema";

const superService = new SuperService();

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return errorResponse(400, "El cuerpo de la petición debe ser un JSON válido");
  }

  const body = NuevaSolicitudSchema.safeParse(json);
  if (!body.success) {
    const issue = body.error.issues[0];
    return errorResponse(400, `${issue.path.join(".") || "body"}: ${issue.message}`);
  }

  try {
    const solicitud = await superService.crearSolicitud(body.data);
    const response: SolicitudCreadaResponse = {
      idSolicitudMiSuper: solicitud.idSolicitudMiSuper,
      mensaje: solicitud.mensaje,
    };
    return Response.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof SolicitudRechazadaError) {
      return errorResponse(422, error.message);
    }
    if (error instanceof MiSuperNoDisponibleError) {
      return errorResponse(502, error.message);
    }
    throw error;
  }
}

function errorResponse(status: number, message: string) {
  const body: ErrorResponse = { error: message };
  return Response.json(body, { status });
}
