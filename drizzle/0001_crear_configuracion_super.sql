CREATE TABLE "super"."estados_super" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "super"."estados_super_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"proceso_super_codigo" varchar(50) NOT NULL,
	"code" varchar(20) NOT NULL,
	"stage_code" varchar(50) NOT NULL,
	"status" varchar(150) NOT NULL,
	"status_code" varchar(50) NOT NULL,
	"subtask" varchar(255) NOT NULL,
	"use_working_days" varchar(50) NOT NULL,
	"responsible_type" varchar(50) NOT NULL,
	"suspension_type" varchar(10),
	CONSTRAINT "estados_super_proceso_code_uq" UNIQUE("proceso_super_codigo","code")
);
--> statement-breakpoint
CREATE TABLE "super"."procesos_super" (
	"codigo" varchar(50) PRIMARY KEY NOT NULL,
	"nombre" varchar(150) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "super"."stage_codes" (
	"code" varchar(50) PRIMARY KEY NOT NULL,
	"value" varchar(50) NOT NULL,
	CONSTRAINT "stage_codes_value_unique" UNIQUE("value")
);
--> statement-breakpoint
CREATE TABLE "super"."status_codes" (
	"code" varchar(50) PRIMARY KEY NOT NULL,
	"value" varchar(50) NOT NULL,
	CONSTRAINT "status_codes_value_unique" UNIQUE("value")
);
--> statement-breakpoint
ALTER TABLE "super"."estados_super" ADD CONSTRAINT "estados_super_proceso_super_codigo_procesos_super_codigo_fk" FOREIGN KEY ("proceso_super_codigo") REFERENCES "super"."procesos_super"("codigo") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "super"."estados_super" ADD CONSTRAINT "estados_super_stage_code_stage_codes_code_fk" FOREIGN KEY ("stage_code") REFERENCES "super"."stage_codes"("code") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "super"."estados_super" ADD CONSTRAINT "estados_super_status_code_status_codes_code_fk" FOREIGN KEY ("status_code") REFERENCES "super"."status_codes"("code") ON DELETE restrict ON UPDATE cascade;