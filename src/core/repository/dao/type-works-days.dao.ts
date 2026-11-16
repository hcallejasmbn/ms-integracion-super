import { asc, eq } from "drizzle-orm";
import { getDb, type Database } from "@/config/db.config";
import { typeWorksDays, type TypeWorksDaysEntity } from "../entity/type-works-days.entity";

export class TypeWorksDaysDao {
  constructor(private readonly database?: Database) { }

  // La conexión se pide al usarla, así crear el DAO no exige DATABASE_URL (por ejemplo durante `next build`)
  private get db(): Database {
    return this.database ?? getDb();
  }

  async listar(): Promise<TypeWorksDaysEntity[]> {
    return this.db.select().from(typeWorksDays).orderBy(asc(typeWorksDays.code));
  }

  async existe(code: string): Promise<boolean> {
    const [fila] = await this.db
      .select({ code: typeWorksDays.code })
      .from(typeWorksDays)
      .where(eq(typeWorksDays.code, code))
      .limit(1);
    return fila !== undefined;
  }
}
