import { and, asc, eq, ne } from "drizzle-orm";
import { getDb, type Database } from "@/config/db.config";
import { actividades, type ActividadEntity, type NuevaActividadEntity } from "../entity/actividad.entity";
import type { EstadoSuperEntity } from "../entity/estado-super.entity";
import { CATALOGOS_ESTADO_SUPER, type EstadoSuperConCatalogos } from "./estado-super.dao";

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
      with: { estadoSuper: { with: CATALOGOS_ESTADO_SUPER } },
      orderBy: (actividades, { asc }) => [asc(actividades.id)],
    });
  }

  async buscar(id: number): Promise<ActividadEntity | undefined> {
    const [actividad] = await this.db.select().from(actividades).where(eq(actividades.id, id)).limit(1);
    return actividad;
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
      with: { estadoSuper: { with: CATALOGOS_ESTADO_SUPER } },
    });
  }

  // El nombre es único dentro del proceso; excluirId omite la propia actividad al modificarla
  async existeNombreEnProceso(procesoCodigo: string, nombre: string, excluirId?: number): Promise<boolean> {
    const [fila] = await this.db
      .select({ id: actividades.id })
      .from(actividades)
      .where(
        and(
          eq(actividades.procesoCodigo, procesoCodigo),
          eq(actividades.nombre, nombre),
          excluirId === undefined ? undefined : ne(actividades.id, excluirId),
        ),
      )
      .limit(1);
    return fila !== undefined;
  }

  // Cambia el nombre, el estado SUPER (null la deja sin informar a SUPER) y el flag debe_notificar
  async actualizar(
    id: number,
    datos: { nombre: string; estadoSuperId: number | null; debeNotificar: boolean },
  ): Promise<void> {
    await this.db.update(actividades).set(datos).where(eq(actividades.id, id));
  }

  // Reemplaza el estado SUPER que tuviera la actividad
  async asignarEstadoSuper(id: number, estadoSuperId: number): Promise<void> {
    await this.db.update(actividades).set({ estadoSuperId }).where(eq(actividades.id, id));
  }
}
