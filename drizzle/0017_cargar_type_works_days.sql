-- Valores de USE_WORKING_DAYS del manual de SUPER; son los que ya usan los estados existentes,
-- así que la FK que agrega 0018 no rechaza ninguna fila
INSERT INTO "super"."type_works_days" ("code", "descripcion") VALUES
	('DÍAS HÁBILES', 'Plazo en días hábiles: lunes a viernes, sin feriados'),
	('DÍAS CORRIDOS', 'Plazo en días corridos: todos los días del calendario');
