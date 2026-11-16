import { after } from "next/server";
import { ProcesoNoEncontradoError, ProcesoSinCodigoSuperError } from "@/core/domain/proceso/proceso.errors";
import { SuperService } from "@/service/super/super-service";
import type { ErrorResponse } from "../../openapi/common.schema";
import { NuevaSolicitudSchema, type SolicitudAceptadaResponse } from "./solicitudes.schema";

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

  const solicitud = body.data;
  // El trámite de Mi Súper sale del proceso: sin proceso o sin codigo_super no se acepta la solicitud
  try {
    await superService.verificarProceso(solicitud.codigoProceso);
  } catch (error) {
    if (error instanceof ProcesoNoEncontradoError) {
      return errorResponse(404, error.message);
    }
    if (error instanceof ProcesoSinCodigoSuperError) {
      return errorResponse(422, error.message);
    }
    throw error;
  }

  if (await superService.existeSolicitud(solicitud.idSolicitudServicio)) {
    return errorResponse(409, `El expediente ${solicitud.idSolicitudServicio} ya tiene una solicitud en Mi Súper`);
  }

  // La creación en Mi Súper corre después de responder. Nadie espera su resultado,
  // así que los errores solo se registran: las llamadas quedan en log_ejecucion con este trackId
  const trackId = crypto.randomUUID();
  after(async () => {
    try {
      await superService.crearSolicitud(solicitud, trackId);
    } catch (error) {
      console.error("No se pudo crear la solicitud en Mi Súper", { trackId, error });
    }
  });

  const response: SolicitudAceptadaResponse = { trackId, mensaje: "Solicitud recibida; se enviará a Mi Súper" };
  return Response.json(response, { status: 202 });
}

function errorResponse(status: number, message: string) {
  const body: ErrorResponse = { error: message };
  return Response.json(body, { status });
}
