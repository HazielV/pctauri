import {
  integer,
  text,
  sqliteTable,
  uniqueIndex,
  foreignKey,
  primaryKey,
  real,
  blob,
} from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";
import { sql } from "drizzle-orm";

export const persona = sqliteTable(
  "Persona",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    nombres: text().notNull(),
    primerApellido: text().notNull(),
    segundoApellido: text(),
    nroDocumento: integer().notNull(),
    nroCelular: integer().notNull(),
    email: text().notNull(),
    sexo: text("sexo", { enum: ["MASCULINO", "FEMENINO", "OTRO"] }).notNull(),
    fechaNacimiento: text().notNull(),
    direccion: text(),
    createdAt: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    tipoDocumento: text("TipoDocumento", {
      enum: ["CEDULA", "PASAPORTE", "EXTRANJERO"],
    }).notNull(),
    estado: text("Estado", {
      enum: ["activo", "inactivo", "pendiente"],
    })
      .notNull()
      .default("activo"),
  },
  (table) => [
    // NUEVA API: Ahora se usa un array directamente
    uniqueIndex("Persona_email_key").on(table.email),
    uniqueIndex("Persona_nroDocumento_key").on(table.nroDocumento),
  ],
);

export const usuario = sqliteTable(
  "Usuario",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    username: text().notNull(),
    password: text().notNull(),
    createdAt: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    personaId: text().notNull(),
    estado: text("Estado", {
      enum: ["activo", "inactivo", "pendiente"],
    })
      .notNull()
      .default("activo"),
  },
  (table) => [
    uniqueIndex("Usuario_personaId_key").on(table.personaId),
    uniqueIndex("Usuario_username_key").on(table.username),
    foreignKey({
      columns: [table.personaId],
      foreignColumns: [persona.id],
      name: "Usuario_personaId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const rol = sqliteTable(
  "Rol",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    nombre: text().notNull(),
    descripcion: text(),
    estado: text("Estado", {
      enum: ["activo", "inactivo", "pendiente"],
    })
      .notNull()
      .default("activo"),
  },
  (table) => [uniqueIndex("Rol_nombre_key").on(table.nombre)],
);
export const permiso = sqliteTable(
  "Permiso",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    nombre: text().notNull(),
    valor: integer().notNull(),
    descripcion: text(),
    createdAt: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    estado: text("Estado", {
      enum: ["activo", "inactivo", "pendiente"],
    })
      .notNull()
      .default("activo"),
  },
  (table) => [
    uniqueIndex("Permiso_nombre_key").on(table.nombre),
    uniqueIndex("Permiso_valor_key").on(table.valor),
  ],
);

export const recurso = sqliteTable(
  "Recurso",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    nombre: text().notNull(),
    ruta: text().notNull(),
    createdAt: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    estado: text("Estado", {
      enum: ["activo", "inactivo", "pendiente"],
    })
      .notNull()
      .default("activo"),
  },
  (table) => [uniqueIndex("Recurso_ruta_key").on(table.ruta)],
);

