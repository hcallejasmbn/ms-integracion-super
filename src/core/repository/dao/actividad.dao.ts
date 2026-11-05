import { asc, eq } from "drizzle-orm";
import { getDb, type Database } from "@/config/db.config";
import { actividades, type ActividadEntity, type NuevaActividadEntity } from "../entity/actividad.entity";
import type { EstadoSuperEntity } from "../entity/estado-super.entity";
import type { EstadoSuperConCatalogos } from "./estado-super.dao";

export type ActividadConEstadoSuper = ActividadEntity & { estadoSuper: EstadoSuperConCatalogos | null };

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

  // undefined si la actividad no informa a SUPER (estado_super_id null)
  async buscarEstadoSuper(actividadId: number): Promise<EstadoSuperEntity | undefined> {
    const actividad = await this.db.query.actividades.findFirst({
      where: eq(actividades.id, actividadId),
      with: { estadoSuper: true },
    });
    return actividad?.estadoSuper ?? undefined;
  }

  // Actividades del proceso con su estado SUPER (estado_super_id), si tienen
  async listarConEstadoSuperPorProceso(procesoCodigo: string): Promise<ActividadConEstadoSuper[]> {
    return this.db.query.actividades.findMany({
      where: eq(actividades.procesoCodigo, procesoCodigo),
      with: { estadoSuper: { with: { stageCodeInfo: true, statusCodeInfo: true } } },
      orderBy: (actividades, { asc }) => [asc(actividades.id)],
    });
  }

  async existe(id: number): Promise<boolean> {
    const [fila] = await this.db.select({ id: actividades.id }).from(actividades).where(eq(actividades.id, id)).limit(1);
    return fila !== undefined;
  }

  // Actividad que ya tiene asignado el estado SUPER, si hay una
  async buscarPorEstadoSuper(estadoSuperId: number): Promise<ActividadEntity | undefined> {
    const [actividad] = await this.db
      .select()
      .from(actividades)
      .where(eq(actividades.estadoSuperId, estadoSuperId))
      .limit(1);
    return actividad;
  }

  async buscarConEstadoSuper(id: number): Promise<ActividadConEstadoSuper | undefined> {
    return this.db.query.actividades.findFirst({
      where: eq(actividades.id, id),
      with: { estadoSuper: { with: { stageCodeInfo: true, statusCodeInfo: true } } },
    });
  }

  // Reemplaza el estado SUPER que tuviera la actividad
  async asignarEstadoSuper(id: number, estadoSuperId: number): Promise<void> {
    await this.db.update(actividades).set({ estadoSuperId }).where(eq(actividades.id, id));
  }
}
