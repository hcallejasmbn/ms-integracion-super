// Aplica las migraciones de drizzle/ al iniciar el contenedor.
// La imagen no incluye drizzle-kit, así que se usa el migrador de drizzle-orm,
// que escribe en la misma tabla de historial (super.__drizzle_migrations).
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

// El migrador de drizzle-orm no bloquea nada: si varias réplicas arrancan a la vez,
// todas ejecutarían las mismas migraciones. Este advisory lock hace que migre una
// sola y que las demás esperen (lo mismo que hace Flyway). Cualquier valor fijo sirve,
// mientras todas las instancias usen el mismo.
const LOCK_MIGRACIONES = "ms-integracion-super:migraciones";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Falta la variable de entorno DATABASE_URL");
  process.exit(1);
}

// Una sola conexión: el advisory lock pertenece a la sesión que lo toma,
// así que las migraciones deben correr en esa misma conexión
const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  console.log("Esperando el bloqueo de migraciones...");
  await client.query("SELECT pg_advisory_lock(hashtext($1))", [LOCK_MIGRACIONES]);
  try {
    await migrate(drizzle({ client }), { migrationsFolder: "./drizzle", migrationsSchema: "super" });
    console.log("Migraciones aplicadas");
  } finally {
    await client.query("SELECT pg_advisory_unlock(hashtext($1))", [LOCK_MIGRACIONES]);
  }
} finally {
  // Al cerrar la conexión PostgreSQL también libera el lock, aunque falle el unlock
  await client.end();
}