export const menu = sqliteTable(
  "Menu",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    nombre: text().notNull(),
    ruta: text().notNull(),
    icono: text(),
    orden: integer().default(0).notNull(),
    padreId: integer(),
    estado: text("Estado", {
      enum: ["activo", "inactivo", "pendiente"],
    })
      .notNull()
      .default("activo"),
    recursoId: text().notNull(),
  },
  (table) => [
    uniqueIndex("Menu_ruta_key").on(table.ruta),
    foreignKey({
      columns: [table.padreId],
      foreignColumns: [table.id],
      name: "Menu_padreId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.recursoId],
      foreignColumns: [recurso.id],
      name: "Menu_recursoId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

export const rolesRecursos = sqliteTable(
  "RolesRecursos",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    rolId: text().notNull(),
    recursoId: text().notNull(),
    permisos: integer().default(1).notNull(),
  },
  (table) => [
    uniqueIndex("RolesRecursos_key").on(table.recursoId, table.rolId),
    foreignKey({
      columns: [table.rolId],
      foreignColumns: [rol.id],
      name: "RolesRecursos_rolId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.recursoId],
      foreignColumns: [recurso.id],
      name: "RolesRecursos_recursoId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const rolesMenus = sqliteTable(
  "RolesMenus",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    rolId: text().notNull(),
    menuId: text().notNull(),
    permisos: integer().default(1).notNull(),
    estado: text("Estado", {
      enum: ["activo", "inactivo", "pendiente"],
    })
      .notNull()
      .default("activo"),
  },
  (table) => [
    uniqueIndex("RolesMenus_key").on(table.rolId, table.menuId),
    foreignKey({
      columns: [table.rolId],
      foreignColumns: [rol.id],
      name: "RolesMenus_rolId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.menuId],
      foreignColumns: [menu.id],
      name: "RolesMenus_menuId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const usuariosRoles = sqliteTable(
  "UsuariosRoles",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    usuarioId: text().notNull(),
    rolId: text().notNull(),
    asignadoEl: text("asignadoEl").default(sql`(CURRENT_TIMESTAMP)`),
    estado: text("Estado", {
      enum: ["activo", "inactivo", "pendiente"],
    })
      .notNull()
      .default("activo"),
  },
  (table) => [
    uniqueIndex("UsuariosRoles_usuarioId_rolId_key").on(
      table.usuarioId,
      table.rolId,
    ),
    foreignKey({
      columns: [table.usuarioId],
      foreignColumns: [usuario.id],
      name: "UsuariosRoles_usuarioId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.rolId],
      foreignColumns: [rol.id],
      name: "UsuariosRoles_rolId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);
// ==========================================
// NIVEL 1: TIEMPO, UBICACIÓN Y CATÁLOGO
// ==========================================
export const gestion = sqliteTable("Gestion", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  nombre: text().notNull(), // Ej: "Gestión 2025"
  fechaInicio: text().notNull(),
  fechaFin: text().notNull(),
  estadoGestion: text("EstadoGestion", { enum: ["ACTIVA", "CERRADA"] })
    .notNull()
    .default("ACTIVA"),
  createdAt: text()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  estado: text("Estado", { enum: ["activo", "inactivo", "pendiente"] })
    .notNull()
    .default("activo"),
});

export const sucursal = sqliteTable("Sucursal", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  nombre: text().notNull(),
  direccion: text().notNull(),
  createdAt: text()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  estado: text("Estado", { enum: ["activo", "inactivo", "pendiente"] })
    .notNull()
    .default("activo"),
});

export const curso = sqliteTable(
  "Curso",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    nombreCurso: text().notNull(),
    precioBase: real().notNull(),
    horasTeoricasReq: integer().notNull().default(0),
    horasPracticasReq: integer().notNull().default(0),
    gestionId: text().notNull(),
    sucursalId: text().notNull(),
    createdAt: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    estado: text("Estado", {
      enum: ["activo", "inactivo", "finalizado", "en curso", "programado"],
    })
      .notNull()
      .default("activo"),
  },
  (table) => [
    foreignKey({ columns: [table.gestionId], foreignColumns: [gestion.id] })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({ columns: [table.sucursalId], foreignColumns: [sucursal.id] })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

// ==========================================
// NIVEL 2: ACTORES Y RECURSOS
// ==========================================

export const estudiante = sqliteTable(
  "Estudiante",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    personaId: integer("personaId").notNull().unique(),
    codigoInterno: text("codigoInterno").unique(),
    createdAt: text("createdAt")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text("updatedAt")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    estado: text("Estado", { enum: ["activo", "inactivo", "pendiente"] })
      .notNull()
      .default("activo"),
  },
  (table) => [
    foreignKey({
      columns: [table.personaId],
      foreignColumns: [persona.id],
      name: "Estudiante_personaId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const instructor = sqliteTable(
  "Instructor",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    personaId: text("personaId").notNull().unique(),
    nroLicencia: text("nroLicencia").notNull().unique(),
    disponibilidadActiva: integer("disponibilidadActiva", { mode: "boolean" })
      .notNull()
      .default(true),
    createdAt: text("createdAt")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text("updatedAt")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    estado: text("Estado", { enum: ["activo", "inactivo", "pendiente"] })
      .notNull()
      .default("activo"),
  },
  (table) => [
    foreignKey({
      columns: [table.personaId],
      foreignColumns: [persona.id],
      name: "Instructor_personaId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const vehiculo = sqliteTable("Vehiculo", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  placa: text().notNull().unique(),
  marca: text().notNull(),
  estadoOperativo: text("EstadoOperativo", {
    enum: ["DISPONIBLE", "MANTENIMIENTO", "AVERIADO"],
  })
    .notNull()
    .default("DISPONIBLE"),
  createdAt: text()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  estado: text("Estado", { enum: ["activo", "inactivo", "pendiente"] })
    .notNull()
    .default("activo"),
});

export const aula = sqliteTable(
  "Aula",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    nombre: text().notNull(),
    capacidad: integer().notNull(),
    sucursalId: text().notNull(),
    createdAt: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    estado: text("Estado", { enum: ["activo", "inactivo", "pendiente"] })
      .notNull()
      .default("activo"),
  },
  (table) => [
    foreignKey({ columns: [table.sucursalId], foreignColumns: [sucursal.id] })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

// ==========================================
// NIVEL 3: CONTRATO Y FINANZAS
// ==========================================

export const inscripcion = sqliteTable(
  "Inscripcion",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    estudianteId: text().notNull(),
    cursoId: text().notNull(),
    gestionId: text().notNull(),
    precioPactado: real().notNull(),
    fechaInicio: text().notNull().default("2026-01-01"), // Valor temporal
    fechaFin: text().notNull().default("2026-12-31"),
    horarioPlantillaId: integer("horarioPlantillaId").notNull(),
    fechaInscripcion: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    estadoInscripcion: text("EstadoInscripcion", {
      enum: ["pendiente", "reprobado", "aprobado"],
    })
      .notNull()
      .default("pendiente"),
    createdAt: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    estado: text("Estado", {
      enum: ["activo", "inactivo", "pendiente", "finalizada", "abandonada"],
    })
      .notNull()
      .default("activo"),
  },
  (table) => [
    foreignKey({
      columns: [table.estudianteId],
      foreignColumns: [estudiante.id],
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({ columns: [table.cursoId], foreignColumns: [curso.id] })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({ columns: [table.gestionId], foreignColumns: [gestion.id] })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.horarioPlantillaId],
      foreignColumns: [horarioPlantilla.id],
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const pago = sqliteTable(
  "Pago",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    inscripcionId: text().notNull(),
    montoPagado: real().notNull(),
    fechaPago: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    metodoPago: text("MetodoPago", {
      enum: ["EFECTIVO", "TARJETA", "TRANSFERENCIA"],
    }).notNull(),
    createdAt: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    estado: text("Estado", { enum: ["activo", "inactivo", "pendiente"] })
      .notNull()
      .default("activo"),
  },
  (table) => [
    foreignKey({
      columns: [table.inscripcionId],
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
  "HorarioPlantilla",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    nombre: text().notNull(),
    diaSemana: text("diaSemana", {
      enum: [
        "LUNES",
        "MARTES",
        "MIERCOLES",
        "JUEVES",
        "VIERNES",
        "SABADO",
        "DOMINGO",
      ],
    }).notNull(),
    horaInicio: text().notNull(),
    horaFin: text().notNull(),
    tipo: text("TipoClase", { enum: ["TEORICO", "PRACTICO"] }).notNull(),

    instructorId: integer(),
    aulaId: integer(),

    cursoId: text().notNull(), // El curso sí es obligatorio para que el horario exista

    createdAt: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    estado: text("Estado", { enum: ["activo", "inactivo", "pendiente"] })
      .notNull()
      .default("activo"),
  },
  (table) => [
    foreignKey({
      columns: [table.instructorId],
      foreignColumns: [instructor.id],
    })
      .onUpdate("cascade")
      .onDelete("set null"), // Importante: set null si se borra el instructor

    foreignKey({
      columns: [table.aulaId],
      foreignColumns: [aula.id],
    })
      .onUpdate("cascade")
      .onDelete("set null"),

    foreignKey({
      columns: [table.cursoId],
      foreignColumns: [curso.id],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const claseTeorica = sqliteTable(
  "ClaseTeorica",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    horarioPlantillaId: integer(),
    aulaId: text().notNull(),
    cursoId: text().notNull(),
    fechaExacta: text().notNull(),
    horaInicio: text().notNull(), // Ej: "14:00"
    horaFin: text().notNull(), // Ej: "15:00"
    estadoClase: text("EstadoClase", {
      enum: ["PROGRAMADA", "DICTADA", "CANCELADA"],
    })
      .notNull()
      .default("PROGRAMADA"),
    createdAt: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    estado: text("Estado", { enum: ["activo", "inactivo", "pendiente"] })
      .notNull()
      .default("activo"),
  },
  (table) => [
    foreignKey({ columns: [table.cursoId], foreignColumns: [curso.id] })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.horarioPlantillaId],
      foreignColumns: [horarioPlantilla.id],
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({ columns: [table.aulaId], foreignColumns: [aula.id] })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const clasePractica = sqliteTable(
  "ClasePractica",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),

    inscripcionId: text().notNull(),
    instructorId: integer(), // El instructor asignado para esta hora
    vehiculoId: integer(),
    fechaExacta: text().notNull(),
    horaInicio: text().notNull(), // Ej: "14:00"
    horaFin: text().notNull(), // Ej: "15:00"
    estadoClase: text("EstadoClase", {
      enum: ["PROGRAMADA", "COMPLETADA", "CANCELADA"],
    })
      .notNull()
      .default("PROGRAMADA"),
    createdAt: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    estado: text("Estado", { enum: ["activo", "inactivo", "pendiente"] })
      .notNull()
      .default("activo"),
  },
  (table) => [
    foreignKey({
      columns: [table.inscripcionId],
      foreignColumns: [inscripcion.id],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.instructorId],
      foreignColumns: [instructor.id],
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({ columns: [table.vehiculoId], foreignColumns: [vehiculo.id] })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

// ==========================================
// NIVEL 5: ASISTENCIA Y REPROGRAMACIÓN
// ==========================================

export const asistenciaGeneral = sqliteTable(
  "AsistenciaGeneral",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    inscripcionId: text().notNull(),
    claseTeoricaId: integer(), // Null si asiste a práctica
    clasePracticaId: integer(), // Null si asiste a teoría
    estadoAsistencia: text("EstadoAsistencia", {
      enum: ["PROGRAMADA", "PRESENTE", "FALTA", "REPROGRAMADA"],
    })
      .notNull()
      .default("PROGRAMADA"),
    esReprogramado: integer({ mode: "boolean" }).notNull().default(false), // True si proviene de un cambio
    createdAt: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    // Al ser una tabla N:N puramente transaccional/operativa, NO lleva "estado" (soft delete).
    // Si se cancela, su "estadoAsistencia" cambia a REPROGRAMADA u otro estado lógico.
  },
  (table) => [
    foreignKey({
      columns: [table.inscripcionId],
      foreignColumns: [inscripcion.id],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.claseTeoricaId],
      foreignColumns: [claseTeorica.id],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.clasePracticaId],
      foreignColumns: [clasePractica.id],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);
export const tema = sqliteTable(
  "Tema",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    cursoId: text().notNull(),
    titulo: text().notNull(), // Ej: "Ley de Tránsito Art. 10", "Parqueo en reversa"
    tipo: text("TipoTema", { enum: ["TEORICO", "PRACTICO"] }).notNull(),
    orden: integer().default(0), // Para saber qué enseñar primero
    estado: text("Estado", { enum: ["activo", "inactivo"] })
      .default("activo")
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.cursoId],
      foreignColumns: [curso.id],
    }).onDelete("cascade"),
  ],
);
export const avanceClase = sqliteTable(
  "AvanceClase",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    temaId: text().notNull(),

    // Si es teoría, se asocia a la clase general (todos avanzan lo mismo)
    claseTeoricaId: integer(),

    // Si es práctica, se asocia a la clase individual del alumno
    clasePracticaId: integer(),

    createdAt: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [
    foreignKey({ columns: [table.temaId], foreignColumns: [tema.id] }).onDelete(
      "cascade",
    ),
    foreignKey({
      columns: [table.claseTeoricaId],
      foreignColumns: [claseTeorica.id],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.clasePracticaId],
      foreignColumns: [clasePractica.id],
    }).onDelete("cascade"),
  ],
);
// 1. EL EVENTO (Lo que crea el administrador o instructor)
export const examenProgramado = sqliteTable(
  "ExamenProgramado",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    cursoId: text().notNull(),
    titulo: text().notNull(), // Ej: "Examen Final de Normativa" o "Prueba de Parqueo"
    tipoExamen: text("TipoExamen", {
      enum: ["TEORICO", "PRACTICO"],
    }).notNull(),
    fechaExacta: text().notNull(), // Cuándo se tomará
    estado: text("Estado", {
      enum: ["PROGRAMADO", "COMPLETADO", "CANCELADO"],
    })
      .default("PROGRAMADO")
      .notNull(),
    createdAt: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.cursoId],
      foreignColumns: [curso.id],
    }).onDelete("cascade"),
  ],
);

// 2. EL RESULTADO (La nota de cada alumno)
export const evaluacionEstudiante = sqliteTable(
  "EvaluacionEstudiante",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    examenProgramadoId: text().notNull(),
    inscripcionId: text().notNull(), // Quién dio el examen

    nota: real(), // Puede ser NULL hasta que el instructor la llene
    observaciones: text(),

    estadoAsistencia: text("EstadoAsistencia", {
      enum: ["PRESENTE", "FALTA"],
    })
      .default("PRESENTE")
      .notNull(),

    fechaCalificacion: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [
    // Clave única: Un alumno no puede tener dos notas para el mismo examen exacto
    uniqueIndex("Evaluacion_Unica_key").on(
      table.examenProgramadoId,
      table.inscripcionId,
    ),

    foreignKey({
      columns: [table.examenProgramadoId],
      foreignColumns: [examenProgramado.id],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.inscripcionId],
      foreignColumns: [inscripcion.id],
    }).onDelete("cascade"),
  ],
);
export const pendingSync = sqliteTable("PendingSync", {
  id: text("id").primaryKey(), // UUID
  tabla: text("tabla").notNull(),
  metodo: text("metodo").notNull(), // 'run', 'execute', etc.
  updatePayload: text("update_payload", { mode: "json" }).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});
export const yjsDocs = sqliteTable("yjsDocs", {
  doc_id: text("doc_id").primaryKey(), // uuid del registro
  table_name: text("table_name").notNull(), // "persona", "pedido", etc.
  state: text("state").notNull(), // Y.Doc serializado en base64
  dirty: integer("dirty", { mode: "boolean" }).notNull().default(false),
});
