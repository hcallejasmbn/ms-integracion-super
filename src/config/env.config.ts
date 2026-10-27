// Los valores se leen al usarse, no al importar el módulo, para que `next build` no falle sin variables
export class EnvConfig {
  static get miSuperEndpointSolicitud(): string {
    return requireEnv("MISUPER_ENDPOINT_SOLICITUD");
  }

  static get miSuperEndpointToken(): string {
    return requireEnv("MISUPER_ENDPOINT_TOKEN");
  }

  static get miSuperApiKey(): string {
    return requireEnv("MISUPER_API_KEY");
  }

  static get miSuperChileAtiendeId(): string {
    return requireEnv("MISUPER_CHILE_ATIENDE_ID");
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}
