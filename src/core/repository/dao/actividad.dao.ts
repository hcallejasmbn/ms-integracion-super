import { asc, eq } from "drizzle-orm";
import { getDb, type Database } from "@/config/db.config";
import { actividades, type ActividadEntity, type NuevaActividadEntity } from "../entity/actividad.entity";

export class ActividadDao {
  constructor(private readonly database?: Database) { }

  // La conexión se pide al usarla, así crear el DAO no exige DATABASE_URL (por ejemplo durante `next build`)
  private get db(): Database {
    return this.database ?? getDb();
  }

  // El id lo genera la base de datos
  async crear(actividad: NuevaActividadEntity): Promise<ActividadEntity> {
    const [creada] = await this.db.insert(actividades).values(actividad).returning();
    return creada;
  }

  async listarPorProceso(procesoCodigo: string): Promise<ActividadEntity[]> {
    return this.db
      .select()
      .from(actividades)
      .where(eq(actividades.procesoCodigo, procesoCodigo))
      .orderBy(asc(actividades.id));
  }
}
