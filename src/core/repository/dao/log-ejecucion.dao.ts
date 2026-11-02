import { asc, eq } from "drizzle-orm";
import { getDb, type Database } from "@/config/db.config";
import { logEjecucion, type LogEjecucionEntity, type NuevoLogEjecucionEntity } from "../entity/log-ejecucion.entity";

export class LogEjecucionDao {
  constructor(private readonly database?: Database) { }

  // La conexión se pide al usarla, así crear el DAO no exige DATABASE_URL (por ejemplo durante `next build`)
  private get db(): Database {
    return this.database ?? getDb();
  }

  // El id lo genera la base de datos
  async crear(registro: NuevoLogEjecucionEntity): Promise<LogEjecucionEntity> {
    const [creado] = await this.db.insert(logEjecucion).values(registro).returning();
    return creado;
  }

  // Todos los intentos de una operación, en el orden en que ocurrieron
  async listarPorTrackId(trackId: string): Promise<LogEjecucionEntity[]> {
    return this.db
      .select()
      .from(logEjecucion)
      .where(eq(logEjecucion.trackId, trackId))
      .orderBy(asc(logEjecucion.id));
  }
}
