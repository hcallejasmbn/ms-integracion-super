-- Status de SUPER que no están en el catálogo status_codes cargado por 0002 (que llega hasta el 14).
-- Los usan los estados SUPER del proceso 9 (Concesion OLP)
INSERT INTO "super"."status_codes" ("code", "value") VALUES
	('15', 'SENDED'),
	('16', 'RECEIVED'),
	('17', 'FINISHED');
