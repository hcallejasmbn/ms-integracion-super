-- Códigos de STAGE_CODE y STATUS_CODE del manual de integración de SUPER, numerados en el orden del manual.
-- Los códigos que SUPER agregue después los ingresa el usuario
INSERT INTO "super"."stage_codes" ("code", "value") VALUES
	('1', 'ENTRY'),
	('2', 'ADMISSIBILITY'),
	('3', 'IN_PROGRESS'),
	('4', 'FINISHED');
--> statement-breakpoint
INSERT INTO "super"."status_codes" ("code", "value") VALUES
	('1', 'ENTERED'),
	('2', 'UNDER_REVIEW'),
	('3', 'ASSIGNING'),
	('4', 'ADMITTED'),
	('5', 'OBSERVED'),
	('6', 'CORRECTING'),
	('7', 'RE_ENTERED'),
	('8', 'IN_TAKING_NOTE'),
	('9', 'APPROVED'),
	('10', 'REJECTED'),
	('11', 'ABANDONED'),
	('12', 'EXPIRED'),
	('13', 'UNADMITTED'),
	('14', 'CLOSED');
