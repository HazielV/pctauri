PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ClaseTeorica` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`horarioPlantillaId` integer,
	`aulaId` integer NOT NULL,
	`cursoId` integer NOT NULL,
	`fechaExacta` text NOT NULL,
	`horaInicio` text NOT NULL,
	`horaFin` text NOT NULL,
	`EstadoClase` text DEFAULT 'PROGRAMADA' NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`horarioPlantillaId`) REFERENCES `HorarioPlantilla`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`aulaId`) REFERENCES `Aula`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_ClaseTeorica`("id", "horarioPlantillaId", "aulaId", "cursoId", "fechaExacta", "horaInicio", "horaFin", "EstadoClase", "createdAt", "updatedAt", "Estado") SELECT "id", "horarioPlantillaId", "aulaId", "cursoId", "fechaExacta", "horaInicio", "horaFin", "EstadoClase", "createdAt", "updatedAt", "Estado" FROM `ClaseTeorica`;--> statement-breakpoint
DROP TABLE `ClaseTeorica`;--> statement-breakpoint
ALTER TABLE `__new_ClaseTeorica` RENAME TO `ClaseTeorica`;--> statement-breakpoint
PRAGMA foreign_keys=ON;