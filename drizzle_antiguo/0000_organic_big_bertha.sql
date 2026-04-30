CREATE TABLE `HorarioPlantilla` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`diaSemana` text NOT NULL,
	`horaInicio` text NOT NULL,
	`horaFin` text NOT NULL,
	`TipoClase` text NOT NULL,
	`instructorId` integer,
	`aulaId` integer,
	`cursoId` integer NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`instructorId`) REFERENCES `Instructor`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`aulaId`) REFERENCES `Aula`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON UPDATE cascade ON DELETE cascade
);
