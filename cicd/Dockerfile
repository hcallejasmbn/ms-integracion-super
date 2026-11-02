# Imagen de producción de ms-integracion-super.
# Se construye desde la raíz del repositorio:
#   docker build -f cicd/Dockerfile -t ms-integracion-super .

ARG NODE_VERSION=22-alpine

# --- Dependencias: se instalan aparte para aprovechar la caché de Docker ---
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# --- Build: genera .next/standalone (output: "standalone" en next.config.ts) ---
FROM node:${NODE_VERSION} AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# --- Migrador: solo drizzle-orm y pg, con las versiones de package.json ---
FROM node:${NODE_VERSION} AS migrator
WORKDIR /migrator
COPY package.json /tmp/package.json
RUN node -e "const d=require('/tmp/package.json').dependencies; \
      require('fs').writeFileSync('package.json', JSON.stringify({type:'module', dependencies:{'drizzle-orm':d['drizzle-orm'], pg:d.pg}}))" \
 && npm install --omit=dev --no-audit --no-fund

# --- Runtime ---
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DB_MIGRAR_AL_INICIAR=true

# server.js de Next con sus dependencias trazadas, más los archivos estáticos que no copia por defecto
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

# Migraciones: el historial SQL y el script que lo aplica
COPY --from=migrator --chown=node:node /migrator ./migrator
COPY --chown=node:node drizzle ./migrator/drizzle
COPY --chown=node:node cicd/migrate.mjs ./migrator/migrate.mjs

USER node
EXPOSE 3000

# Las variables (DATABASE_URL, MISUPER_*) se entregan al ejecutar el contenedor, nunca en la imagen.
# Con DB_MIGRAR_AL_INICIAR=true crea el esquema "super" y aplica las migraciones pendientes antes de levantar el servidor
CMD ["sh", "-c", "if [ \"$DB_MIGRAR_AL_INICIAR\" = true ]; then (cd migrator && node migrate.mjs) || exit 1; else echo 'Migraciones omitidas (DB_MIGRAR_AL_INICIAR != true)'; fi; exec node server.js"]
