CREATE TABLE `PendingSync` (
	`id` text PRIMARY KEY NOT NULL,
	`tabla` text NOT NULL,
	`metodo` text NOT NULL,
	`update_payload` blob NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_AsistenciaGeneral` (
	`id` text PRIMARY KEY NOT NULL,
	`inscripcionId` integer NOT NULL,
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
	`capacidad` integer NOT NULL,
	`sucursalId` integer NOT NULL,
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
	`temaId` integer NOT NULL,
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
CREATE TABLE `__new_ClaseTeorica` (
	`id` text PRIMARY KEY NOT NULL,
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
CREATE TABLE `__new_Curso` (
	`id` text PRIMARY KEY NOT NULL,
	`nombreCurso` text NOT NULL,
	`precioBase` real NOT NULL,
	`horasTeoricasReq` integer DEFAULT 0 NOT NULL,
	`horasPracticasReq` integer DEFAULT 0 NOT NULL,
	`gestionId` integer NOT NULL,
	`sucursalId` integer NOT NULL,
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
CREATE TABLE `__new_Estudiante` (
	`id` text PRIMARY KEY NOT NULL,
	`personaId` integer NOT NULL,
	`codigoInterno` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`personaId`) REFERENCES `Persona`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_Estudiante`("id", "personaId", "codigoInterno", "createdAt", "updatedAt", "Estado") SELECT "id", "personaId", "codigoInterno", "createdAt", "updatedAt", "Estado" FROM `Estudiante`;--> statement-breakpoint
DROP TABLE `Estudiante`;--> statement-breakpoint
ALTER TABLE `__new_Estudiante` RENAME TO `Estudiante`;--> statement-breakpoint
CREATE UNIQUE INDEX `Estudiante_personaId_unique` ON `Estudiante` (`personaId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Estudiante_codigoInterno_unique` ON `Estudiante` (`codigoInterno`);--> statement-breakpoint
CREATE TABLE `__new_EvaluacionEstudiante` (
	`id` text PRIMARY KEY NOT NULL,
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
INSERT INTO `__new_EvaluacionEstudiante`("id", "examenProgramadoId", "inscripcionId", "nota", "observaciones", "EstadoAsistencia", "fechaCalificacion") SELECT "id", "examenProgramadoId", "inscripcionId", "nota", "observaciones", "EstadoAsistencia", "fechaCalificacion" FROM `EvaluacionEstudiante`;--> statement-breakpoint
DROP TABLE `EvaluacionEstudiante`;--> statement-breakpoint
ALTER TABLE `__new_EvaluacionEstudiante` RENAME TO `EvaluacionEstudiante`;--> statement-breakpoint
CREATE UNIQUE INDEX `Evaluacion_Unica_key` ON `EvaluacionEstudiante` (`examenProgramadoId`,`inscripcionId`);--> statement-breakpoint
CREATE TABLE `__new_ExamenProgramado` (
	`id` text PRIMARY KEY NOT NULL,
	`cursoId` integer NOT NULL,
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
CREATE TABLE `__new_Gestion` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`fechaInicio` text NOT NULL,
	`fechaFin` text NOT NULL,
	`EstadoGestion` text DEFAULT 'ACTIVA' NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_Gestion`("id", "nombre", "fechaInicio", "fechaFin", "EstadoGestion", "createdAt", "updatedAt", "Estado") SELECT "id", "nombre", "fechaInicio", "fechaFin", "EstadoGestion", "createdAt", "updatedAt", "Estado" FROM `Gestion`;--> statement-breakpoint
DROP TABLE `Gestion`;--> statement-breakpoint
ALTER TABLE `__new_Gestion` RENAME TO `Gestion`;--> statement-breakpoint
CREATE TABLE `__new_HorarioPlantilla` (
	`id` text PRIMARY KEY NOT NULL,
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
--> statement-breakpoint
INSERT INTO `__new_HorarioPlantilla`("id", "nombre", "diaSemana", "horaInicio", "horaFin", "TipoClase", "instructorId", "aulaId", "cursoId", "createdAt", "updatedAt", "Estado") SELECT "id", "nombre", "diaSemana", "horaInicio", "horaFin", "TipoClase", "instructorId", "aulaId", "cursoId", "createdAt", "updatedAt", "Estado" FROM `HorarioPlantilla`;--> statement-breakpoint
DROP TABLE `HorarioPlantilla`;--> statement-breakpoint
ALTER TABLE `__new_HorarioPlantilla` RENAME TO `HorarioPlantilla`;--> statement-breakpoint
CREATE TABLE `__new_Inscripcion` (
	`id` text PRIMARY KEY NOT NULL,
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
CREATE TABLE `__new_Instructor` (
	`id` text PRIMARY KEY NOT NULL,
	`personaId` integer NOT NULL,
	`nroLicencia` text NOT NULL,
	`disponibilidadActiva` integer DEFAULT true NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`personaId`) REFERENCES `Persona`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_Instructor`("id", "personaId", "nroLicencia", "disponibilidadActiva", "createdAt", "updatedAt", "Estado") SELECT "id", "personaId", "nroLicencia", "disponibilidadActiva", "createdAt", "updatedAt", "Estado" FROM `Instructor`;--> statement-breakpoint
DROP TABLE `Instructor`;--> statement-breakpoint
ALTER TABLE `__new_Instructor` RENAME TO `Instructor`;--> statement-breakpoint
CREATE UNIQUE INDEX `Instructor_personaId_unique` ON `Instructor` (`personaId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Instructor_nroLicencia_unique` ON `Instructor` (`nroLicencia`);--> statement-breakpoint
CREATE TABLE `__new_Menu` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`ruta` text NOT NULL,
	`icono` text,
	`orden` integer DEFAULT 0 NOT NULL,
	`padreId` integer,
	`Estado` text DEFAULT 'activo' NOT NULL,
	`recursoId` integer,
	FOREIGN KEY (`padreId`) REFERENCES `Menu`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`recursoId`) REFERENCES `Recurso`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_Menu`("id", "nombre", "ruta", "icono", "orden", "padreId", "Estado", "recursoId") SELECT "id", "nombre", "ruta", "icono", "orden", "padreId", "Estado", "recursoId" FROM `Menu`;--> statement-breakpoint
DROP TABLE `Menu`;--> statement-breakpoint
ALTER TABLE `__new_Menu` RENAME TO `Menu`;--> statement-breakpoint
CREATE UNIQUE INDEX `Menu_recursoId_unique` ON `Menu` (`recursoId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Menu_ruta_key` ON `Menu` (`ruta`);--> statement-breakpoint
CREATE TABLE `__new_Pago` (
	`id` text PRIMARY KEY NOT NULL,
	`inscripcionId` integer NOT NULL,
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
	`valor` integer NOT NULL,
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
	`nroDocumento` integer NOT NULL,
	`nroCelular` integer NOT NULL,
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
CREATE TABLE `__new_Recurso` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`ruta` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_Recurso`("id", "nombre", "ruta", "createdAt", "updatedAt", "Estado") SELECT "id", "nombre", "ruta", "createdAt", "updatedAt", "Estado" FROM `Recurso`;--> statement-breakpoint
DROP TABLE `Recurso`;--> statement-breakpoint
ALTER TABLE `__new_Recurso` RENAME TO `Recurso`;--> statement-breakpoint
CREATE UNIQUE INDEX `Recurso_ruta_key` ON `Recurso` (`ruta`);--> statement-breakpoint
CREATE TABLE `__new_Rol` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`Estado` text DEFAULT 'activo' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_Rol`("id", "nombre", "descripcion", "Estado") SELECT "id", "nombre", "descripcion", "Estado" FROM `Rol`;--> statement-breakpoint
DROP TABLE `Rol`;--> statement-breakpoint
ALTER TABLE `__new_Rol` RENAME TO `Rol`;--> statement-breakpoint
CREATE UNIQUE INDEX `Rol_nombre_key` ON `Rol` (`nombre`);--> statement-breakpoint
CREATE TABLE `__new_Sucursal` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`direccion` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_Sucursal`("id", "nombre", "direccion", "createdAt", "updatedAt", "Estado") SELECT "id", "nombre", "direccion", "createdAt", "updatedAt", "Estado" FROM `Sucursal`;--> statement-breakpoint
DROP TABLE `Sucursal`;--> statement-breakpoint
ALTER TABLE `__new_Sucursal` RENAME TO `Sucursal`;--> statement-breakpoint
CREATE TABLE `__new_Tema` (
	`id` text PRIMARY KEY NOT NULL,
	`cursoId` integer NOT NULL,
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
	`personaId` integer NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`personaId`) REFERENCES `Persona`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_Usuario`("id", "username", "password", "createdAt", "updatedAt", "personaId", "Estado") SELECT "id", "username", "password", "createdAt", "updatedAt", "personaId", "Estado" FROM `Usuario`;--> statement-breakpoint
DROP TABLE `Usuario`;--> statement-breakpoint
ALTER TABLE `__new_Usuario` RENAME TO `Usuario`;--> statement-breakpoint
CREATE UNIQUE INDEX `Usuario_personaId_key` ON `Usuario` (`personaId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Usuario_username_key` ON `Usuario` (`username`);--> statement-breakpoint
CREATE TABLE `__new_Vehiculo` (
	`id` text PRIMARY KEY NOT NULL,
	`placa` text NOT NULL,
	`marca` text NOT NULL,
	`EstadoOperativo` text DEFAULT 'DISPONIBLE' NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_Vehiculo`("id", "placa", "marca", "EstadoOperativo", "createdAt", "updatedAt", "Estado") SELECT "id", "placa", "marca", "EstadoOperativo", "createdAt", "updatedAt", "Estado" FROM `Vehiculo`;--> statement-breakpoint
DROP TABLE `Vehiculo`;--> statement-breakpoint
ALTER TABLE `__new_Vehiculo` RENAME TO `Vehiculo`;--> statement-breakpoint
CREATE UNIQUE INDEX `Vehiculo_placa_unique` ON `Vehiculo` (`placa`);