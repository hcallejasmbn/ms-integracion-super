import { OpenAPIRegistry, OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { registerActividadesPaths } from "../procesos/[codigo]/actividades/actividades.schema";
import { registerEstadosSuperProcesoPaths } from "../procesos/[codigo]/estados-super/estados-super.schema";
import { registerProcesosPaths } from "../procesos/procesos.schema";
import { registerEstadosSuperPaths } from "../super/procesos/[codigo]/estados/estados.schema";
import { registerSolicitudesPaths } from "../super/solicitudes/solicitudes.schema";

const registry = new OpenAPIRegistry();

// Registrar aquí los paths de cada endpoint nuevo
registerProcesosPaths(registry);
registerActividadesPaths(registry);
registerEstadosSuperProcesoPaths(registry);
registerEstadosSuperPaths(registry);
registerSolicitudesPaths(registry);

export const openApiDocument = new OpenApiGeneratorV31(registry.definitions).generateDocument({
  openapi: "3.1.0",
  info: {
    title: "ms-integracion-super API",
    version: "0.1.0",
  },
});
