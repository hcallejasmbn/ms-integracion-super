import { asc, desc, eq, getTableColumns, inArray } from "drizzle-orm";
import { getDb, type Database } from "@/config/db.config";
import { actividades } from "../entity/actividad.entity";
import {
  expedientesTramitando,
  type ExpedienteTramitandoEntity,
  type NuevoExpedienteTramitandoEntity,
} from "../entity/expediente-tramitando.entity";

export type ExpedienteTramitandoConActividadEntity = ExpedienteTramitandoEntity & { actividadNombre: string };

export class ExpedienteTramitandoDao {
  constructor(private readonly database?: Database) { }

  // La conexión se pide al usarla, así crear el DAO no exige DATABASE_URL (por ejemplo durante `next build`)
  private get db(): Database {
    return this.database ?? getDb();
  }

  // El id lo genera la base de datos
  async crear(cambio: NuevoExpedienteTramitandoEntity): Promise<ExpedienteTramitandoEntity> {
    const [creado] = await this.db.insert(expedientesTramitando).values(cambio).returning();
    return creado;
  }

  // Último cambio registrado del expediente; con él se decide si la actividad cambió
  async buscarUltimoPorExpediente(codigoExpediente: string): Promise<ExpedienteTramitandoEntity | undefined> {
    const [ultimo] = await this.db
      .select()
      .from(expedientesTramitando)
      .where(eq(expedientesTramitando.codigoExpediente, codigoExpediente))
      .orderBy(desc(expedientesTramitando.fechaActividad), desc(expedientesTramitando.id))
      .limit(1);
    return ultimo;
  }

  // Último cambio de cada expediente indicado, con el nombre de su actividad, en una sola consulta
  async listarUltimosPorExpedientes(codigosExpediente: string[]): Promise<ExpedienteTramitandoConActividadEntity[]> {
    if (codigosExpediente.length === 0) return [];
    return this.db
      .selectDistinctOn([expedientesTramitando.codigoExpediente], {
        ...getTableColumns(expedientesTramitando),
        actividadNombre: actividades.nombre,
      })
      .from(expedientesTramitando)
      .innerJoin(actividades, eq(actividades.id, expedientesTramitando.actividadId))
      .where(inArray(expedientesTramitando.codigoExpediente, codigosExpediente))
      .orderBy(
        asc(expedientesTramitando.codigoExpediente),
        desc(expedientesTramitando.fechaActividad),
        desc(expedientesTramitando.id),
      );
  }
}
