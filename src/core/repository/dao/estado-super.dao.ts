import { asc, eq } from "drizzle-orm";
import { getDb, type Database } from "@/config/db.config";
import { estadosSuper, type EstadoSuperEntity, type NuevoEstadoSuperEntity } from "../entity/estado-super.entity";

export class EstadoSuperDao {
  constructor(private readonly database?: Database) { }

  // La conexión se pide al usarla, así crear el DAO no exige DATABASE_URL (por ejemplo durante `next build`)
  private get db(): Database {
    return this.database ?? getDb();
  }

  // El id lo genera la base de datos
  async crear(estado: NuevoEstadoSuperEntity): Promise<EstadoSuperEntity> {
    const [creado] = await this.db.insert(estadosSuper).values(estado).returning();
    return creado;
  }

  async listarPorProceso(procesoSuperCodigo: string): Promise<EstadoSuperEntity[]> {
    return this.db
      .select()
      .from(estadosSuper)
      .where(eq(estadosSuper.procesoSuperCodigo, procesoSuperCodigo))
      .orderBy(asc(estadosSuper.id));
  }
}
