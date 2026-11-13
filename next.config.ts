import type { NextConfig } from "next";
import { BASE_PATH } from "./src/config/base-path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Toda la app se sirve bajo /ms-integracion-super (ver src/config/base-path.ts)
  basePath: BASE_PATH,
  // El indicador de `next dev` va a la derecha: a la izquierda tapaba el usuario del menú lateral
  devIndicators: { position: "bottom-right" },
  // Genera .next/standalone: un server.js con solo las dependencias necesarias, para la imagen Docker
  output: "standalone",
};

export default nextConfig;
