CREATE TABLE `yjsDocs` (
	`doc_id` text PRIMARY KEY NOT NULL,
	`table_name` text NOT NULL,
	`state` text NOT NULL,
	`dirty` integer DEFAULT false NOT NULL
);
