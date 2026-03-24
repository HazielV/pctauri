DROP INDEX `Inscripcion_estudiante_curso_uk`;--> statement-breakpoint
ALTER TABLE `Inscripcion` ADD `horarioPlantillaId` integer NOT NULL REFERENCES HorarioPlantilla(id);