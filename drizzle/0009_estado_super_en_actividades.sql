ALTER TABLE "super"."actividades_estados_super" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "super"."actividades_estados_super" CASCADE;--> statement-breakpoint
ALTER TABLE "super"."actividades" ADD COLUMN "estado_super_id" integer;--> statement-breakpoint
ALTER TABLE "super"."actividades" ADD CONSTRAINT "actividades_estado_super_id_estados_super_id_fk" FOREIGN KEY ("estado_super_id") REFERENCES "super"."estados_super"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "super"."actividades" ADD CONSTRAINT "actividades_estado_super_id_uq" UNIQUE("estado_super_id");