import {
  integer,
  text,
  sqliteTable,
  uniqueIndex,
  foreignKey,
  primaryKey,
  real,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const persona = sqliteTable(
  "Persona",
  {
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
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
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    username: text().notNull(),
    password: text().notNull(),
    createdAt: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    personaId: integer().notNull(),
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
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
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
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
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
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
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
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
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
    recursoId: integer(),
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
    rolId: integer().notNull(),
    recursoId: integer().notNull(),
    permisos: integer().default(1).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.rolId, table.recursoId],
      name: "RolesRecursos_pkey",
    }),
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
    rolId: integer().notNull(),
    menuId: integer().notNull(),
    permisos: integer().default(1).notNull(),
    estado: text("Estado", {
      enum: ["activo", "inactivo", "pendiente"],
    })
      .notNull()
      .default("activo"),
  },
  (table) => [
    primaryKey({
      columns: [table.rolId, table.menuId],
      name: "RolesMenus_pkey",
    }),
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
    usuarioId: integer().notNull(),
    rolId: integer().notNull(),
    asignadoEl: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    estado: text("Estado", {
      enum: ["activo", "inactivo", "pendiente"],
    })
      .notNull()
      .default("activo"),
  },
  (table) => [
    primaryKey({
      columns: [table.usuarioId, table.rolId],
      name: "UsuariosRoles_pkey",
    }),
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
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
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
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
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
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    nombreCurso: text().notNull(),
    precioBase: real().notNull(),
    horasTeoricasReq: integer().notNull().default(0),
    horasPracticasReq: integer().notNull().default(0),
    gestionId: integer().notNull(),
    sucursalId: integer().notNull(),
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
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
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
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    personaId: integer("personaId").notNull().unique(),
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
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
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
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    nombre: text().notNull(),
    capacidad: integer().notNull(),
    sucursalId: integer().notNull(),
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
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    estudianteId: integer().notNull(),
    cursoId: integer().notNull(),
    gestionId: integer().notNull(),
    precioPactado: real().notNull(),
    fechaInscripcion: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    estadoInscripcion: text("EstadoInscripcion", {
      enum: ["ACTIVA", "FINALIZADA", "ABANDONADA"],
    })
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
  ],
);

export const pago = sqliteTable(
  "Pago",
  {
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    inscripcionId: integer().notNull(),
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
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    nombre: text().notNull(), // Ej: "Lunes-Miercoles 08:00-10:00"
    diasSemana: text().notNull(), // Ej: "LUN,MIE"
    horaInicio: text().notNull(), // Ej: "08:00"
    horaFin: text().notNull(), // Ej: "10:00"
    tipo: text("TipoClase", { enum: ["TEORICO", "PRACTICO"] }).notNull(),
    instructorId: integer().notNull(),
    cursoId: integer(), // Null si es un horario genérico para prácticas libres
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
      .onDelete("restrict"),
    foreignKey({ columns: [table.cursoId], foreignColumns: [curso.id] })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

export const claseTeorica = sqliteTable(
  "ClaseTeorica",
  {
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    horarioPlantillaId: integer().notNull(),
    aulaId: integer().notNull(),
    fechaExacta: text().notNull(),
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
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    horarioPlantillaId: integer().notNull(),
    vehiculoId: integer().notNull(),
    fechaExacta: text().notNull(),
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
      columns: [table.horarioPlantillaId],
      foreignColumns: [horarioPlantilla.id],
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
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    inscripcionId: integer().notNull(),
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
