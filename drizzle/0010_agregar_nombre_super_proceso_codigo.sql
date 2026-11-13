ALTER TABLE "super"."estados_super" ADD COLUMN "proceso_codigo" text;--> statement-breakpoint
ALTER TABLE "super"."procesos" ADD COLUMN "nombre_super" varchar(150);--> statement-breakpoint
ALTER TABLE "super"."estados_super" ADD CONSTRAINT "estados_super_proceso_codigo_procesos_codigo_fk" FOREIGN KEY ("proceso_codigo") REFERENCES "super"."procesos"("codigo") ON DELETE restrict ON UPDATE cascade;