PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Menu` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`ruta` text NOT NULL,
	`icono` text,
	`orden` integer DEFAULT 0 NOT NULL,
	`padreId` integer,
	`Estado` text DEFAULT 'activo' NOT NULL,
	`recursoId` text NOT NULL,
	FOREIGN KEY (`padreId`) REFERENCES `Menu`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`recursoId`) REFERENCES `Recurso`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_Menu`("id", "nombre", "ruta", "icono", "orden", "padreId", "Estado", "recursoId") SELECT "id", "nombre", "ruta", "icono", "orden", "padreId", "Estado", "recursoId" FROM `Menu`;--> statement-breakpoint
DROP TABLE `Menu`;--> statement-breakpoint
ALTER TABLE `__new_Menu` RENAME TO `Menu`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `Menu_recursoId_unique` ON `Menu` (`recursoId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Menu_ruta_key` ON `Menu` (`ruta`);