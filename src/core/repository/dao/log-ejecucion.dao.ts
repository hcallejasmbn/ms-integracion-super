import { and, asc, count, desc, eq, gte, ilike, lt, max, min, or, sql, type SQL } from "drizzle-orm";
import { getDb, type Database } from "@/config/db.config";
import { logEjecucion, type LogEjecucionEntity, type NuevoLogEjecucionEntity } from "../entity/log-ejecucion.entity";

// Filtros de la consulta; los ausentes no filtran
export interface FiltroLogEjecucion {
  resultado?: string;
  operacion?: string;
  // Contenido en el track_id o la url, sin distinguir mayúsculas
  texto?: string;
}

export class LogEjecucionDao {
  constructor(private readonly database?: Database) { }

  // La conexión se pide al usarla, así crear el DAO no exige DATABASE_URL (por ejemplo durante `next build`)
  private get db(): Database {
    return this.database ?? getDb();
  }

  // El id lo genera la base de datos
  async crear(registro: NuevoLogEjecucionEntity): Promise<LogEjecucionEntity> {
    const [creado] = await this.db.insert(logEjecucion).values(registro).returning();
    return creado;
  }

  // Todos los intentos de una operación, en el orden en que ocurrieron
  async listarPorTrackId(trackId: string): Promise<LogEjecucionEntity[]> {
    return this.db
      .select()
      .from(logEjecucion)
      .where(eq(logEjecucion.trackId, trackId))
      .orderBy(asc(logEjecucion.id));
  }

  async buscar(id: number): Promise<LogEjecucionEntity | undefined> {
    const [registro] = await this.db.select().from(logEjecucion).where(eq(logEjecucion.id, id)).limit(1);
    return registro;
  }

  // Una página, de la más reciente a la más antigua
  async listar(filtro: FiltroLogEjecucion, limite: number, desplazamiento: number): Promise<LogEjecucionEntity[]> {
    return this.db
      .select()
      .from(logEjecucion)
      .where(condicion(filtro))
      .orderBy(desc(logEjecucion.id))
      .limit(limite)
      .offset(desplazamiento);
  }

  // Cantidad por resultado (OK, ERROR) que cumple el filtro
  async contarPorResultado(filtro: FiltroLogEjecucion): Promise<Record<string, number>> {
    const filas = await this.db
      .select({ resultado: logEjecucion.resultado, cantidad: count() })
      .from(logEjecucion)
      .where(condicion(filtro))
      .groupBy(logEjecucion.resultado);
    return Object.fromEntries(filas.map(({ resultado, cantidad }) => [resultado, cantidad]));
  }

  // Fecha de la traza más antigua y de la más reciente; null si la tabla está vacía
  async rangoFechas(): Promise<{ primera: Date | null; ultima: Date | null }> {
    const [fila] = await this.db
      .select({ primera: min(logEjecucion.fechaInicio), ultima: max(logEjecucion.fechaInicio) })
      .from(logEjecucion);
    return { primera: fila?.primera ?? null, ultima: fila?.ultima ?? null };
  }

  // Trazas cuyo día (en zonaHoraria) está entre desde y hasta, ambos incluidos (YYYY-MM-DD)
  async contarEntreDias(desde: string, hasta: string, zonaHoraria: string): Promise<number> {
    const [fila] = await this.db
      .select({ cantidad: count() })
      .from(logEjecucion)
      .where(entreDias(desde, hasta, zonaHoraria));
    return fila?.cantidad ?? 0;
  }

  // Elimina las trazas de esos días y devuelve cuántas eran
  async eliminarEntreDias(desde: string, hasta: string, zonaHoraria: string): Promise<number> {
    const eliminadas = await this.db
      .delete(logEjecucion)
      .where(entreDias(desde, hasta, zonaHoraria))
      .returning({ id: logEjecucion.id });
    return eliminadas.length;
  }

  // Operaciones que aparecen en el log, para el filtro
  async listarOperaciones(): Promise<string[]> {
    const filas = await this.db
      .selectDistinct({ operacion: logEjecucion.operacion })
      .from(logEjecucion)
      .orderBy(asc(logEjecucion.operacion));
    return filas.map(({ operacion }) => operacion);
  }
}

function condicion({ resultado, operacion, texto }: FiltroLogEjecucion): SQL | undefined {
  // % y _ son comodines de LIKE: se escapan para buscar el texto literal
  const patron = texto ? `%${texto.replace(/[\\%_]/g, "\\$&")}%` : undefined;
  return and(
    resultado ? eq(logEjecucion.resultado, resultado) : undefined,
    operacion ? eq(logEjecucion.operacion, operacion) : undefined,
    patron ? or(ilike(sql`${logEjecucion.trackId}::text`, patron), ilike(logEjecucion.url, patron)) : undefined,
  );
}

// Desde las 00:00 del día desde hasta antes de las 00:00 del día siguiente a hasta, en la zona horaria dada.
// `timestamp AT TIME ZONE zona` interpreta la hora como local de esa zona (con su horario de verano)
function entreDias(desde: string, hasta: string, zonaHoraria: string): SQL | undefined {
  return and(
    gte(logEjecucion.fechaInicio, sql`(${desde}::date)::timestamp at time zone ${zonaHoraria}`),
    lt(logEjecucion.fechaInicio, sql`(${hasta}::date + 1)::timestamp at time zone ${zonaHoraria}`),
  );
}
