import type { NextRequest } from "next/server";
import { AzureNoDisponibleError } from "@/core/domain/auth/auth.errors";
import { rutaDeRetornoSegura } from "@/core/domain/auth/usuario";
import { AzureAuthService } from "@/service/auth/azure-auth.service";
import { guardarFlujo } from "../../../auth/sesion.cookies";
import { redirigirALogin } from "../../../auth/redireccion";

const azureAuthService = new AzureAuthService();

export async function GET(request: NextRequest) {
  const returnTo = rutaDeRetornoSegura(request.nextUrl.searchParams.get("returnTo"));
  try {
    const { url, flujo } = await azureAuthService.iniciarLogin(returnTo);
    await guardarFlujo(flujo);
    return Response.redirect(url, 302);
  } catch (error) {
    if (error instanceof AzureNoDisponibleError) {
      console.error(error.message, error.cause);
      return redirigirALogin("azure_no_disponible");
    }
    throw error;
  }
}
