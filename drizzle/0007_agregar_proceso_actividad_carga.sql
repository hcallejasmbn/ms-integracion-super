ALTER TABLE "super"."carga_actividades_expedientes" DROP CONSTRAINT "carga_actividades_expedientes_movimiento_uq";--> statement-breakpoint
ALTER TABLE "super"."carga_actividades_expedientes" ADD COLUMN "proceso" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "super"."carga_actividades_expedientes" ADD COLUMN "actividad" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "super"."carga_actividades_expedientes" ADD CONSTRAINT "carga_actividades_expedientes_movimiento_uq" UNIQUE("codigo_expediente","actividad","fecha_actividad");