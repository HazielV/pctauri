PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_AsistenciaGeneral` (
	`id` text PRIMARY KEY NOT NULL,
	`inscripcionId` text NOT NULL,
	`claseTeoricaId` integer,
	`clasePracticaId` integer,
	`EstadoAsistencia` text DEFAULT 'PROGRAMADA' NOT NULL,
	`esReprogramado` integer DEFAULT false NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`inscripcionId`) REFERENCES `Inscripcion`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`claseTeoricaId`) REFERENCES `ClaseTeorica`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`clasePracticaId`) REFERENCES `ClasePractica`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_AsistenciaGeneral`("id", "inscripcionId", "claseTeoricaId", "clasePracticaId", "EstadoAsistencia", "esReprogramado", "createdAt", "updatedAt") SELECT "id", "inscripcionId", "claseTeoricaId", "clasePracticaId", "EstadoAsistencia", "esReprogramado", "createdAt", "updatedAt" FROM `AsistenciaGeneral`;--> statement-breakpoint
DROP TABLE `AsistenciaGeneral`;--> statement-breakpoint
ALTER TABLE `__new_AsistenciaGeneral` RENAME TO `AsistenciaGeneral`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_Aula` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`capacidad` text NOT NULL,
	`sucursalId` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`sucursalId`) REFERENCES `Sucursal`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_Aula`("id", "nombre", "capacidad", "sucursalId", "createdAt", "updatedAt", "Estado") SELECT "id", "nombre", "capacidad", "sucursalId", "createdAt", "updatedAt", "Estado" FROM `Aula`;--> statement-breakpoint
DROP TABLE `Aula`;--> statement-breakpoint
ALTER TABLE `__new_Aula` RENAME TO `Aula`;--> statement-breakpoint
CREATE TABLE `__new_AvanceClase` (
	`id` text PRIMARY KEY NOT NULL,
	`temaId` text NOT NULL,
	`claseTeoricaId` integer,
	`clasePracticaId` integer,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`temaId`) REFERENCES `Tema`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`claseTeoricaId`) REFERENCES `ClaseTeorica`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`clasePracticaId`) REFERENCES `ClasePractica`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_AvanceClase`("id", "temaId", "claseTeoricaId", "clasePracticaId", "createdAt") SELECT "id", "temaId", "claseTeoricaId", "clasePracticaId", "createdAt" FROM `AvanceClase`;--> statement-breakpoint
DROP TABLE `AvanceClase`;--> statement-breakpoint
ALTER TABLE `__new_AvanceClase` RENAME TO `AvanceClase`;--> statement-breakpoint
CREATE TABLE `__new_ClasePractica` (
	`id` text PRIMARY KEY NOT NULL,
	`inscripcionId` text NOT NULL,
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
CREATE TABLE `__new_ClaseTeorica` (
	`id` text PRIMARY KEY NOT NULL,
	`horarioPlantillaId` integer,
	`aulaId` text NOT NULL,
	`cursoId` text NOT NULL,
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
CREATE TABLE `__new_Curso` (
	`id` text PRIMARY KEY NOT NULL,
	`nombreCurso` text NOT NULL,
	`precioBase` real NOT NULL,
	`horasTeoricasReq` text NOT NULL,
	`horasPracticasReq` text NOT NULL,
	`gestionId` text NOT NULL,
	`sucursalId` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`gestionId`) REFERENCES `Gestion`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`sucursalId`) REFERENCES `Sucursal`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_Curso`("id", "nombreCurso", "precioBase", "horasTeoricasReq", "horasPracticasReq", "gestionId", "sucursalId", "createdAt", "updatedAt", "Estado") SELECT "id", "nombreCurso", "precioBase", "horasTeoricasReq", "horasPracticasReq", "gestionId", "sucursalId", "createdAt", "updatedAt", "Estado" FROM `Curso`;--> statement-breakpoint
DROP TABLE `Curso`;--> statement-breakpoint
ALTER TABLE `__new_Curso` RENAME TO `Curso`;--> statement-breakpoint
CREATE TABLE `__new_EvaluacionEstudiante` (
	`id` text PRIMARY KEY NOT NULL,
	`examenProgramadoId` text NOT NULL,
	`inscripcionId` text NOT NULL,
	`nota` real,
	`observaciones` text,
	`EstadoAsistencia` text DEFAULT 'PRESENTE' NOT NULL,
	`fechaCalificacion` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`examenProgramadoId`) REFERENCES `ExamenProgramado`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inscripcionId`) REFERENCES `Inscripcion`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_EvaluacionEstudiante`("id", "examenProgramadoId", "inscripcionId", "nota", "observaciones", "EstadoAsistencia", "fechaCalificacion") SELECT "id", "examenProgramadoId", "inscripcionId", "nota", "observaciones", "EstadoAsistencia", "fechaCalificacion" FROM `EvaluacionEstudiante`;--> statement-breakpoint
