import { ConfiguracionSuperService } from "@/service/configuracion-super/configuracion-super.service";
import type { TiposDiasResponse } from "./type-works-days.schema";

const configuracionSuperService = new ConfiguracionSuperService();

export async function GET() {
  const response: TiposDiasResponse = await configuracionSuperService.listarTiposDias();
  return Response.json(response);
}
