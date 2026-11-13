import type { ErrorResponse } from "../../openapi/common.schema";
import { obtenerUsuario } from "../../../auth/sesion.cookies";
import type { SesionResponse } from "./sesion.schema";

export async function GET() {
  const usuario = await obtenerUsuario();
  if (!usuario) {
    const body: ErrorResponse = { error: "No hay una sesión activa" };
    return Response.json(body, { status: 401 });
  }
  const response: SesionResponse = usuario;
  return Response.json(response);
}
