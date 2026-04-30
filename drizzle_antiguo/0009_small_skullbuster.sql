PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Inscripcion` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`estudianteId` integer NOT NULL,
	`cursoId` integer NOT NULL,
	`gestionId` integer NOT NULL,
	`precioPactado` real NOT NULL,
	`fechaInicio` text DEFAULT '2026-01-01' NOT NULL,
	`fechaFin` text DEFAULT '2026-12-31' NOT NULL,
	`horarioPlantillaId` integer NOT NULL,
	`fechaInscripcion` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`EstadoInscripcion` text DEFAULT 'pendiente' NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`estudianteId`) REFERENCES `Estudiante`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`gestionId`) REFERENCES `Gestion`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`horarioPlantillaId`) REFERENCES `HorarioPlantilla`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_Inscripcion`("id", "estudianteId", "cursoId", "gestionId", "precioPactado", "fechaInicio", "fechaFin", "horarioPlantillaId", "fechaInscripcion", "EstadoInscripcion", "createdAt", "updatedAt", "Estado") SELECT "id", "estudianteId", "cursoId", "gestionId", "precioPactado", "fechaInicio", "fechaFin", "horarioPlantillaId", "fechaInscripcion", "EstadoInscripcion", "createdAt", "updatedAt", "Estado" FROM `Inscripcion`;--> statement-breakpoint
DROP TABLE `Inscripcion`;--> statement-breakpoint
ALTER TABLE `__new_Inscripcion` RENAME TO `Inscripcion`;--> statement-breakpoint
PRAGMA foreign_keys=ON;