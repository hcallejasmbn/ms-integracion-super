-- Valores de RESPONSIBLE_TYPE; son los que ya usan los estados existentes,
-- así que la FK que agrega 0021 no rechaza ninguna fila
INSERT INTO "super"."type_responsible" ("code", "descripcion") VALUES
	('TITULAR', 'El titular de la solicitud'),
	('ORGANO_SECTORIAL', 'El órgano sectorial que tramita el expediente'),
	('ORGANO_INFORMANTE', 'Un órgano que debe emitir un informe');
