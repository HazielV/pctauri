PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Aula` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`capacidad` integer NOT NULL,
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
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_Curso` (
	`id` text PRIMARY KEY NOT NULL,
	`nombreCurso` text NOT NULL,
	`precioBase` real NOT NULL,
	`horasTeoricasReq` integer DEFAULT 0 NOT NULL,
	`horasPracticasReq` integer DEFAULT 0 NOT NULL,
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
CREATE UNIQUE INDEX `Persona_nroDocumento_key` ON `Persona` (`nroDocumento`);