import { BASE_PATH } from "./base-path";

// Los valores se leen al usarse, no al importar el módulo, para que `next build` no falle sin variables
export class EnvConfig {
  // Host de Mi Súper; cada endpoint se arma con HOST_SUPER + su PATH_*
  static get hostSuper(): string {
    return requireEnv("HOST_SUPER");
  }

  static get pathToken(): string {
    return requireEnv("PATH_TOKEN_SUPER");
  }

  // Crear (POST) y actualizar (POST + ms_application_id) usan el mismo path
  static get pathApplications(): string {
    return requireEnv("PATH_APPLICATIONS_SUPER");
  }

  static get miSuperUrlToken(): string {
    return unirUrl(EnvConfig.hostSuper, EnvConfig.pathToken);
  }

  // Termina en "/" para que se le pueda agregar el ms_application_id
  static get miSuperUrlApplications(): string {
    return conBarraFinal(unirUrl(EnvConfig.hostSuper, EnvConfig.pathApplications));
  }

  static get miSuperApiKey(): string {
    return requireEnv("MISUPER_API_KEY");
  }

  static get miSuperChileAtiendeId(): string {
    return requireEnv("MISUPER_CHILE_ATIENDE_ID");
  }

  // Expresión cron (minuto hora día mes día-semana); por defecto todos los días a las 3:00
  static get jobNotificacionSuperCron(): string {
    return process.env.JOB_NOTIFICACION_SUPER_CRON || "0 3 * * *";
  }

  // "false" desactiva el job, por ejemplo en desarrollo o en réplicas que no deben ejecutarlo
  static get jobNotificacionSuperActivo(): boolean {
    return process.env.JOB_NOTIFICACION_SUPER_ACTIVO !== "false";
  }

  // Zona horaria en que se interpreta la expresión cron
  static get jobZonaHoraria(): string {
    return process.env.JOB_ZONA_HORARIA || "America/Santiago";
  }

  // SSO de Azure (Microsoft Entra ID). El tenant debe ser el id (GUID): con el dominio no coincide el issuer
  static get azureTenantId(): string {
    return requireEnv("AZURE_AD_TENANT_ID");
  }

  static get azureClientId(): string {
    return requireEnv("AZURE_AD_CLIENT_ID");
  }

  static get azureClientSecret(): string {
    return requireEnv("AZURE_AD_CLIENT_SECRET");
  }

  // Debe ser exactamente la Redirect URI registrada en Azure e incluir el basePath: http://localhost:3000/ms-integracion-super/api/auth/callback
  static get azureRedirectUri(): string {
    return requireEnv("AZURE_AD_REDIRECT_URI");
  }

  // Clave para cifrar la cookie de sesión; generarla con `openssl rand -base64 32`
  static get sesionSecret(): string {
    const secret = requireEnv("SESION_SECRET");
    if (secret.length < 32) {
      throw new Error("SESION_SECRET debe tener al menos 32 caracteres");
    }
    return secret;
  }

  static get sesionDuracionHoras(): number {
    const horas = Number(process.env.SESION_DURACION_HORAS || 8);
    if (!Number.isFinite(horas) || horas <= 0) {
      throw new Error("SESION_DURACION_HORAS debe ser un número positivo");
    }
    return horas;
  }

  // Las cookies llevan Secure cuando la app se sirve por https (según la Redirect URI)
  static get cookiesSeguras(): boolean {
    return new URL(EnvConfig.azureRedirectUri).protocol === "https:";
  }

  static get databaseUrl(): string {
    return requireEnv("DATABASE_URL");
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

// Acepta el host y el path con o sin "/" entre ellos
function unirUrl(host: string, path: string): string {
  return new URL(path.replace(/^\/+/, ""), conBarraFinal(host)).toString();
}

function conBarraFinal(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}
