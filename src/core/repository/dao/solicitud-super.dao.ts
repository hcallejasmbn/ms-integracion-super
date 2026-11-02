import { eq } from "drizzle-orm";
import { getDb, type Database } from "@/config/db.config";
import {
  solicitudesSuper,
  type NuevaSolicitudSuperEntity,
  type SolicitudSuperEntity,
} from "../entity/solicitud-super.entity";

export class SolicitudSuperDao {
  constructor(private readonly database?: Database) { }

  // La conexión se pide al usarla, así crear el DAO no exige DATABASE_URL (por ejemplo durante `next build`)
  private get db(): Database {
    return this.database ?? getDb();
  }

  async crear(solicitud: NuevaSolicitudSuperEntity): Promise<SolicitudSuperEntity> {
    const [creada] = await this.db.insert(solicitudesSuper).values(solicitud).returning();
    return creada;
  }

  async buscarPorCodigoExpediente(codigoExpediente: string): Promise<SolicitudSuperEntity | undefined> {
    const [solicitud] = await this.db
      .select()
      .from(solicitudesSuper)
      .where(eq(solicitudesSuper.codigoExpediente, codigoExpediente));
    return solicitud;
  }
}
