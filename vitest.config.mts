import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    // Los tests que usan vi.stubEnv recuperan los valores originales al terminar
    unstubEnvs: true,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          // Carga el .env para llamar a los servicios reales
          setupFiles: ["tests/integration/setup.ts"],
          testTimeout: 30_000,
        },
      },
    ],
  },
});
