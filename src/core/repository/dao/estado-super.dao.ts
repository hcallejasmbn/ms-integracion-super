import { asc, eq } from "drizzle-orm";
import { getDb, type Database } from "@/config/db.config";
import { estadosSuper, type EstadoSuperEntity, type NuevoEstadoSuperEntity } from "../entity/estado-super.entity";
import type { StageCodeEntity } from "../entity/stage-code.entity";
import type { StatusCodeEntity } from "../entity/status-code.entity";

export type EstadoSuperConCatalogos = EstadoSuperEntity & {
  stageCodeInfo: StageCodeEntity;
  statusCodeInfo: StatusCodeEntity;
};

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

  // Incluye el valor SUPER de stage_code y status_code (por ejemplo ENTRY y ENTERED)
  async listarConCatalogosPorProceso(procesoSuperCodigo: string): Promise<EstadoSuperConCatalogos[]> {
    return this.db.query.estadosSuper.findMany({
      where: eq(estadosSuper.procesoSuperCodigo, procesoSuperCodigo),
      with: { stageCodeInfo: true, statusCodeInfo: true },
      orderBy: (estados, { asc }) => [asc(estados.id)],
    });
  }
}
