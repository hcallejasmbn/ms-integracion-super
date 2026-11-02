import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Genera .next/standalone: un server.js con solo las dependencias necesarias, para la imagen Docker
  output: "standalone",
};

export default nextConfig;
