CREATE SCHEMA IF NOT EXISTS "super";
--> statement-breakpoint
CREATE TABLE "super"."actividades" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "super"."actividades_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nombre" text NOT NULL,
	"proceso_codigo" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "super"."procesos" (
	"codigo" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "super"."actividades" ADD CONSTRAINT "actividades_proceso_codigo_procesos_codigo_fk" FOREIGN KEY ("proceso_codigo") REFERENCES "super"."procesos"("codigo") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "actividades_proceso_codigo_idx" ON "super"."actividades" USING btree ("proceso_codigo");