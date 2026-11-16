import { createHash } from "node:crypto";
import { EncryptJWT, jwtDecrypt } from "jose";
import { EnvConfig } from "@/config/env.config";
import type { FlujoLogin, Usuario } from "@/core/domain/auth/usuario";

// El flujo de login solo tiene que sobrevivir el ida y vuelta a Azure
const DURACION_FLUJO_SEGUNDOS = 10 * 60;

// La audiencia distingue los dos tokens: un flujo no sirve como sesión ni al revés
const AUDIENCIA_SESION = "ms-integracion-super:sesion";
const AUDIENCIA_FLUJO = "ms-integracion-super:flujo-login";

export interface SesionSellada {
  readonly token: string;
  readonly duracionSegundos: number;
}

/**
 * Sella (cifra y firma) la sesión y el flujo de login como JWE (dir + A256GCM) para guardarlos en cookies.
 * Se cifra y no solo se firma porque la sesión lleva nombre y correo. La clave se deriva de SESION_SECRET.
 */
export class SesionService {
  constructor(private readonly secreto: () => string = () => EnvConfig.sesionSecret) { }

  async sellarSesion(usuario: Usuario): Promise<SesionSellada> {
    const duracionSegundos = Math.round(EnvConfig.sesionDuracionHoras * 3600);
    const token = await this.sellar({ ...usuario }, AUDIENCIA_SESION, duracionSegundos);
    return { token, duracionSegundos };
  }

  // null si no hay token, está vencido, fue alterado o se selló con otra clave
  async abrirSesion(token: string | undefined): Promise<Usuario | null> {
    const datos = await this.abrir(token, AUDIENCIA_SESION);
    if (!datos || !esTexto(datos.id) || !esTexto(datos.nombre) || !esTexto(datos.email)) {
      return null;
    }
    return { id: datos.id, nombre: datos.nombre, email: datos.email };
  }

  async sellarFlujo(flujo: FlujoLogin): Promise<SesionSellada> {
    const token = await this.sellar({ ...flujo }, AUDIENCIA_FLUJO, DURACION_FLUJO_SEGUNDOS);
    return { token, duracionSegundos: DURACION_FLUJO_SEGUNDOS };
  }

  async abrirFlujo(token: string | undefined): Promise<FlujoLogin | null> {
    const datos = await this.abrir(token, AUDIENCIA_FLUJO);
    if (
      !datos ||
      !esTexto(datos.state) ||
      !esTexto(datos.nonce) ||
      !esTexto(datos.codeVerifier) ||
      !esTexto(datos.returnTo)
    ) {
      return null;
    }
    return { state: datos.state, nonce: datos.nonce, codeVerifier: datos.codeVerifier, returnTo: datos.returnTo };
  }

  private sellar(datos: Record<string, string>, audiencia: string, duracionSegundos: number): Promise<string> {
    return new EncryptJWT(datos)
      .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
      .setAudience(audiencia)
      .setIssuedAt()
      .setExpirationTime(`${duracionSegundos}s`)
      .encrypt(this.clave());
  }

  private async abrir(token: string | undefined, audiencia: string): Promise<Record<string, unknown> | null> {
    if (!token) {
      return null;
    }
    try {
      const { payload } = await jwtDecrypt(token, this.clave(), { audience: audiencia });
      return payload;
    } catch {
      return null;
    }
  }

  // A256GCM necesita una clave de exactamente 32 bytes
  private clave(): Uint8Array {
    return createHash("sha256").update(this.secreto()).digest();
  }
}

function esTexto(valor: unknown): valor is string {
  return typeof valor === "string";
}
