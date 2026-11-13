import { and, asc, eq, ne } from "drizzle-orm";
import { getDb, type Database } from "@/config/db.config";
import { estadosSuper, type EstadoSuperEntity, type NuevoEstadoSuperEntity } from "../entity/estado-super.entity";
import type { StageCodeEntity } from "../entity/stage-code.entity";
import type { StatusCodeEntity } from "../entity/status-code.entity";
import type { TypeResponsibleEntity } from "../entity/type-responsible.entity";
import type { TypeWorksDaysEntity } from "../entity/type-works-days.entity";

export type EstadoSuperConCatalogos = EstadoSuperEntity & {
  stageCodeInfo: StageCodeEntity;
  statusCodeInfo: StatusCodeEntity;
  useWorkingDaysInfo: TypeWorksDaysEntity;
  responsibleTypeInfo: TypeResponsibleEntity;
};

// Relaciones con los catálogos que trae un EstadoSuperConCatalogos; ActividadDao las usa al cargar el estado
export const CATALOGOS_ESTADO_SUPER = {
  stageCodeInfo: true,
  statusCodeInfo: true,
  useWorkingDaysInfo: true,
  responsibleTypeInfo: true,
} as const;

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

  async listarPorProceso(procesoCodigo: string): Promise<EstadoSuperEntity[]> {
    return this.db
      .select()
      .from(estadosSuper)
      .where(eq(estadosSuper.procesoCodigo, procesoCodigo))
      .orderBy(asc(estadosSuper.id));
  }

  // Incluye el valor SUPER de stage_code y status_code (por ejemplo ENTRY y ENTERED) y la descripción de use_working_days y responsible_type
  async listarConCatalogosPorProceso(procesoCodigo: string): Promise<EstadoSuperConCatalogos[]> {
    return this.db.query.estadosSuper.findMany({
      where: eq(estadosSuper.procesoCodigo, procesoCodigo),
      with: CATALOGOS_ESTADO_SUPER,
      orderBy: (estados, { asc }) => [asc(estados.id)],
    });
  }

  async buscar(id: number): Promise<EstadoSuperEntity | undefined> {
    const [estado] = await this.db.select().from(estadosSuper).where(eq(estadosSuper.id, id)).limit(1);
    return estado;
  }

  // code es único dentro de cada proceso; excluirId omite el propio estado al modificarlo
  async existeCodeEnProceso(procesoCodigo: string, code: string, excluirId?: number): Promise<boolean> {
    const [fila] = await this.db
      .select({ id: estadosSuper.id })
      .from(estadosSuper)
      .where(
        and(
          eq(estadosSuper.procesoCodigo, procesoCodigo),
          eq(estadosSuper.code, code),
          excluirId === undefined ? undefined : ne(estadosSuper.id, excluirId),
        ),
      )
      .limit(1);
    return fila !== undefined;
  }

  // El proceso del estado no cambia
  async actualizar(id: number, datos: Omit<NuevoEstadoSuperEntity, "id" | "procesoCodigo">): Promise<void> {
    await this.db.update(estadosSuper).set(datos).where(eq(estadosSuper.id, id));
  }

  async buscarConCatalogos(id: number): Promise<EstadoSuperConCatalogos | undefined> {
    return this.db.query.estadosSuper.findFirst({
      where: eq(estadosSuper.id, id),
      with: CATALOGOS_ESTADO_SUPER,
    });
  }
}
