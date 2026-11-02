import { eq } from "drizzle-orm";
import { getDb, type Database } from "@/config/db.config";
import {
  actividadesEstadosSuper,
  type ActividadEstadoSuperEntity,
  type NuevaActividadEstadoSuperEntity,
} from "../entity/actividad-estado-super.entity";
import type { EstadoSuperEntity } from "../entity/estado-super.entity";

export class ActividadEstadoSuperDao {
  constructor(private readonly database?: Database) { }

  // La conexión se pide al usarla, así crear el DAO no exige DATABASE_URL (por ejemplo durante `next build`)
  private get db(): Database {
    return this.database ?? getDb();
  }

  async crear(relacion: NuevaActividadEstadoSuperEntity): Promise<ActividadEstadoSuperEntity> {
    const [creada] = await this.db.insert(actividadesEstadosSuper).values(relacion).returning();
    return creada;
  }

  // undefined si la actividad no informa a SUPER
  async buscarEstadoPorActividad(actividadId: number): Promise<EstadoSuperEntity | undefined> {
    const relacion = await this.db.query.actividadesEstadosSuper.findFirst({
      where: eq(actividadesEstadosSuper.actividadId, actividadId),
      with: { estadoSuper: true },
    });
    return relacion?.estadoSuper;
  }
}
