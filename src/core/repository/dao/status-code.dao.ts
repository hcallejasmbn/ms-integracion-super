import { asc, eq } from "drizzle-orm";
import { getDb, type Database } from "@/config/db.config";
import { statusCodes, type StatusCodeEntity, type NuevoStatusCodeEntity } from "../entity/status-code.entity";

export class StatusCodeDao {
  constructor(private readonly database?: Database) { }

  // La conexión se pide al usarla, así crear el DAO no exige DATABASE_URL (por ejemplo durante `next build`)
  private get db(): Database {
    return this.database ?? getDb();
  }

  async crear(statusCode: NuevoStatusCodeEntity): Promise<StatusCodeEntity> {
    const [creado] = await this.db.insert(statusCodes).values(statusCode).returning();
    return creado;
  }

  async listar(): Promise<StatusCodeEntity[]> {
    return this.db.select().from(statusCodes).orderBy(asc(statusCodes.code));
  }

  async existe(code: string): Promise<boolean> {
    const [fila] = await this.db.select({ code: statusCodes.code }).from(statusCodes).where(eq(statusCodes.code, code)).limit(1);
    return fila !== undefined;
  }
}
