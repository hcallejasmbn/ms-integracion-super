import { asc, eq } from "drizzle-orm";
import { getDb, type Database } from "@/config/db.config";
import { typeResponsible, type TypeResponsibleEntity } from "../entity/type-responsible.entity";

export class TypeResponsibleDao {
  constructor(private readonly database?: Database) { }

  // La conexión se pide al usarla, así crear el DAO no exige DATABASE_URL (por ejemplo durante `next build`)
  private get db(): Database {
    return this.database ?? getDb();
  }

  async listar(): Promise<TypeResponsibleEntity[]> {
    return this.db.select().from(typeResponsible).orderBy(asc(typeResponsible.code));
  }

  async existe(code: string): Promise<boolean> {
    const [fila] = await this.db
      .select({ code: typeResponsible.code })
      .from(typeResponsible)
      .where(eq(typeResponsible.code, code))
      .limit(1);
    return fila !== undefined;
  }
}
