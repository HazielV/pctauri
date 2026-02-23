import {
  integer,
  text,
  sqliteTable,
  uniqueIndex,
  foreignKey,
  primaryKey,
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
