import { relations } from "drizzle-orm/relations";
import {
  persona,
  usuario,
  menu,
  recurso,
  rol,
  rolesRecursos,
  rolesMenus,
  usuariosRoles,
} from "./schema";

export const usuarioRelations = relations(usuario, ({ one, many }) => ({
  persona: one(persona, {
    fields: [usuario.personaId],
    references: [persona.id],
  }),
  usuariosRoles: many(usuariosRoles),
}));

export const personaRelations = relations(persona, ({ many }) => ({
  usuarios: many(usuario),
}));

export const menuRelations = relations(menu, ({ one, many }) => ({
  menu: one(menu, {
    fields: [menu.padreId],
    references: [menu.id],
    relationName: "menu_padreId_menu_id",
  }),
  menus: many(menu, {
    relationName: "menu_padreId_menu_id",
  }),
  recurso: one(recurso, {
    fields: [menu.recursoId],
    references: [recurso.id],
  }),
  rolesMenus: many(rolesMenus),
}));

export const recursoRelations = relations(recurso, ({ many }) => ({
  menus: many(menu),
  rolesRecursos: many(rolesRecursos),
}));

export const rolesRecursosRelations = relations(rolesRecursos, ({ one }) => ({
  rol: one(rol, {
    fields: [rolesRecursos.rolId],
    references: [rol.id],
  }),
  recurso: one(recurso, {
    fields: [rolesRecursos.recursoId],
    references: [recurso.id],
  }),
}));

export const rolRelations = relations(rol, ({ many }) => ({
  rolesRecursos: many(rolesRecursos),
  rolesMenus: many(rolesMenus),
  usuariosRoles: many(usuariosRoles),
}));

export const rolesMenusRelations = relations(rolesMenus, ({ one }) => ({
  rol: one(rol, {
    fields: [rolesMenus.rolId],
    references: [rol.id],
  }),
  menu: one(menu, {
    fields: [rolesMenus.menuId],
    references: [menu.id],
  }),
}));

export const usuariosRolesRelations = relations(usuariosRoles, ({ one }) => ({
  usuario: one(usuario, {
    fields: [usuariosRoles.usuarioId],
    references: [usuario.id],
  }),
  rol: one(rol, {
    fields: [usuariosRoles.rolId],
    references: [rol.id],
  }),
}));
