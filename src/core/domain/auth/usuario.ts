// Usuario autenticado con el SSO de Azure (Microsoft Entra ID)
export interface Usuario {
  // oid de Entra ID: identifica al usuario en el tenant y no cambia aunque cambie su correo
  readonly id: string;
  readonly nombre: string;
  readonly email: string;
}

// Datos que se guardan entre el inicio del login y el callback para validar la respuesta de Azure
export interface FlujoLogin {
  readonly state: string;
  readonly nonce: string;
  readonly codeVerifier: string;
  // Ruta interna a la que se vuelve después del login
  readonly returnTo: string;
}

// Solo se acepta una ruta interna ("/..."); cualquier otra cosa vuelve al inicio para evitar un open redirect
export function rutaDeRetornoSegura(returnTo: string | null | undefined): string {
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//") || returnTo.startsWith("/\\")) {
    return "/";
  }
  return returnTo;
}
