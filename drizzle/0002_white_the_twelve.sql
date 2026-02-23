PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Permiso` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
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
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `Permiso_nombre_key` ON `Permiso` (`nombre`);--> statement-breakpoint
CREATE UNIQUE INDEX `Permiso_valor_key` ON `Permiso` (`valor`);--> statement-breakpoint
CREATE TABLE `__new_Persona` (
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
INSERT INTO `__new_Persona`("id", "nombres", "primerApellido", "segundoApellido", "nroDocumento", "nroCelular", "email", "sexo", "fechaNacimiento", "direccion", "createdAt", "updatedAt", "TipoDocumento", "Estado") SELECT "id", "nombres", "primerApellido", "segundoApellido", "nroDocumento", "nroCelular", "email", "sexo", "fechaNacimiento", "direccion", "createdAt", "updatedAt", "TipoDocumento", "Estado" FROM `Persona`;--> statement-breakpoint
DROP TABLE `Persona`;--> statement-breakpoint
ALTER TABLE `__new_Persona` RENAME TO `Persona`;--> statement-breakpoint
CREATE UNIQUE INDEX `Persona_email_key` ON `Persona` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `Persona_nroDocumento_key` ON `Persona` (`nroDocumento`);--> statement-breakpoint
CREATE TABLE `__new_Recurso` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
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
CREATE TABLE `__new_Usuario` (
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
INSERT INTO `__new_Usuario`("id", "username", "password", "createdAt", "updatedAt", "personaId", "Estado") SELECT "id", "username", "password", "createdAt", "updatedAt", "personaId", "Estado" FROM `Usuario`;--> statement-breakpoint
DROP TABLE `Usuario`;--> statement-breakpoint
ALTER TABLE `__new_Usuario` RENAME TO `Usuario`;--> statement-breakpoint
CREATE UNIQUE INDEX `Usuario_personaId_key` ON `Usuario` (`personaId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Usuario_username_key` ON `Usuario` (`username`);