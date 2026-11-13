import { OpenAPIRegistry, OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { BASE_PATH } from "@/config/base-path";
import { registerCallbackPaths } from "../auth/callback/callback.schema";
import { registerLoginPaths } from "../auth/login/login.schema";
import { registerLogoutPaths } from "../auth/logout/logout.schema";
import { registerSesionPaths } from "../auth/sesion/sesion.schema";
import { registerEstadoSuperActividadPaths } from "../actividades/[id]/estado-super/estado-super.schema";
import { registerActividadesPaths } from "../procesos/[codigo]/actividades/actividades.schema";
import { registerProcesoPaths } from "../procesos/[codigo]/proceso.schema";
import { registerEstadosSuperPaths } from "../procesos/[codigo]/estados-super/estados-super.schema";
import { registerProcesosPaths } from "../procesos/procesos.schema";
import { registerSolicitudesPaths } from "../super/solicitudes/solicitudes.schema";
import { registerStageCodesPaths } from "../super/stage-codes/stage-codes.schema";
import { registerStatusCodesPaths } from "../super/status-codes/status-codes.schema";
import { registerTypeResponsiblePaths } from "../super/type-responsible/type-responsible.schema";
import { registerTypeWorksDaysPaths } from "../super/type-works-days/type-works-days.schema";

const registry = new OpenAPIRegistry();

// Registrar aquí los paths de cada endpoint nuevo
registerProcesosPaths(registry);
registerProcesoPaths(registry);
registerActividadesPaths(registry);
registerEstadosSuperPaths(registry);
registerEstadoSuperActividadPaths(registry);
registerStageCodesPaths(registry);
registerStatusCodesPaths(registry);
registerTypeWorksDaysPaths(registry);
registerTypeResponsiblePaths(registry);
registerSolicitudesPaths(registry);
registerLoginPaths(registry);
registerCallbackPaths(registry);
registerLogoutPaths(registry);
registerSesionPaths(registry);

export const openApiDocument = new OpenApiGeneratorV31(registry.definitions).generateDocument({
  openapi: "3.1.0",
  info: {
    title: "ms-integracion-super API",
    version: "0.1.0",
  },
  // Los paths del documento no llevan el basePath; el server se lo agrega al probar desde Scalar
  servers: [{ url: BASE_PATH }],
});
