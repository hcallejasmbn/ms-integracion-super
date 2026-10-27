# ms-integracion-super

Servicio construido con **Next.js 16 (App Router)**, **React 19** y **TypeScript**. Expone endpoints REST documentados con OpenAPI y páginas de presentación para el usuario.

## Requisitos

- Node.js 22.12 o superior (lo exige Vitest 5)
- [pnpm](https://pnpm.io) (la versión está fijada en `packageManager` de `package.json`)

## Comandos

```bash
pnpm install              # instala dependencias
pnpm dev                  # aplica las migraciones pendientes y levanta el servidor en http://localhost:3000
pnpm build                # build de producción (incluye verificación de tipos)
pnpm start                # sirve el build de producción
pnpm exec tsc --noEmit    # solo verificación de tipos
pnpm test                 # tests unitarios con Vitest en modo watch
pnpm test --run           # tests unitarios una vez
pnpm test:integration     # tests de integración contra la API real de Mi Súper
```

### Tests

Los tests (`*.test.ts`) están en la carpeta `tests/`, separados en dos grupos que replican la estructura de `src/`:

- **`tests/unit/`**: no usan red ni el `.env`. Los servicios reciben dependencias falsas y las variables se definen con `vi.stubEnv`.
- **`tests/integration/`**: llaman a los servicios reales con las variables del `.env`, que apunta al ambiente de QA de Mi Súper.

El test que crea una solicitud en Mi Súper se omite por defecto, para no llenar QA de registros en cada ejecución. Para ejecutarlo:

1. Completa `tests/integration/fixtures/crear-solicitud-request.fixture.ts` con datos válidos.
2. Ejecuta `MISUPER_INTEGRATION_CREAR_SOLICITUD=true pnpm test:integration`.

## Base de datos

PostgreSQL con [Drizzle ORM](https://orm.drizzle.team). Todas las tablas viven en el esquema `super`, incluido el historial de migraciones (`super.__drizzle_migrations`). Las tablas se definen en `src/core/repository/entity/` y las consultas en `src/core/repository/dao/`.

```bash
pnpm db:generate --name <cambio>   # genera la migración SQL a partir de las entidades
pnpm db:migrate                    # aplica las migraciones pendientes en DATABASE_URL
pnpm db:studio                     # explorador web de la base de datos
```

`pnpm dev` ejecuta `db:migrate` antes de levantar el servidor. `pnpm start` no lo hace: en cada despliegue hay que ejecutar `pnpm db:migrate` antes de iniciar la aplicación.

La carpeta `drizzle/` es el historial de migraciones y se versiona en git. Cada cambio de esquema se hace modificando las entidades y ejecutando `db:generate`.

Tablas actuales:

| Tabla | Columnas | Notas |
|---|---|---|
| `procesos` | `codigo` (PK), `nombre` | El código se asigna al insertar |
| `actividades` | `id` (PK autogenerada), `nombre`, `proceso_codigo` (FK) | Cada actividad pertenece a un único proceso |

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores. El código accede a ellas solo a través de `EnvConfig` (`src/config/env.config.ts`). Si falta una variable, se lanza un error con su nombre al usarla.

## Arquitectura

El proyecto usa una **arquitectura en capas simplificada**. Se eligió a propósito en lugar de Clean Architecture completa (casos de uso, puertos, contenedor de dependencias), porque el proyecto no será grande.

### Flujo de una petición

```
Cliente HTTP
    │
    ▼
app/api/<endpoint>/route.ts      Capa de exposición: valida la entrada (Zod) y arma la respuesta HTTP
    │
    ▼
service/<feature>/*.service.ts   Capa de servicio: orquesta la lógica y llama a los repositorios
    │
    ▼
core/repository/dao/*.dao.ts     Capa de datos: consultas a PostgreSQL con Drizzle

core/domain/<feature>/           Dominio: entidades, reglas de negocio y errores; lo pueden usar todas las capas
```

Las dependencias van en un solo sentido: `api → service → repository`. Una capa nunca importa a la capa que está por encima.

### Estructura de carpetas

```
src/
├── app/
│   ├── (presentacion)/          Capa de presentación: páginas para el usuario
│   │   └── page.tsx             → se sirve en /
│   ├── api/                     Capa de exposición: endpoints REST
│   │   ├── hello/
│   │   │   ├── route.ts         Handler HTTP
│   │   │   └── hello.schema.ts  Contrato: esquemas Zod y registro OpenAPI
│   │   ├── openapi/             Especificación OpenAPI generada (/api/openapi)
│   │   └── docs/                Documentación interactiva (/api/docs)
│   ├── layout.tsx               Layout raíz (Next.js lo exige aquí)
│   ├── globals.css
│   └── favicon.ico              (Next.js lo exige aquí)
├── config/
│   ├── env.config.ts            Acceso a las variables de entorno (EnvConfig)
│   └── db.config.ts             Conexión a PostgreSQL (Drizzle)
├── core/
│   ├── domain/                  Clases de dominio y reglas de negocio
│   └── repository/              Acceso a datos
│       ├── entity/              Tablas (una entidad por archivo) y relaciones
│       └── dao/                 Consultas sobre cada entidad
└── service/                     Servicios de orquestación
drizzle/                         Historial de migraciones SQL (generado con pnpm db:generate)
```

### Responsabilidades por capa

| Capa | Ubicación | Responsabilidad | No debe |
|---|---|---|---|
| Presentación | `src/app/(presentacion)/` | Páginas que ve el usuario | — |
| Exposición | `src/app/api/` | Validar la petición con Zod, llamar al servicio, armar la respuesta y convertir errores en códigos HTTP | Contener lógica de negocio |
| Servicio | `src/service/` | Orquestar: llamar a los repositorios y aplicar las reglas del dominio | Conocer `Request`/`Response` ni nada de HTTP |
| Repositorio | `src/core/repository/` | Obtener y guardar datos | Contener lógica de negocio |
| Dominio | `src/core/domain/` | Entidades, reglas de negocio y errores de dominio | Depender de otras capas o de Next.js |

### Sobre `(presentacion)`

En Next.js cada carpeta dentro de `app/` forma parte de la URL. Los paréntesis convierten la carpeta en un **route group**: sirve para organizar, pero no aparece en la URL. Así, `(presentacion)/page.tsx` se sirve en `/` y `(presentacion)/productos/page.tsx` en `/productos`. Si se quitan los paréntesis, todas las páginas pasan a estar bajo `/presentacion`.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/hello` | Devuelve un saludo |
| `GET` | `/api/openapi` | Especificación OpenAPI 3.1 en JSON |
| `GET` | `/api/docs` | Documentación interactiva de la API (Scalar) |

### `GET /api/hello`

**Parámetros de query**

| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `name` | string (máx. 50 caracteres) | No | Nombre a saludar. Si se omite, se usa `"Mundo"`. |

**Respuestas**

`200 OK`

```bash
curl "http://localhost:3000/api/hello?name=Juan"
```

```json
{ "message": "¡Hola, Juan!", "timestamp": "2026-10-21T13:57:13.535Z" }
```

`400 Bad Request`: el nombre supera los 50 caracteres.

```json
{ "error": "El nombre no puede superar 50 caracteres" }
```

## Documentación de la API (OpenAPI)

La especificación se genera a partir de los mismos esquemas [Zod](https://zod.dev) que validan las peticiones, con [`@asteasolutions/zod-to-openapi`](https://github.com/asteasolutions/zod-to-openapi). Por eso la documentación no puede quedar desalineada con el código. La interfaz se muestra con [Scalar](https://scalar.com).

- Interfaz interactiva: <http://localhost:3000/api/docs>
- Especificación en JSON: <http://localhost:3000/api/openapi>, que se puede importar en Postman, Insomnia, etc.

La página `/api/docs` carga Scalar desde el CDN de jsDelivr, así que necesita conexión a internet en el navegador.

### Agregar un endpoint nuevo

1. **Dominio:** crea las entidades y reglas en `src/core/domain/<feature>/`.
2. **Repositorio:** crea el acceso a datos en `src/core/repository/<feature>.repository.ts`.
3. **Servicio:** crea la orquestación en `src/service/<feature>/<feature>.service.ts`. El servicio recibe y devuelve tipos del dominio, nunca `Request` ni `Response`.
4. **Contrato:** crea `src/app/api/<ruta>/<ruta>.schema.ts` con los esquemas Zod de entrada y salida, y una función `register<Ruta>Paths(registry)`. Usa `.meta({ id, description, example })` para la documentación.
5. **Handler:** crea `src/app/api/<ruta>/route.ts`. Valida con el esquema (`safeParse`), llama al servicio y devuelve la respuesta tipada.
6. **Registro:** llama a `register<Ruta>Paths(registry)` en `src/app/api/openapi/openapi.document.ts`.
7. **README:** agrega el endpoint a la sección [Endpoints](#endpoints).

`src/app/api/hello/` es el ejemplo de referencia.
