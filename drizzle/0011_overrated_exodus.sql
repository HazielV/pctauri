CREATE TABLE `EvaluacionEstudiante` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`examenProgramadoId` integer NOT NULL,
	`inscripcionId` integer NOT NULL,
	`nota` real,
	`observaciones` text,
	`EstadoAsistencia` text DEFAULT 'PRESENTE' NOT NULL,
	`fechaCalificacion` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`examenProgramadoId`) REFERENCES `ExamenProgramado`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inscripcionId`) REFERENCES `Inscripcion`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Evaluacion_Unica_key` ON `EvaluacionEstudiante` (`examenProgramadoId`,`inscripcionId`);--> statement-breakpoint
CREATE TABLE `ExamenProgramado` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cursoId` integer NOT NULL,
	`titulo` text NOT NULL,
	`TipoExamen` text NOT NULL,
	`fechaExacta` text NOT NULL,
	`Estado` text DEFAULT 'PROGRAMADO' NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Tema` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cursoId` integer NOT NULL,
	`titulo` text NOT NULL,
	`TipoTema` text NOT NULL,
	`orden` integer DEFAULT 0,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON UPDATE no action ON DELETE cascade
);
