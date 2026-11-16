import { ApiReference } from "@scalar/nextjs-api-reference";
import { BASE_PATH } from "@/config/base-path";

// El navegador pide la especificación por URL, así que necesita el basePath
export const GET = ApiReference({ url: `${BASE_PATH}/api/openapi` });
