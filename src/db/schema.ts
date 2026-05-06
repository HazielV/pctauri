import {
  integer,
  text,
  sqliteTable,
  uniqueIndex,
  foreignKey,
  real,
} from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";
import { sql } from "drizzle-orm";

// ==========================================
// TABLA CATÁLOGO (Tipos, Métodos, Días, Sexo)
// ==========================================
export const catalogo = sqliteTable("catalogo", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  nombre: text("nombre").notNull(), // Ej: "MASCULINO", "CEDULA", "EFECTIVO"
  categoria: text("categoria"), // Ej: "SEXO", "TIPO_DOCUMENTO", "METODO_PAGO"
  descripcion: text("descripcion"),
});

// ==========================================
// TABLA ESTADO (Ciclo de vida, Operativos, Académicos)
// ==========================================
export const estado = sqliteTable("estado", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  nombre: text("nombre").notNull(), // Ej: "ACTIVO", "INACTIVO", "PRESENTE"
  categoria: text("categoria"), // Ej: "SISTEMA", "ESTADO_ACADEMICO"
  descripcion: text("descripcion"),
});

// ==========================================
// SISTEMA Y SEGURIDAD
// ==========================================

export const persona = sqliteTable(
  "persona",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    nombres: text("nombres").notNull(),
    primer_apellido: text("primer_apellido").notNull(),
    segundo_apellido: text("segundo_apellido"),
    nro_documento: integer("nro_documento").notNull(),
    nro_celular: integer("nro_celular").notNull(),
    email: text("email").notNull(),
    // Referencias a Catálogo
    sexo_id: text("sexo_id")
      .notNull()
      .references(() => catalogo.id),
    tipo_documento_id: text("tipo_documento_id")
      .notNull()
      .references(() => catalogo.id),
    fecha_nacimiento: text("fecha_nacimiento").notNull(),
    direccion: text("direccion"),
    // Referencia a Estado
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
    created_at: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated_at: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    uniqueIndex("persona_email_key").on(table.email),
    uniqueIndex("persona_nro_documento_key").on(table.nro_documento),
  ],
);

export const usuario = sqliteTable(
  "usuario",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    username: text("username").notNull(),
    password: text("password").notNull(),
    persona_id: text("persona_id").notNull(),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
    created_at: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated_at: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    uniqueIndex("usuario_persona_id_key").on(table.persona_id),
    uniqueIndex("usuario_username_key").on(table.username),
    foreignKey({
      columns: [table.persona_id],
      foreignColumns: [persona.id],
      name: "usuario_persona_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const rol = sqliteTable(
  "rol",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    nombre: text("nombre").notNull(),
    descripcion: text("descripcion"),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
  },
  (table) => [uniqueIndex("rol_nombre_key").on(table.nombre)],
);

export const permiso = sqliteTable(
  "permiso",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    nombre: text("nombre").notNull(),
    valor: integer("valor").notNull(),
    descripcion: text("descripcion"),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
    created_at: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated_at: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    uniqueIndex("permiso_nombre_key").on(table.nombre),
    uniqueIndex("permiso_valor_key").on(table.valor),
  ],
);

export const recurso = sqliteTable(
  "recurso",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    nombre: text("nombre").notNull(),
    ruta: text("ruta").notNull(),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
    created_at: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated_at: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [uniqueIndex("recurso_ruta_key").on(table.ruta)],
);

