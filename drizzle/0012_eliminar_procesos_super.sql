-- Orden ajustado a mano antes de aplicarla: drizzle-kit borraba procesos_super (CASCADE, que también borra la FK)
-- antes de borrar esa FK, y el DROP CONSTRAINT fallaba
ALTER TABLE "super"."estados_super" DROP CONSTRAINT "estados_super_proceso_code_uq";--> statement-breakpoint
ALTER TABLE "super"."estados_super" DROP CONSTRAINT "estados_super_proceso_super_codigo_procesos_super_codigo_fk";--> statement-breakpoint
ALTER TABLE "super"."estados_super" ALTER COLUMN "proceso_codigo" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "super"."estados_super" DROP COLUMN "proceso_super_codigo";--> statement-breakpoint
ALTER TABLE "super"."estados_super" ADD CONSTRAINT "estados_super_proceso_code_uq" UNIQUE("proceso_codigo","code");--> statement-breakpoint
ALTER TABLE "super"."procesos_super" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "super"."procesos_super";
