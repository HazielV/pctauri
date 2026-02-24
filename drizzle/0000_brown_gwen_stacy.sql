CREATE TABLE `AsistenciaGeneral` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
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
CREATE TABLE `Aula` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`capacidad` integer NOT NULL,
	`sucursalId` integer NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`sucursalId`) REFERENCES `Sucursal`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `ClasePractica` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`horarioPlantillaId` integer NOT NULL,
	`vehiculoId` integer NOT NULL,
	`fechaExacta` text NOT NULL,
	`EstadoClase` text DEFAULT 'PROGRAMADA' NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`horarioPlantillaId`) REFERENCES `HorarioPlantilla`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`vehiculoId`) REFERENCES `Vehiculo`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `ClaseTeorica` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`horarioPlantillaId` integer NOT NULL,
	`aulaId` integer NOT NULL,
	`fechaExacta` text NOT NULL,
	`EstadoClase` text DEFAULT 'PROGRAMADA' NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`horarioPlantillaId`) REFERENCES `HorarioPlantilla`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`aulaId`) REFERENCES `Aula`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `Curso` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
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
CREATE TABLE `Estudiante` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`personaId` integer NOT NULL,
	`codigoInterno` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`personaId`) REFERENCES `Persona`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Estudiante_personaId_unique` ON `Estudiante` (`personaId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Estudiante_codigoInterno_unique` ON `Estudiante` (`codigoInterno`);--> statement-breakpoint
CREATE TABLE `Gestion` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`fechaInicio` text NOT NULL,
	`fechaFin` text NOT NULL,
	`EstadoGestion` text DEFAULT 'ACTIVA' NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `HorarioPlantilla` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`diasSemana` text NOT NULL,
	`horaInicio` text NOT NULL,
	`horaFin` text NOT NULL,
	`TipoClase` text NOT NULL,
	`instructorId` integer NOT NULL,
	`cursoId` integer,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`instructorId`) REFERENCES `Instructor`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `Inscripcion` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`estudianteId` integer NOT NULL,
	`cursoId` integer NOT NULL,
	`gestionId` integer NOT NULL,
	`precioPactado` real NOT NULL,
	`fechaInscripcion` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`EstadoInscripcion` text DEFAULT 'ACTIVA' NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`estudianteId`) REFERENCES `Estudiante`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`gestionId`) REFERENCES `Gestion`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `Instructor` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`personaId` integer NOT NULL,
	`nroLicencia` text NOT NULL,
	`disponibilidadActiva` integer DEFAULT true NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`personaId`) REFERENCES `Persona`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Instructor_personaId_unique` ON `Instructor` (`personaId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Instructor_nroLicencia_unique` ON `Instructor` (`nroLicencia`);--> statement-breakpoint
CREATE TABLE `Menu` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
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
CREATE UNIQUE INDEX `Menu_ruta_key` ON `Menu` (`ruta`);--> statement-breakpoint
CREATE TABLE `Pago` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
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
CREATE TABLE `Permiso` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`valor` integer NOT NULL,
	`descripcion` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Permiso_nombre_key` ON `Permiso` (`nombre`);--> statement-breakpoint
CREATE UNIQUE INDEX `Permiso_valor_key` ON `Permiso` (`valor`);--> statement-breakpoint
CREATE TABLE `Persona` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
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
CREATE UNIQUE INDEX `Persona_email_key` ON `Persona` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `Persona_nroDocumento_key` ON `Persona` (`nroDocumento`);--> statement-breakpoint
CREATE TABLE `Recurso` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`ruta` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Recurso_ruta_key` ON `Recurso` (`ruta`);--> statement-breakpoint
CREATE TABLE `Rol` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`Estado` text DEFAULT 'activo' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Rol_nombre_key` ON `Rol` (`nombre`);--> statement-breakpoint
CREATE TABLE `RolesMenus` (
	`rolId` integer NOT NULL,
	`menuId` integer NOT NULL,
	`permisos` integer DEFAULT 1 NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	PRIMARY KEY(`rolId`, `menuId`),
	FOREIGN KEY (`rolId`) REFERENCES `Rol`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`menuId`) REFERENCES `Menu`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `RolesRecursos` (
	`rolId` integer NOT NULL,
	`recursoId` integer NOT NULL,
	`permisos` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`rolId`, `recursoId`),
	FOREIGN KEY (`rolId`) REFERENCES `Rol`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`recursoId`) REFERENCES `Recurso`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Sucursal` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`direccion` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Usuario` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`personaId` integer NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`personaId`) REFERENCES `Persona`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Usuario_personaId_key` ON `Usuario` (`personaId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Usuario_username_key` ON `Usuario` (`username`);--> statement-breakpoint
CREATE TABLE `UsuariosRoles` (
	`usuarioId` integer NOT NULL,
	`rolId` integer NOT NULL,
	`asignadoEl` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	PRIMARY KEY(`usuarioId`, `rolId`),
	FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`rolId`) REFERENCES `Rol`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Vehiculo` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`placa` text NOT NULL,
	`marca` text NOT NULL,
	`EstadoOperativo` text DEFAULT 'DISPONIBLE' NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Vehiculo_placa_unique` ON `Vehiculo` (`placa`);