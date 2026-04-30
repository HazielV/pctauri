PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_RolesMenus` (
	`id` text PRIMARY KEY NOT NULL,
	`rolId` text NOT NULL,
	`menuId` text NOT NULL,
	`permisos` integer DEFAULT 1 NOT NULL,
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`rolId`) REFERENCES `Rol`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`menuId`) REFERENCES `Menu`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_RolesMenus`("id", "rolId", "menuId", "permisos", "Estado") SELECT "id", "rolId", "menuId", "permisos", "Estado" FROM `RolesMenus`;--> statement-breakpoint
DROP TABLE `RolesMenus`;--> statement-breakpoint
ALTER TABLE `__new_RolesMenus` RENAME TO `RolesMenus`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `RolesMenus_key` ON `RolesMenus` (`rolId`,`menuId`);--> statement-breakpoint
CREATE TABLE `__new_RolesRecursos` (
	`id` text PRIMARY KEY NOT NULL,
	`rolId` text NOT NULL,
	`recursoId` text NOT NULL,
	`permisos` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`rolId`) REFERENCES `Rol`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`recursoId`) REFERENCES `Recurso`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_RolesRecursos`("id", "rolId", "recursoId", "permisos") SELECT "id", "rolId", "recursoId", "permisos" FROM `RolesRecursos`;--> statement-breakpoint
DROP TABLE `RolesRecursos`;--> statement-breakpoint
ALTER TABLE `__new_RolesRecursos` RENAME TO `RolesRecursos`;--> statement-breakpoint
CREATE UNIQUE INDEX `RolesRecursos_key` ON `RolesRecursos` (`recursoId`,`rolId`);--> statement-breakpoint
CREATE TABLE `__new_UsuariosRoles` (
	`id` text PRIMARY KEY NOT NULL,
	`usuarioId` text NOT NULL,
	`rolId` text NOT NULL,
	`asignadoEl` text DEFAULT (CURRENT_TIMESTAMP),
	`Estado` text DEFAULT 'activo' NOT NULL,
	FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`rolId`) REFERENCES `Rol`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_UsuariosRoles`("id", "usuarioId", "rolId", "asignadoEl", "Estado") SELECT "id", "usuarioId", "rolId", "asignadoEl", "Estado" FROM `UsuariosRoles`;--> statement-breakpoint
DROP TABLE `UsuariosRoles`;--> statement-breakpoint
ALTER TABLE `__new_UsuariosRoles` RENAME TO `UsuariosRoles`;--> statement-breakpoint
CREATE UNIQUE INDEX `UsuariosRoles_usuarioId_rolId_key` ON `UsuariosRoles` (`usuarioId`,`rolId`);