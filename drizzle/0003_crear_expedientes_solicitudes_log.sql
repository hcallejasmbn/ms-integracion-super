CREATE TABLE "super"."actividades_estados_super" (
	"actividad_id" integer PRIMARY KEY NOT NULL,
	"estado_super_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "super"."expedientes_tramitando" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "super"."expedientes_tramitando_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"codigo_expediente" varchar(50) NOT NULL,
	"actividad_id" integer NOT NULL,
	"estado_super_id" integer NOT NULL,
	"fecha_actividad" timestamp with time zone NOT NULL,
	"fecha_insercion" timestamp with time zone DEFAULT now() NOT NULL,
	"estado_notificacion" varchar(20) DEFAULT 'PENDIENTE' NOT NULL,
	"fecha_notificacion" timestamp with time zone,
	"track_id" uuid,
	CONSTRAINT "expedientes_tramitando_cambio_uq" UNIQUE("codigo_expediente","actividad_id","fecha_actividad")
);
--> statement-breakpoint
CREATE TABLE "super"."log_ejecucion" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "super"."log_ejecucion_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"track_id" uuid NOT NULL,
	"operacion" varchar(50) NOT NULL,
	"intento" integer DEFAULT 1 NOT NULL,
	"url" varchar(500) NOT NULL,
	"metodo" varchar(10) NOT NULL,
	"request_json" jsonb,
	"response_status" integer,
	"response_body" text,
	"error" text,
	"resultado" varchar(10) NOT NULL,
	"fecha_inicio" timestamp with time zone DEFAULT now() NOT NULL,
	"duracion_ms" integer
);
--> statement-breakpoint
CREATE TABLE "super"."solicitudes_super" (
	"codigo_expediente" varchar(50) PRIMARY KEY NOT NULL,
	"ms_application_id" integer NOT NULL,
	"fecha_creacion" timestamp with time zone DEFAULT now() NOT NULL,
	"track_id" uuid,
	CONSTRAINT "solicitudes_super_ms_application_id_unique" UNIQUE("ms_application_id")
);
--> statement-breakpoint
ALTER TABLE "super"."actividades_estados_super" ADD CONSTRAINT "actividades_estados_super_actividad_id_actividades_id_fk" FOREIGN KEY ("actividad_id") REFERENCES "super"."actividades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "super"."actividades_estados_super" ADD CONSTRAINT "actividades_estados_super_estado_super_id_estados_super_id_fk" FOREIGN KEY ("estado_super_id") REFERENCES "super"."estados_super"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "super"."expedientes_tramitando" ADD CONSTRAINT "expedientes_tramitando_codigo_expediente_solicitudes_super_codigo_expediente_fk" FOREIGN KEY ("codigo_expediente") REFERENCES "super"."solicitudes_super"("codigo_expediente") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "super"."expedientes_tramitando" ADD CONSTRAINT "expedientes_tramitando_actividad_id_actividades_id_fk" FOREIGN KEY ("actividad_id") REFERENCES "super"."actividades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "super"."expedientes_tramitando" ADD CONSTRAINT "expedientes_tramitando_estado_super_id_estados_super_id_fk" FOREIGN KEY ("estado_super_id") REFERENCES "super"."estados_super"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expedientes_tramitando_ultimo_idx" ON "super"."expedientes_tramitando" USING btree ("codigo_expediente","fecha_actividad" desc);--> statement-breakpoint
CREATE INDEX "expedientes_tramitando_pendientes_idx" ON "super"."expedientes_tramitando" USING btree ("fecha_actividad") WHERE "super"."expedientes_tramitando"."estado_notificacion" in ('PENDIENTE', 'ERROR');--> statement-breakpoint
CREATE INDEX "log_ejecucion_track_id_idx" ON "super"."log_ejecucion" USING btree ("track_id");