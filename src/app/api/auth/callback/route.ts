import type { NextRequest } from "next/server";
import {
  AutenticacionFallidaError,
  AzureNoDisponibleError,
  FlujoLoginExpiradoError,
} from "@/core/domain/auth/auth.errors";
import { AzureAuthService } from "@/service/auth/azure-auth.service";
import { redirigir, redirigirALogin } from "../../../auth/redireccion";
import { guardarSesion, tomarFlujo } from "../../../auth/sesion.cookies";

const azureAuthService = new AzureAuthService();

// Redirect URI registrada en Azure: aquí vuelve el navegador con ?code=&state= (o ?error=)
export async function GET(request: NextRequest) {
  try {
    const flujo = await tomarFlujo();
    if (!flujo) {
      throw new FlujoLoginExpiradoError();
    }
    const usuario = await azureAuthService.completarLogin(request.nextUrl.searchParams, flujo);
    await guardarSesion(usuario);
    return redirigir(flujo.returnTo);
  } catch (error) {
    if (error instanceof FlujoLoginExpiradoError) {
      return redirigirALogin("login_expirado");
    }
    if (error instanceof AutenticacionFallidaError) {
      console.warn(error.message);
      return redirigirALogin("autenticacion_fallida");
    }
    if (error instanceof AzureNoDisponibleError) {
      console.error(error.message, error.cause);
      return redirigirALogin("azure_no_disponible");
    }
    throw error;
  }
}