export const menu = sqliteTable(
  "menu",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    nombre: text("nombre").notNull(),
    ruta: text("ruta").notNull(),
    icono: text("icono"),
    orden: integer("orden").default(0).notNull(),
    padre_id: text("padre_id"),
    recurso_id: text("recurso_id"),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
  },
  (table) => [
    uniqueIndex("menu_ruta_key").on(table.ruta),
    foreignKey({
      columns: [table.padre_id],
      foreignColumns: [table.id],
      name: "menu_padre_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.recurso_id],
      foreignColumns: [recurso.id],
      name: "menu_recurso_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

export const rolesRecursos = sqliteTable(
  "roles_recursos",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    rol_id: text("rol_id").notNull(),
    recurso_id: text("recurso_id").notNull(),
    permisos: integer("permisos").default(1).notNull(),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
  },
  (table) => [
    uniqueIndex("roles_recursos_key").on(table.recurso_id, table.rol_id),
    foreignKey({
      columns: [table.rol_id],
      foreignColumns: [rol.id],
      name: "roles_recursos_rol_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.recurso_id],
      foreignColumns: [recurso.id],
      name: "roles_recursos_recurso_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const rolesMenus = sqliteTable(
  "roles_menus",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    rol_id: text("rol_id").notNull(),
    menu_id: text("menu_id").notNull(),
    permisos: integer("permisos").default(1).notNull(),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
  },
  (table) => [
    uniqueIndex("roles_menus_key").on(table.rol_id, table.menu_id),
    foreignKey({
      columns: [table.rol_id],
      foreignColumns: [rol.id],
      name: "roles_menus_rol_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.menu_id],
      foreignColumns: [menu.id],
      name: "roles_menus_menu_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const usuariosRoles = sqliteTable(
  "usuarios_roles",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    usuario_id: text("usuario_id").notNull(),
    rol_id: text("rol_id").notNull(),
    asignado_el: text("asignado_el").default(sql`(CURRENT_TIMESTAMP)`),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
  },
  (table) => [
    uniqueIndex("usuarios_roles_usuario_id_rol_id_key").on(
      table.usuario_id,
      table.rol_id,
    ),
    foreignKey({
      columns: [table.usuario_id],
      foreignColumns: [usuario.id],
      name: "usuarios_roles_usuario_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.rol_id],
      foreignColumns: [rol.id],
      name: "usuarios_roles_rol_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// ==========================================
// NIVEL 1: TIEMPO, UBICACIÓN Y CATÁLOGO
// ==========================================

export const gestion = sqliteTable("gestion", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  nombre: text("nombre").notNull(),
  fecha_inicio: text("fecha_inicio").notNull(),
  fecha_fin: text("fecha_fin").notNull(),
  estado_gestion_id: text("estado_gestion_id")
    .notNull()
    .references(() => estado.id),
  estado_id: text("estado_id")
    .notNull()
    .references(() => estado.id),
  created_at: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const sucursal = sqliteTable("sucursal", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  nombre: text("nombre").notNull(),
  direccion: text("direccion").notNull(),
  estado_id: text("estado_id")
    .notNull()
    .references(() => estado.id),
  created_at: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const curso = sqliteTable(
  "curso",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    nombre_curso: text("nombre_curso").notNull(),
    precio_base: real("precio_base").notNull(),
    horas_teoricas_req: integer("horas_teoricas_req").notNull().default(0),
    horas_practicas_req: integer("horas_practicas_req").notNull().default(0),
    gestion_id: text("gestion_id").notNull(),
    sucursal_id: text("sucursal_id").notNull(),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
    created_at: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated_at: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    foreignKey({ columns: [table.gestion_id], foreignColumns: [gestion.id] })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({ columns: [table.sucursal_id], foreignColumns: [sucursal.id] })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

// ==========================================
// NIVEL 2: ACTORES Y RECURSOS
// ==========================================

export const estudiante = sqliteTable(
  "estudiante",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    persona_id: text("persona_id").notNull().unique(),
    codigo_interno: text("codigo_interno").unique(),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
    created_at: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated_at: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    foreignKey({
      columns: [table.persona_id],
      foreignColumns: [persona.id],
      name: "estudiante_persona_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const instructor = sqliteTable(
  "instructor",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    persona_id: text("persona_id").notNull().unique(),
    nro_licencia: text("nro_licencia").notNull().unique(),
    disponibilidad_activa: integer("disponibilidad_activa", { mode: "boolean" })
      .notNull()
      .default(true),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
    created_at: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated_at: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    foreignKey({
      columns: [table.persona_id],
      foreignColumns: [persona.id],
      name: "instructor_persona_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const vehiculo = sqliteTable("vehiculo", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  placa: text("placa").notNull().unique(),
  marca: text("marca").notNull(),
  estado_operativo_id: text("estado_operativo_id")
    .notNull()
    .references(() => estado.id),
  estado_id: text("estado_id")
    .notNull()
    .references(() => estado.id),
  created_at: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const aula = sqliteTable(
  "aula",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    nombre: text("nombre").notNull(),
    capacidad: integer("capacidad").notNull(),
    sucursal_id: text("sucursal_id").notNull(),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
    created_at: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated_at: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    foreignKey({ columns: [table.sucursal_id], foreignColumns: [sucursal.id] })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

// ==========================================
// NIVEL 3: CONTRATO Y FINANZAS
// ==========================================

export const inscripcion = sqliteTable(
  "inscripcion",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    estudiante_id: text("estudiante_id").notNull(),
    curso_id: text("curso_id").notNull(),
    gestion_id: text("gestion_id").notNull(),
    precio_pactado: real("precio_pactado").notNull(),
    fecha_inicio: text("fecha_inicio").notNull().default("2026-01-01"),
    fecha_fin: text("fecha_fin").notNull().default("2026-12-31"),
    horario_plantilla_id: text("horario_plantilla_id").notNull(),
    fecha_inscripcion: text("fecha_inscripcion")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    estado_inscripcion_id: text("estado_inscripcion_id")
      .notNull()
      .references(() => estado.id),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
    created_at: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated_at: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    foreignKey({
      columns: [table.estudiante_id],
      foreignColumns: [estudiante.id],
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({ columns: [table.curso_id], foreignColumns: [curso.id] })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({ columns: [table.gestion_id], foreignColumns: [gestion.id] })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.horario_plantilla_id],
      foreignColumns: [horarioPlantilla.id],
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const pago = sqliteTable(
  "pago",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    inscripcion_id: text("inscripcion_id").notNull(),
    monto_pagado: real("monto_pagado").notNull(),
    fecha_pago: text("fecha_pago")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    // Referencia a Catálogo (Método de Pago)
    metodo_pago_id: text("metodo_pago_id")
      .notNull()
      .references(() => catalogo.id),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
    created_at: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated_at: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    foreignKey({
      columns: [table.inscripcion_id],
      foreignColumns: [inscripcion.id],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// ==========================================
// NIVEL 4: OPERACIÓN (PLANTILLAS Y CLASES)
// ==========================================

export const horarioPlantilla = sqliteTable(
  "horario_plantilla",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    nombre: text("nombre").notNull(),
    // Referencias a Catálogo
    dia_semana_id: text("dia_semana_id")
      .notNull()
      .references(() => catalogo.id),
    tipo_clase_id: text("tipo_clase_id")
      .notNull()
      .references(() => catalogo.id),
    hora_inicio: text("hora_inicio").notNull(),
    hora_fin: text("hora_fin").notNull(),
    instructor_id: text("instructor_id"),
    aula_id: text("aula_id"),
    curso_id: text("curso_id").notNull(),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
    created_at: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated_at: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    foreignKey({
      columns: [table.instructor_id],
      foreignColumns: [instructor.id],
    })
      .onUpdate("cascade")
      .onDelete("set null"),
    foreignKey({
      columns: [table.aula_id],
      foreignColumns: [aula.id],
    })
      .onUpdate("cascade")
      .onDelete("set null"),
    foreignKey({
      columns: [table.curso_id],
      foreignColumns: [curso.id],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const claseTeorica = sqliteTable(
  "clase_teorica",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    horario_plantilla_id: text("horario_plantilla_id"),
    aula_id: text("aula_id").notNull(),
    curso_id: text("curso_id").notNull(),
    fecha_exacta: text("fecha_exacta").notNull(),
    hora_inicio: text("hora_inicio").notNull(),
    hora_fin: text("hora_fin").notNull(),
    // Unificado a estado_academico_id
    estado_academico_id: text("estado_academico_id")
      .notNull()
      .references(() => estado.id),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
    created_at: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated_at: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    foreignKey({ columns: [table.curso_id], foreignColumns: [curso.id] })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.horario_plantilla_id],
      foreignColumns: [horarioPlantilla.id],
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({ columns: [table.aula_id], foreignColumns: [aula.id] })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const clasePractica = sqliteTable(
  "clase_practica",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    inscripcion_id: text("inscripcion_id").notNull(),
    instructor_id: text("instructor_id"),
    vehiculo_id: text("vehiculo_id"),
    fecha_exacta: text("fecha_exacta").notNull(),
    hora_inicio: text("hora_inicio").notNull(),
    hora_fin: text("hora_fin").notNull(),
    // Unificado a estado_academico_id
    estado_academico_id: text("estado_academico_id")
      .notNull()
      .references(() => estado.id),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
    created_at: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated_at: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    foreignKey({
      columns: [table.inscripcion_id],
      foreignColumns: [inscripcion.id],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.instructor_id],
      foreignColumns: [instructor.id],
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({ columns: [table.vehiculo_id], foreignColumns: [vehiculo.id] })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

// ==========================================
// NIVEL 5: ASISTENCIA Y REPROGRAMACIÓN
// ==========================================

export const asistenciaGeneral = sqliteTable(
  "asistencia_general",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    inscripcion_id: text("inscripcion_id").notNull(),
    clase_teorica_id: text("clase_teorica_id"),
    clase_practica_id: text("clase_practica_id"),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
    // Unificado a estado_academico_id
    estado_academico_id: text("estado_academico_id")
      .notNull()
      .references(() => estado.id),
    es_reprogramado: integer("es_reprogramado", { mode: "boolean" })
      .notNull()
      .default(false),
    created_at: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated_at: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    foreignKey({
      columns: [table.inscripcion_id],
      foreignColumns: [inscripcion.id],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.clase_teorica_id],
      foreignColumns: [claseTeorica.id],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.clase_practica_id],
      foreignColumns: [clasePractica.id],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const tema = sqliteTable(
  "tema",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    curso_id: text("curso_id").notNull(),
    titulo: text("titulo").notNull(),

    // Referencia a Catálogo
    tipo_tema_id: text("tipo_tema_id")
      .notNull()
      .references(() => catalogo.id),
    orden: integer("orden").default(0),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
  },
  (table) => [
    foreignKey({
      columns: [table.curso_id],
      foreignColumns: [curso.id],
    }).onDelete("cascade"),
  ],
);

export const avanceClase = sqliteTable(
  "avance_clase",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    tema_id: text("tema_id").notNull(),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
    clase_teorica_id: text("clase_teorica_id"),
    clase_practica_id: text("clase_practica_id"),
    created_at: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.tema_id],
      foreignColumns: [tema.id],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.clase_teorica_id],
      foreignColumns: [claseTeorica.id],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.clase_practica_id],
      foreignColumns: [clasePractica.id],
    }).onDelete("cascade"),
  ],
);

export const examenProgramado = sqliteTable(
  "examen_programado",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    curso_id: text("curso_id").notNull(),
    titulo: text("titulo").notNull(),
    // Referencia a Catálogo
    tipo_examen_id: text("tipo_examen_id")
      .notNull()
      .references(() => catalogo.id),
    fecha_exacta: text("fecha_exacta").notNull(),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
    created_at: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.curso_id],
      foreignColumns: [curso.id],
    }).onDelete("cascade"),
  ],
);

export const evaluacionEstudiante = sqliteTable(
  "evaluacion_estudiante",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    examen_programado_id: text("examen_programado_id").notNull(),
    inscripcion_id: text("inscripcion_id").notNull(),
    nota: real("nota"),
    observaciones: text("observaciones"),
    estado_id: text("estado_id")
      .notNull()
      .references(() => estado.id),
    // Unificado a estado_academico_id
    estado_academico_id: text("estado_academico_id")
      .notNull()
      .references(() => estado.id),
    fecha_calificacion: text("fecha_calificacion")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("evaluacion_unica_key").on(
      table.examen_programado_id,
      table.inscripcion_id,
    ),
    foreignKey({
      columns: [table.examen_programado_id],
      foreignColumns: [examenProgramado.id],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.inscripcion_id],
      foreignColumns: [inscripcion.id],
    }).onDelete("cascade"),
  ],
);

export const yjsDocs = sqliteTable("yjs_docs", {
  doc_id: text("doc_id").primaryKey(),
  table_name: text("table_name").notNull(),
  state: text("state").notNull(),
  dirty: integer("dirty", { mode: "boolean" }).notNull().default(false),
});
