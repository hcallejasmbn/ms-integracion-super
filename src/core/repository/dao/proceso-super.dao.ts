import { asc, eq } from "drizzle-orm";
import { getDb, type Database } from "@/config/db.config";
import type { EstadoSuperEntity } from "../entity/estado-super.entity";
import { procesosSuper, type NuevoProcesoSuperEntity, type ProcesoSuperEntity } from "../entity/proceso-super.entity";

export type ProcesoSuperConEstados = ProcesoSuperEntity & { estados: EstadoSuperEntity[] };

export class ProcesoSuperDao {
  constructor(private readonly database?: Database) { }

  // La conexión se pide al usarla, así crear el DAO no exige DATABASE_URL (por ejemplo durante `next build`)
  private get db(): Database {
    return this.database ?? getDb();
  }

  async crear(procesoSuper: NuevoProcesoSuperEntity): Promise<ProcesoSuperEntity> {
    const [creado] = await this.db.insert(procesosSuper).values(procesoSuper).returning();
    return creado;
  }

  async listar(): Promise<ProcesoSuperEntity[]> {
    return this.db.select().from(procesosSuper).orderBy(asc(procesosSuper.codigo));
  }

  async buscarPorCodigo(codigo: string): Promise<ProcesoSuperConEstados | undefined> {
    return this.db.query.procesosSuper.findFirst({
      where: eq(procesosSuper.codigo, codigo),
      with: { estados: { orderBy: (estados, { asc }) => [asc(estados.id)] } },
    });
  }
}
