import { ConfiguracionSuperService } from "@/service/configuracion-super/configuracion-super.service";
import type { StatusCodesResponse } from "./status-codes.schema";

const configuracionSuperService = new ConfiguracionSuperService();

export async function GET() {
  const response: StatusCodesResponse = await configuracionSuperService.listarStatusCodes();
  return Response.json(response);
}
