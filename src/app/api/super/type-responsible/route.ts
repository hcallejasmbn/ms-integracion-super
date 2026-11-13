import { ConfiguracionSuperService } from "@/service/configuracion-super/configuracion-super.service";
import type { TiposResponsableResponse } from "./type-responsible.schema";

const configuracionSuperService = new ConfiguracionSuperService();

export async function GET() {
  const response: TiposResponsableResponse = await configuracionSuperService.listarTiposResponsable();
  return Response.json(response);
}
