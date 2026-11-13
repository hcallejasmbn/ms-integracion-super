import { ConfiguracionSuperService } from "@/service/configuracion-super/configuracion-super.service";
import type { StageCodesResponse } from "./stage-codes.schema";

const configuracionSuperService = new ConfiguracionSuperService();

export async function GET() {
  const response: StageCodesResponse = await configuracionSuperService.listarStageCodes();
  return Response.json(response);
}
