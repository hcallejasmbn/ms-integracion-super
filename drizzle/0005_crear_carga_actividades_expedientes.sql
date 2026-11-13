CREATE TABLE "super"."carga_actividades_expedientes" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "super"."carga_actividades_expedientes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"codigo_expediente" varchar(50) NOT NULL,
	"actividad_id" integer NOT NULL,
	"fecha_actividad" timestamp with time zone NOT NULL,
	"responsable" varchar(255),
	"comentario" text,
	"fecha_carga" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "carga_actividades_expedientes_movimiento_uq" UNIQUE("codigo_expediente","actividad_id","fecha_actividad")
);
--> statement-breakpoint
CREATE INDEX "carga_actividades_expedientes_fecha_carga_idx" ON "super"."carga_actividades_expedientes" USING btree ("fecha_carga");