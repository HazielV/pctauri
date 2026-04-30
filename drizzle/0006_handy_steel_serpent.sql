PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_PendingSync` (
	`id` text PRIMARY KEY NOT NULL,
	`tabla` text NOT NULL,
	`metodo` text NOT NULL,
	`update_payload` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_PendingSync`("id", "tabla", "metodo", "update_payload", "created_at") SELECT "id", "tabla", "metodo", "update_payload", "created_at" FROM `PendingSync`;--> statement-breakpoint
DROP TABLE `PendingSync`;--> statement-breakpoint
ALTER TABLE `__new_PendingSync` RENAME TO `PendingSync`;--> statement-breakpoint
PRAGMA foreign_keys=ON;