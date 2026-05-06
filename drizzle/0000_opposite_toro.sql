CREATE TABLE `asistencia_general` (
	`id` text PRIMARY KEY NOT NULL,
	`inscripcion_id` text NOT NULL,
	`clase_teorica_id` text,
	`clase_practica_id` text,
	`estado_id` text NOT NULL,
	`estado_academico_id` text NOT NULL,
	`es_reprogramado` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`estado_academico_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`inscripcion_id`) REFERENCES `inscripcion`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`clase_teorica_id`) REFERENCES `clase_teorica`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`clase_practica_id`) REFERENCES `clase_practica`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `aula` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`capacidad` integer NOT NULL,
	`sucursal_id` text NOT NULL,
	`estado_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `avance_clase` (
	`id` text PRIMARY KEY NOT NULL,
	`tema_id` text NOT NULL,
	`estado_id` text NOT NULL,
	`clase_teorica_id` text,
	`clase_practica_id` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tema_id`) REFERENCES `tema`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`clase_teorica_id`) REFERENCES `clase_teorica`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`clase_practica_id`) REFERENCES `clase_practica`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `catalogo` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`categoria` text,
	`descripcion` text
);
--> statement-breakpoint
CREATE TABLE `clase_practica` (
	`id` text PRIMARY KEY NOT NULL,
	`inscripcion_id` text NOT NULL,
	`instructor_id` text,
	`vehiculo_id` text,
	`fecha_exacta` text NOT NULL,
	`hora_inicio` text NOT NULL,
	`hora_fin` text NOT NULL,
	`estado_academico_id` text NOT NULL,
	`estado_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`estado_academico_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`inscripcion_id`) REFERENCES `inscripcion`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`instructor_id`) REFERENCES `instructor`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculo`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `clase_teorica` (
	`id` text PRIMARY KEY NOT NULL,
	`horario_plantilla_id` text,
	`aula_id` text NOT NULL,
	`curso_id` text NOT NULL,
	`fecha_exacta` text NOT NULL,
	`hora_inicio` text NOT NULL,
	`hora_fin` text NOT NULL,
	`estado_academico_id` text NOT NULL,
	`estado_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`estado_academico_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`curso_id`) REFERENCES `curso`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`horario_plantilla_id`) REFERENCES `horario_plantilla`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`aula_id`) REFERENCES `aula`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `curso` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre_curso` text NOT NULL,
	`precio_base` real NOT NULL,
	`horas_teoricas_req` integer DEFAULT 0 NOT NULL,
	`horas_practicas_req` integer DEFAULT 0 NOT NULL,
	`gestion_id` text NOT NULL,
	`sucursal_id` text NOT NULL,
	`estado_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gestion_id`) REFERENCES `gestion`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `estado` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`categoria` text,
	`descripcion` text
);
--> statement-breakpoint
CREATE TABLE `estudiante` (
	`id` text PRIMARY KEY NOT NULL,
	`persona_id` text NOT NULL,
	`codigo_interno` text,
	`estado_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`persona_id`) REFERENCES `persona`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `estudiante_persona_id_unique` ON `estudiante` (`persona_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `estudiante_codigo_interno_unique` ON `estudiante` (`codigo_interno`);--> statement-breakpoint
CREATE TABLE `evaluacion_estudiante` (
	`id` text PRIMARY KEY NOT NULL,
	`examen_programado_id` text NOT NULL,
	`inscripcion_id` text NOT NULL,
	`nota` real,
	`observaciones` text,
	`estado_id` text NOT NULL,
	`estado_academico_id` text NOT NULL,
	`fecha_calificacion` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`estado_academico_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`examen_programado_id`) REFERENCES `examen_programado`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inscripcion_id`) REFERENCES `inscripcion`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `evaluacion_unica_key` ON `evaluacion_estudiante` (`examen_programado_id`,`inscripcion_id`);--> statement-breakpoint
CREATE TABLE `examen_programado` (
	`id` text PRIMARY KEY NOT NULL,
	`curso_id` text NOT NULL,
	`titulo` text NOT NULL,
	`tipo_examen_id` text NOT NULL,
	`fecha_exacta` text NOT NULL,
	`estado_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`tipo_examen_id`) REFERENCES `catalogo`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`curso_id`) REFERENCES `curso`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `gestion` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`fecha_inicio` text NOT NULL,
	`fecha_fin` text NOT NULL,
	`estado_gestion_id` text NOT NULL,
	`estado_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`estado_gestion_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `horario_plantilla` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`dia_semana_id` text NOT NULL,
	`tipo_clase_id` text NOT NULL,
	`hora_inicio` text NOT NULL,
	`hora_fin` text NOT NULL,
	`instructor_id` text,
	`aula_id` text,
	`curso_id` text NOT NULL,
	`estado_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`dia_semana_id`) REFERENCES `catalogo`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tipo_clase_id`) REFERENCES `catalogo`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`instructor_id`) REFERENCES `instructor`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`aula_id`) REFERENCES `aula`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`curso_id`) REFERENCES `curso`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `inscripcion` (
	`id` text PRIMARY KEY NOT NULL,
	`estudiante_id` text NOT NULL,
	`curso_id` text NOT NULL,
	`gestion_id` text NOT NULL,
	`precio_pactado` real NOT NULL,
	`fecha_inicio` text DEFAULT '2026-01-01' NOT NULL,
	`fecha_fin` text DEFAULT '2026-12-31' NOT NULL,
	`horario_plantilla_id` text NOT NULL,
	`fecha_inscripcion` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`estado_inscripcion_id` text NOT NULL,
	`estado_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`estado_inscripcion_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`estudiante_id`) REFERENCES `estudiante`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`curso_id`) REFERENCES `curso`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`gestion_id`) REFERENCES `gestion`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`horario_plantilla_id`) REFERENCES `horario_plantilla`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `instructor` (
	`id` text PRIMARY KEY NOT NULL,
	`persona_id` text NOT NULL,
	`nro_licencia` text NOT NULL,
	`disponibilidad_activa` integer DEFAULT true NOT NULL,
	`estado_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`persona_id`) REFERENCES `persona`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `instructor_persona_id_unique` ON `instructor` (`persona_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `instructor_nro_licencia_unique` ON `instructor` (`nro_licencia`);--> statement-breakpoint
CREATE TABLE `menu` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`ruta` text NOT NULL,
	`icono` text,
	`orden` integer DEFAULT 0 NOT NULL,
	`padre_id` text,
	`recurso_id` text NOT NULL,
	`estado_id` text NOT NULL,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`padre_id`) REFERENCES `menu`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`recurso_id`) REFERENCES `recurso`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `menu_ruta_key` ON `menu` (`ruta`);--> statement-breakpoint
