CREATE TABLE `AvanceClase` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`temaId` integer NOT NULL,
	`claseTeoricaId` integer,
	`clasePracticaId` integer,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`temaId`) REFERENCES `Tema`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`claseTeoricaId`) REFERENCES `ClaseTeorica`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`clasePracticaId`) REFERENCES `ClasePractica`(`id`) ON UPDATE no action ON DELETE cascade
);
