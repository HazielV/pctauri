PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ClasePractica` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`inscripcionId` integer NOT NULL,
	`instructorId` integer,
	`vehiculoId` integer,
	`fechaExacta` text NOT NULL,
	`horaInicio` text NOT NULL,
	`horaFin` text NOT NULL,
	`EstadoClase` text DEFAULT 'PROGRAMADA' NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`inscripcionId`) REFERENCES `Inscripcion`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`instructorId`) REFERENCES `Instructor`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`vehiculoId`) REFERENCES `Vehiculo`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_ClasePractica`("id", "inscripcionId", "instructorId", "vehiculoId", "fechaExacta", "horaInicio", "horaFin", "EstadoClase", "createdAt", "updatedAt", "Estado") SELECT "id", "inscripcionId", "instructorId", "vehiculoId", "fechaExacta", "horaInicio", "horaFin", "EstadoClase", "createdAt", "updatedAt", "Estado" FROM `ClasePractica`;--> statement-breakpoint
DROP TABLE `ClasePractica`;--> statement-breakpoint
ALTER TABLE `__new_ClasePractica` RENAME TO `ClasePractica`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `Inscripcion` ADD `fechaInicio` text DEFAULT '2026-01-01' NOT NULL;--> statement-breakpoint
ALTER TABLE `Inscripcion` ADD `fechaFin` text DEFAULT '2026-12-31' NOT NULL;--> statement-breakpoint
ALTER TABLE `Curso` DROP COLUMN `fechaInicio`;--> statement-breakpoint
ALTER TABLE `Curso` DROP COLUMN `fechaFin`;