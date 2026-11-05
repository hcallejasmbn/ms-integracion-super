import { ProcesoService } from "@/service/proceso/proceso.service";
import type { ProcesosResponse } from "./procesos.schema";

const procesoService = new ProcesoService();

export async function GET() {
  const response: ProcesosResponse = await procesoService.listarProcesos();
  return Response.json(response);
}
