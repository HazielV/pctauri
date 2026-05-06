PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_menu` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`ruta` text NOT NULL,
	`icono` text,
	`orden` integer DEFAULT 0 NOT NULL,
	`padre_id` text,
	`recurso_id` text,
	`estado_id` text NOT NULL,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`padre_id`) REFERENCES `menu`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`recurso_id`) REFERENCES `recurso`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_menu`("id", "nombre", "ruta", "icono", "orden", "padre_id", "recurso_id", "estado_id") SELECT "id", "nombre", "ruta", "icono", "orden", "padre_id", "recurso_id", "estado_id" FROM `menu`;--> statement-breakpoint
DROP TABLE `menu`;--> statement-breakpoint
ALTER TABLE `__new_menu` RENAME TO `menu`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `menu_ruta_key` ON `menu` (`ruta`);