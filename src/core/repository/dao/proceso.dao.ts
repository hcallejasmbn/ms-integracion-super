import { asc, eq } from "drizzle-orm";
import { getDb, type Database } from "@/config/db.config";
import type { ActividadEntity } from "../entity/actividad.entity";
import { procesos, type NuevoProcesoEntity, type ProcesoEntity } from "../entity/proceso.entity";

export type ProcesoConActividades = ProcesoEntity & { actividades: ActividadEntity[] };

export class ProcesoDao {
  constructor(private readonly database?: Database) { }

  // La conexión se pide al usarla, así crear el DAO no exige DATABASE_URL (por ejemplo durante `next build`)
  private get db(): Database {
    return this.database ?? getDb();
  }

  async crear(proceso: NuevoProcesoEntity): Promise<ProcesoEntity> {
    const [creado] = await this.db.insert(procesos).values(proceso).returning();
    return creado;
  }

  async listar(): Promise<ProcesoEntity[]> {
    return this.db.select().from(procesos).orderBy(asc(procesos.codigo));
  }

  async buscarPorCodigo(codigo: string): Promise<ProcesoConActividades | undefined> {
    return this.db.query.procesos.findFirst({
      where: eq(procesos.codigo, codigo),
      with: { actividades: true },
    });
  }
}
