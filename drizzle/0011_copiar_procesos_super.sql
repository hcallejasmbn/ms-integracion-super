-- Unificación de procesos: procesos_super se integra en procesos.
-- procesos_super y procesos usaban el mismo código para el mismo proceso, así que se relacionan por codigo.
-- Si un proceso SUPER no tiene un proceso con el mismo código, la migración falla en vez de perder datos:
-- hay que crear ese proceso (o corregir el código) y volver a migrar
DO $$
DECLARE
  huerfanos text;
BEGIN
  SELECT string_agg(ps.codigo, ', ' ORDER BY ps.codigo) INTO huerfanos
  FROM "super"."procesos_super" ps
  LEFT JOIN "super"."procesos" p ON p.codigo = ps.codigo
  WHERE p.codigo IS NULL;

  IF huerfanos IS NOT NULL THEN
    RAISE EXCEPTION 'procesos_super sin proceso con el mismo código: %', huerfanos;
  END IF;
END $$;--> statement-breakpoint
-- El nombre de procesos_super pasa a ser el nombre SUPER del proceso
UPDATE "super"."procesos" p
SET "nombre_super" = ps."nombre"
FROM "super"."procesos_super" ps
WHERE ps."codigo" = p."codigo";--> statement-breakpoint
UPDATE "super"."estados_super" SET "proceso_codigo" = "proceso_super_codigo";
