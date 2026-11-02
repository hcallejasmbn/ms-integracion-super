import { integer, unique, varchar } from "drizzle-orm/pg-core";
import { procesosSuper } from "./proceso-super.entity";
import { stageCodes } from "./stage-code.entity";
import { statusCodes } from "./status-code.entity";
import { superSchema } from "./super.schema";

// Estados de SUPER por proceso. Las columnas con nombre en inglés son los campos del manual de SUPER;
// stage_code y status_code guardan el código interno de su catálogo (por ejemplo "1"). El resto
// se guarda tal como lo define SUPER, sin validar su formato
export const estadosSuper = superSchema.table(
  "estados_super",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    procesoSuperCodigo: varchar("proceso_super_codigo", { length: 50 })
      .notNull()
      // Si cambia el código del proceso, sus estados lo siguen
      .references(() => procesosSuper.codigo, { onDelete: "restrict", onUpdate: "cascade" }),
    // Por ejemplo IWSP-1
    code: varchar("code", { length: 20 }).notNull(),
    stageCode: varchar("stage_code", { length: 50 })
      .notNull()
      .references(() => stageCodes.code, { onDelete: "restrict", onUpdate: "cascade" }),
    status: varchar("status", { length: 150 }).notNull(),
    statusCode: varchar("status_code", { length: 50 })
      .notNull()
      .references(() => statusCodes.code, { onDelete: "restrict", onUpdate: "cascade" }),
    subtask: varchar("subtask", { length: 255 }).notNull(),
    // DÍAS HÁBILES o DÍAS CORRIDOS, tal como viene en el manual
    useWorkingDays: varchar("use_working_days", { length: 50 }).notNull(),
    responsibleType: varchar("responsible_type", { length: 50 }).notNull(),
    // Solo algunos estados la tienen
    suspensionType: varchar("suspension_type", { length: 10 }),
  },
  (table) => [
    // El índice de la restricción empieza por el proceso, así que también sirve para listar sus estados
    unique("estados_super_proceso_code_uq").on(table.procesoSuperCodigo, table.code),
  ],
);

export type EstadoSuperEntity = typeof estadosSuper.$inferSelect;
export type NuevoEstadoSuperEntity = typeof estadosSuper.$inferInsert;