DROP TABLE `EvaluacionEstudiante`;--> statement-breakpoint
ALTER TABLE `__new_EvaluacionEstudiante` RENAME TO `EvaluacionEstudiante`;--> statement-breakpoint
CREATE UNIQUE INDEX `Evaluacion_Unica_key` ON `EvaluacionEstudiante` (`examenProgramadoId`,`inscripcionId`);--> statement-breakpoint
CREATE TABLE `__new_ExamenProgramado` (
	`id` text PRIMARY KEY NOT NULL,
	`cursoId` text NOT NULL,
	`titulo` text NOT NULL,
	`TipoExamen` text NOT NULL,
	`fechaExacta` text NOT NULL,
	`Estado` text DEFAULT 'PROGRAMADO' NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_ExamenProgramado`("id", "cursoId", "titulo", "TipoExamen", "fechaExacta", "Estado", "createdAt") SELECT "id", "cursoId", "titulo", "TipoExamen", "fechaExacta", "Estado", "createdAt" FROM `ExamenProgramado`;--> statement-breakpoint
DROP TABLE `ExamenProgramado`;--> statement-breakpoint
ALTER TABLE `__new_ExamenProgramado` RENAME TO `ExamenProgramado`;--> statement-breakpoint
CREATE TABLE `__new_HorarioPlantilla` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`diaSemana` text NOT NULL,
	`horaInicio` text NOT NULL,
	`horaFin` text NOT NULL,
	`TipoClase` text NOT NULL,
	`instructorId` integer,
	`aulaId` integer,
	`cursoId` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`instructorId`) REFERENCES `Instructor`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`aulaId`) REFERENCES `Aula`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_HorarioPlantilla`("id", "nombre", "diaSemana", "horaInicio", "horaFin", "TipoClase", "instructorId", "aulaId", "cursoId", "createdAt", "updatedAt", "Estado") SELECT "id", "nombre", "diaSemana", "horaInicio", "horaFin", "TipoClase", "instructorId", "aulaId", "cursoId", "createdAt", "updatedAt", "Estado" FROM `HorarioPlantilla`;--> statement-breakpoint
DROP TABLE `HorarioPlantilla`;--> statement-breakpoint
ALTER TABLE `__new_HorarioPlantilla` RENAME TO `HorarioPlantilla`;--> statement-breakpoint
CREATE TABLE `__new_Inscripcion` (
	`id` text PRIMARY KEY NOT NULL,
	`estudianteId` text NOT NULL,
	`cursoId` text NOT NULL,
	`gestionId` text NOT NULL,
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
CREATE TABLE `__new_Pago` (
	`id` text PRIMARY KEY NOT NULL,
	`inscripcionId` text NOT NULL,
	`montoPagado` real NOT NULL,
	`fechaPago` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`MetodoPago` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`inscripcionId`) REFERENCES `Inscripcion`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_Pago`("id", "inscripcionId", "montoPagado", "fechaPago", "MetodoPago", "createdAt", "updatedAt", "Estado") SELECT "id", "inscripcionId", "montoPagado", "fechaPago", "MetodoPago", "createdAt", "updatedAt", "Estado" FROM `Pago`;--> statement-breakpoint
DROP TABLE `Pago`;--> statement-breakpoint
ALTER TABLE `__new_Pago` RENAME TO `Pago`;--> statement-breakpoint
CREATE TABLE `__new_Permiso` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`valor` text NOT NULL,
	`descripcion` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_Permiso`("id", "nombre", "valor", "descripcion", "createdAt", "updatedAt", "Estado") SELECT "id", "nombre", "valor", "descripcion", "createdAt", "updatedAt", "Estado" FROM `Permiso`;--> statement-breakpoint
DROP TABLE `Permiso`;--> statement-breakpoint
ALTER TABLE `__new_Permiso` RENAME TO `Permiso`;--> statement-breakpoint
CREATE UNIQUE INDEX `Permiso_nombre_key` ON `Permiso` (`nombre`);--> statement-breakpoint
CREATE UNIQUE INDEX `Permiso_valor_key` ON `Permiso` (`valor`);--> statement-breakpoint
CREATE TABLE `__new_Persona` (
	`id` text PRIMARY KEY NOT NULL,
	`nombres` text NOT NULL,
	`primerApellido` text NOT NULL,
	`segundoApellido` text,
	`nroDocumento` text NOT NULL,
	`nroCelular` text NOT NULL,
	`email` text NOT NULL,
	`sexo` text NOT NULL,
	`fechaNacimiento` text NOT NULL,
	`direccion` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`TipoDocumento` text NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_Persona`("id", "nombres", "primerApellido", "segundoApellido", "nroDocumento", "nroCelular", "email", "sexo", "fechaNacimiento", "direccion", "createdAt", "updatedAt", "TipoDocumento", "Estado") SELECT "id", "nombres", "primerApellido", "segundoApellido", "nroDocumento", "nroCelular", "email", "sexo", "fechaNacimiento", "direccion", "createdAt", "updatedAt", "TipoDocumento", "Estado" FROM `Persona`;--> statement-breakpoint
DROP TABLE `Persona`;--> statement-breakpoint
ALTER TABLE `__new_Persona` RENAME TO `Persona`;--> statement-breakpoint
CREATE UNIQUE INDEX `Persona_email_key` ON `Persona` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `Persona_nroDocumento_key` ON `Persona` (`nroDocumento`);--> statement-breakpoint
CREATE TABLE `__new_RolesMenus` (
	`rolId` text NOT NULL,
	`menuId` text NOT NULL,
	`permisos` integer DEFAULT 1 NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	PRIMARY KEY(`rolId`, `menuId`),
	FOREIGN KEY (`rolId`) REFERENCES `Rol`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`menuId`) REFERENCES `Menu`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_RolesMenus`("rolId", "menuId", "permisos", "Estado") SELECT "rolId", "menuId", "permisos", "Estado" FROM `RolesMenus`;--> statement-breakpoint
DROP TABLE `RolesMenus`;--> statement-breakpoint
ALTER TABLE `__new_RolesMenus` RENAME TO `RolesMenus`;--> statement-breakpoint
CREATE TABLE `__new_RolesRecursos` (
	`rolId` text NOT NULL,
	`recursoId` text NOT NULL,
	`permisos` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`rolId`, `recursoId`),
	FOREIGN KEY (`rolId`) REFERENCES `Rol`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`recursoId`) REFERENCES `Recurso`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_RolesRecursos`("rolId", "recursoId", "permisos") SELECT "rolId", "recursoId", "permisos" FROM `RolesRecursos`;--> statement-breakpoint
DROP TABLE `RolesRecursos`;--> statement-breakpoint
ALTER TABLE `__new_RolesRecursos` RENAME TO `RolesRecursos`;--> statement-breakpoint
CREATE TABLE `__new_Tema` (
	`id` text PRIMARY KEY NOT NULL,
	`cursoId` text NOT NULL,
	`titulo` text NOT NULL,
	`TipoTema` text NOT NULL,
	`orden` integer DEFAULT 0,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_Tema`("id", "cursoId", "titulo", "TipoTema", "orden", "Estado") SELECT "id", "cursoId", "titulo", "TipoTema", "orden", "Estado" FROM `Tema`;--> statement-breakpoint
DROP TABLE `Tema`;--> statement-breakpoint
ALTER TABLE `__new_Tema` RENAME TO `Tema`;--> statement-breakpoint
CREATE TABLE `__new_Usuario` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`personaId` text NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`personaId`) REFERENCES `Persona`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_Usuario`("id", "username", "password", "createdAt", "updatedAt", "personaId", "Estado") SELECT "id", "username", "password", "createdAt", "updatedAt", "personaId", "Estado" FROM `Usuario`;--> statement-breakpoint
DROP TABLE `Usuario`;--> statement-breakpoint
ALTER TABLE `__new_Usuario` RENAME TO `Usuario`;--> statement-breakpoint
CREATE UNIQUE INDEX `Usuario_personaId_key` ON `Usuario` (`personaId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Usuario_username_key` ON `Usuario` (`username`);--> statement-breakpoint
CREATE TABLE `__new_UsuariosRoles` (
	`usuarioId` text NOT NULL,
	`rolId` text NOT NULL,
	`asignadoEl` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	PRIMARY KEY(`usuarioId`, `rolId`),
	FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`rolId`) REFERENCES `Rol`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_UsuariosRoles`("usuarioId", "rolId", "asignadoEl", "Estado") SELECT "usuarioId", "rolId", "asignadoEl", "Estado" FROM `UsuariosRoles`;--> statement-breakpoint
DROP TABLE `UsuariosRoles`;--> statement-breakpoint
ALTER TABLE `__new_UsuariosRoles` RENAME TO `UsuariosRoles`;