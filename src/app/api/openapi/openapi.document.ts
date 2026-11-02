import { OpenAPIRegistry, OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { registerSolicitudesPaths } from "../super/solicitudes/solicitudes.schema";

const registry = new OpenAPIRegistry();

// Registrar aquí los paths de cada endpoint nuevo.
// /api/hello es solo el ejemplo de referencia y no se publica en la documentación
registerSolicitudesPaths(registry);

export const openApiDocument = new OpenApiGeneratorV31(registry.definitions).generateDocument({
  openapi: "3.1.0",
  info: {
    title: "ms-integracion-super API",
    version: "0.1.0",
  },
});
