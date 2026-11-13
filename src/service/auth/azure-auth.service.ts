import * as client from "openid-client";
import { EnvConfig } from "@/config/env.config";
import { AutenticacionFallidaError, AzureNoDisponibleError } from "@/core/domain/auth/auth.errors";
import type { FlujoLogin, Usuario } from "@/core/domain/auth/usuario";

// openid, profile y email bastan para obtener oid, name y el correo en el id_token
const SCOPES = "openid profile email";

export type ObtenerConfiguracion = () => Promise<client.Configuration>;

export interface InicioLogin {
  // URL de login de Azure a la que se redirige el navegador
  readonly url: URL;
  // Se guarda hasta el callback para validar la respuesta
  readonly flujo: FlujoLogin;
}

/**
 * Login con Microsoft Entra ID por OpenID Connect: authorization code flow con PKCE, state y nonce.
 * openid-client valida la firma, el issuer, la audiencia, la expiración y el nonce del id_token.
 */
export class AzureAuthService {
  constructor(private readonly obtenerConfiguracion: ObtenerConfiguracion = configuracionAzure) { }

  async iniciarLogin(returnTo: string): Promise<InicioLogin> {
    const configuracion = await this.obtenerConfiguracion();
    const flujo: FlujoLogin = {
      state: client.randomState(),
      nonce: client.randomNonce(),
      codeVerifier: client.randomPKCECodeVerifier(),
      returnTo,
    };
    const url = client.buildAuthorizationUrl(configuracion, {
      redirect_uri: EnvConfig.azureRedirectUri,
      scope: SCOPES,
      code_challenge: await client.calculatePKCECodeChallenge(flujo.codeVerifier),
      code_challenge_method: "S256",
      state: flujo.state,
      nonce: flujo.nonce,
    });
    return { url, flujo };
  }

  // parametros: query string con que Azure llamó al callback (code y state, o error)
  async completarLogin(parametros: URLSearchParams, flujo: FlujoLogin): Promise<Usuario> {
    const configuracion = await this.obtenerConfiguracion();
    try {
      const tokens = await client.authorizationCodeGrant(configuracion, urlDeCallback(parametros), {
        pkceCodeVerifier: flujo.codeVerifier,
        expectedState: flujo.state,
        expectedNonce: flujo.nonce,
        idTokenExpected: true,
      });
      return toUsuario(tokens.claims());
    } catch (error) {
      if (error instanceof AutenticacionFallidaError) {
        throw error;
      }
      throw new AutenticacionFallidaError(motivo(error));
    }
  }

}

// La configuración OpenID del tenant se descarga una vez; si falla se vuelve a intentar en la próxima llamada.
// Se guarda en globalThis para que el hot reload de `next dev` no la descargue en cada cambio
const globalAzure = globalThis as typeof globalThis & { azureOidcConfiguracion?: Promise<client.Configuration> };

function configuracionAzure(): Promise<client.Configuration> {
  globalAzure.azureOidcConfiguracion ??= client
    .discovery(
      new URL(`https://login.microsoftonline.com/${EnvConfig.azureTenantId}/v2.0`),
      EnvConfig.azureClientId,
      EnvConfig.azureClientSecret,
    )
    .catch((error: unknown) => {
      globalAzure.azureOidcConfiguracion = undefined;
      throw new AzureNoDisponibleError({ cause: error });
    });
  return globalAzure.azureOidcConfiguracion;
}

// openid-client usa esta URL como redirect_uri del canje del código, por eso se arma con la Redirect URI
// configurada y no con la URL del request, que detrás de un proxy puede tener otro host
function urlDeCallback(parametros: URLSearchParams): URL {
  const url = new URL(EnvConfig.azureRedirectUri);
  url.search = parametros.toString();
  return url;
}

function toUsuario(claims: client.IDToken | undefined): Usuario {
  const id = texto(claims?.oid);
  if (!claims || !id) {
    throw new AutenticacionFallidaError("el id_token no trae el oid del usuario");
  }
  // email solo viene si el usuario tiene correo; preferred_username es el UPN, que en Entra ID tiene forma de correo
  const email = texto(claims.email) ?? texto(claims.preferred_username) ?? "";
  return { id, nombre: texto(claims.name) ?? email, email };
}

function texto(valor: unknown): string | undefined {
  return typeof valor === "string" && valor.trim() !== "" ? valor.trim() : undefined;
}

// AuthorizationResponseError trae el error que Azure devolvió en el callback (por ejemplo access_denied)
function motivo(error: unknown): string {
  if (error instanceof client.AuthorizationResponseError) {
    return error.error_description ?? error.error;
  }
  return error instanceof Error ? error.message : String(error);
}
