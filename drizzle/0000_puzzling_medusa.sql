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
CREATE TABLE `Permiso` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`valor` integer NOT NULL,
	`descripcion` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text NOT NULL,
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
	`updatedAt` text NOT NULL,
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
	`updatedAt` text NOT NULL,
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
CREATE TABLE `Usuario` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text NOT NULL,
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
