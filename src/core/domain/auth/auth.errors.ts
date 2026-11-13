// Azure rechazó el login (usuario canceló, código inválido, nonce o state que no coinciden, etc.)
export class AutenticacionFallidaError extends Error {
  constructor(motivo: string) {
    super(`No se pudo autenticar con Azure: ${motivo}`);
    this.name = "AutenticacionFallidaError";
  }
}

// No llegó el flujo guardado al iniciar el login: expiró o el callback se abrió sin pasar por /api/auth/login
export class FlujoLoginExpiradoError extends Error {
  constructor() {
    super("El inicio de sesión expiró; vuelve a intentarlo");
    this.name = "FlujoLoginExpiradoError";
  }
}

// No se pudo leer la configuración OpenID de Azure
export class AzureNoDisponibleError extends Error {
  constructor(options?: ErrorOptions) {
    super("El servicio de autenticación de Azure no está disponible", options);
    this.name = "AzureNoDisponibleError";
  }
}
