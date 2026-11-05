import { asc, desc, eq, getTableColumns, gte } from "drizzle-orm";
import { getDb, type Database } from "@/config/db.config";
import { actividades } from "../entity/actividad.entity";
import {
  cargaActividadesExpedientes,
  type CargaActividadExpedienteEntity,
  type NuevaCargaActividadExpedienteEntity,
} from "../entity/carga-actividad-expediente.entity";

// Movimiento con el nombre de su actividad; null si actividad_id no existe en actividades (la carga no tiene FK)
export type CargaConActividadEntity = CargaActividadExpedienteEntity & { actividadNombre: string | null };

export class CargaActividadExpedienteDao {
  constructor(private readonly database?: Database) { }

  // La conexión se pide al usarla, así crear el DAO no exige DATABASE_URL (por ejemplo durante `next build`)
  private get db(): Database {
    return this.database ?? getDb();
  }

  // En producción la llena el procedimiento diario; el id lo genera la base de datos
  async crear(movimiento: NuevaCargaActividadExpedienteEntity): Promise<CargaActividadExpedienteEntity> {
    const [creado] = await this.db.insert(cargaActividadesExpedientes).values(movimiento).returning();
    return creado;
  }

  // Todos los movimientos cargados, por expediente y en el orden en que ocurrieron
  async listar(): Promise<CargaActividadExpedienteEntity[]> {
    return this.db
      .select()
      .from(cargaActividadesExpedientes)
      .orderBy(
        asc(cargaActividadesExpedientes.codigoExpediente),
        asc(cargaActividadesExpedientes.fechaActividad),
        asc(cargaActividadesExpedientes.id),
      );
  }

  // Último movimiento de cada expediente, con el nombre de la actividad para compararla.
  // Si la tabla acumula varias cargas, solo cuenta el más reciente
  async listarUltimoPorExpediente(): Promise<CargaConActividadEntity[]> {
    return this.db
      .selectDistinctOn([cargaActividadesExpedientes.codigoExpediente], {
        ...getTableColumns(cargaActividadesExpedientes),
        actividadNombre: actividades.nombre,
      })
      .from(cargaActividadesExpedientes)
      .leftJoin(actividades, eq(actividades.id, cargaActividadesExpedientes.actividadId))
      .orderBy(
        asc(cargaActividadesExpedientes.codigoExpediente),
        desc(cargaActividadesExpedientes.fechaActividad),
        desc(cargaActividadesExpedientes.id),
      );
  }

  // Movimientos cargados desde la fecha indicada, por expediente y en el orden en que ocurrieron
  async listarCargadosDesde(desde: Date): Promise<CargaActividadExpedienteEntity[]> {
    return this.db
      .select()
      .from(cargaActividadesExpedientes)
      .where(gte(cargaActividadesExpedientes.fechaCarga, desde))
      .orderBy(
        asc(cargaActividadesExpedientes.codigoExpediente),
        asc(cargaActividadesExpedientes.fechaActividad),
        asc(cargaActividadesExpedientes.id),
      );
  }
}
