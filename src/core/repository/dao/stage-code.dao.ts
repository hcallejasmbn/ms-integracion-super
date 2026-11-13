import { asc, eq } from "drizzle-orm";
import { getDb, type Database } from "@/config/db.config";
import { stageCodes, type StageCodeEntity, type NuevoStageCodeEntity } from "../entity/stage-code.entity";

export class StageCodeDao {
  constructor(private readonly database?: Database) { }

  // La conexión se pide al usarla, así crear el DAO no exige DATABASE_URL (por ejemplo durante `next build`)
  private get db(): Database {
    return this.database ?? getDb();
  }

  async crear(stageCode: NuevoStageCodeEntity): Promise<StageCodeEntity> {
    const [creado] = await this.db.insert(stageCodes).values(stageCode).returning();
    return creado;
  }

  async listar(): Promise<StageCodeEntity[]> {
    return this.db.select().from(stageCodes).orderBy(asc(stageCodes.code));
  }

  async existe(code: string): Promise<boolean> {
    const [fila] = await this.db.select({ code: stageCodes.code }).from(stageCodes).where(eq(stageCodes.code, code)).limit(1);
    return fila !== undefined;
  }
}