CREATE TABLE `pago` (
	`id` text PRIMARY KEY NOT NULL,
	`inscripcion_id` text NOT NULL,
	`monto_pagado` real NOT NULL,
	`fecha_pago` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`metodo_pago_id` text NOT NULL,
	`estado_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`metodo_pago_id`) REFERENCES `catalogo`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`inscripcion_id`) REFERENCES `inscripcion`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `permiso` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`valor` integer NOT NULL,
	`descripcion` text,
	`estado_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `permiso_nombre_key` ON `permiso` (`nombre`);--> statement-breakpoint
CREATE UNIQUE INDEX `permiso_valor_key` ON `permiso` (`valor`);--> statement-breakpoint
CREATE TABLE `persona` (
	`id` text PRIMARY KEY NOT NULL,
	`nombres` text NOT NULL,
	`primer_apellido` text NOT NULL,
	`segundo_apellido` text,
	`nro_documento` integer NOT NULL,
	`nro_celular` integer NOT NULL,
	`email` text NOT NULL,
	`sexo_id` text NOT NULL,
	`tipo_documento_id` text NOT NULL,
	`fecha_nacimiento` text NOT NULL,
	`direccion` text,
	`estado_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`sexo_id`) REFERENCES `catalogo`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tipo_documento_id`) REFERENCES `catalogo`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `persona_email_key` ON `persona` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `persona_nro_documento_key` ON `persona` (`nro_documento`);--> statement-breakpoint
CREATE TABLE `recurso` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`ruta` text NOT NULL,
	`estado_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recurso_ruta_key` ON `recurso` (`ruta`);--> statement-breakpoint
CREATE TABLE `rol` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`estado_id` text NOT NULL,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rol_nombre_key` ON `rol` (`nombre`);--> statement-breakpoint
CREATE TABLE `roles_menus` (
	`id` text PRIMARY KEY NOT NULL,
	`rol_id` text NOT NULL,
	`menu_id` text NOT NULL,
	`permisos` integer DEFAULT 1 NOT NULL,
	`estado_id` text NOT NULL,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`rol_id`) REFERENCES `rol`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`menu_id`) REFERENCES `menu`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_menus_key` ON `roles_menus` (`rol_id`,`menu_id`);--> statement-breakpoint
CREATE TABLE `roles_recursos` (
	`id` text PRIMARY KEY NOT NULL,
	`rol_id` text NOT NULL,
	`recurso_id` text NOT NULL,
	`permisos` integer DEFAULT 1 NOT NULL,
	`estado_id` text NOT NULL,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`rol_id`) REFERENCES `rol`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`recurso_id`) REFERENCES `recurso`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_recursos_key` ON `roles_recursos` (`recurso_id`,`rol_id`);--> statement-breakpoint
CREATE TABLE `sucursal` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`direccion` text NOT NULL,
	`estado_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tema` (
	`id` text PRIMARY KEY NOT NULL,
	`curso_id` text NOT NULL,
	`titulo` text NOT NULL,
	`tipo_tema_id` text NOT NULL,
	`orden` integer DEFAULT 0,
	`estado_id` text NOT NULL,
	FOREIGN KEY (`tipo_tema_id`) REFERENCES `catalogo`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`curso_id`) REFERENCES `curso`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `usuario` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`persona_id` text NOT NULL,
	`estado_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`persona_id`) REFERENCES `persona`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuario_persona_id_key` ON `usuario` (`persona_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `usuario_username_key` ON `usuario` (`username`);--> statement-breakpoint
CREATE TABLE `usuarios_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`usuario_id` text NOT NULL,
	`rol_id` text NOT NULL,
	`asignado_el` text DEFAULT (CURRENT_TIMESTAMP),
	`estado_id` text NOT NULL,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`rol_id`) REFERENCES `rol`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_roles_usuario_id_rol_id_key` ON `usuarios_roles` (`usuario_id`,`rol_id`);--> statement-breakpoint
CREATE TABLE `vehiculo` (
	`id` text PRIMARY KEY NOT NULL,
	`placa` text NOT NULL,
	`marca` text NOT NULL,
	`estado_operativo_id` text NOT NULL,
	`estado_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`estado_operativo_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`estado_id`) REFERENCES `estado`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vehiculo_placa_unique` ON `vehiculo` (`placa`);--> statement-breakpoint
CREATE TABLE `yjs_docs` (
	`doc_id` text PRIMARY KEY NOT NULL,
	`table_name` text NOT NULL,
	`state` text NOT NULL,
	`dirty` integer DEFAULT false NOT NULL
);
