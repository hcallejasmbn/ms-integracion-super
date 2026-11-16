// Prefijo de todas las URL de la app (basePath de Next.js). Identifica la app cuando comparte host con otras.
// Next lo fija al compilar, por eso es una constante y no una variable de entorno.
// Next lo agrega solo en <Link>, redirect() y router; hay que agregarlo a mano en Response.redirect,
// en el path de las cookies, en el src de next/image y en las URL absolutas que se pasan a terceros
export const BASE_PATH = "/ms-integracion-super";
