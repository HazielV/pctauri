PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_UsuariosRoles` (
	`usuarioId` text NOT NULL,
	`rolId` text NOT NULL,
	`asignadoEl` text DEFAULT (CURRENT_TIMESTAMP),
	`Estado` text DEFAULT 'activo' NOT NULL,
	PRIMARY KEY(`usuarioId`, `rolId`),
	FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`rolId`) REFERENCES `Rol`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_UsuariosRoles`("usuarioId", "rolId", "asignadoEl", "Estado") SELECT "usuarioId", "rolId", "asignadoEl", "Estado" FROM `UsuariosRoles`;--> statement-breakpoint
DROP TABLE `UsuariosRoles`;--> statement-breakpoint
ALTER TABLE `__new_UsuariosRoles` RENAME TO `UsuariosRoles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;