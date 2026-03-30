import { relations } from "drizzle-orm/relations";
import {
  recurso,
  menu,
  rolesMenus,
  rol,
  rolesRecursos,
  usuariosRoles,
  usuario,
  persona,
  clasePractica,
  asistenciaGeneral,
  claseTeorica,
  inscripcion,
  sucursal,
  aula,
  vehiculo,
  horarioPlantilla,
  curso,
  gestion,
  instructor,
  estudiante,
  pago,
  tema,
  avanceClase,
  examenProgramado,
  evaluacionEstudiante,
} from "./schema";

export const menuRelations = relations(menu, ({ one, many }) => ({
  recurso: one(recurso, {
    fields: [menu.recursoId],
    references: [recurso.id],
  }),
  menu: one(menu, {
    fields: [menu.padreId],
    references: [menu.id],
    relationName: "menu_padreId_menu_id",
  }),
  menus: many(menu, {
    relationName: "menu_padreId_menu_id",
  }),
  rolesMenus: many(rolesMenus),
}));

export const recursoRelations = relations(recurso, ({ one, many }) => ({
  menu: one(menu, {
    fields: [recurso.id],
    references: [menu.recursoId],
  }),
  rolesRecursos: many(rolesRecursos),
}));

export const rolesMenusRelations = relations(rolesMenus, ({ one }) => ({
  menu: one(menu, {
    fields: [rolesMenus.menuId],
    references: [menu.id],
  }),
  rol: one(rol, {
    fields: [rolesMenus.rolId],
    references: [rol.id],
  }),
}));

export const rolRelations = relations(rol, ({ many }) => ({
  rolesMenus: many(rolesMenus),
  rolesRecursos: many(rolesRecursos),
  usuariosRoles: many(usuariosRoles),
}));

export const rolesRecursosRelations = relations(rolesRecursos, ({ one }) => ({
  recurso: one(recurso, {
    fields: [rolesRecursos.recursoId],
    references: [recurso.id],
  }),
  rol: one(rol, {
    fields: [rolesRecursos.rolId],
    references: [rol.id],
  }),
}));

export const usuariosRolesRelations = relations(usuariosRoles, ({ one }) => ({
  rol: one(rol, {
    fields: [usuariosRoles.rolId],
    references: [rol.id],
  }),
  usuario: one(usuario, {
    fields: [usuariosRoles.usuarioId],
    references: [usuario.id],
  }),
}));

export const usuarioRelations = relations(usuario, ({ one, many }) => ({
  usuariosRoles: many(usuariosRoles),
  persona: one(persona, {
    fields: [usuario.personaId],
    references: [persona.id],
  }),
}));

export const personaRelations = relations(persona, ({ many }) => ({
  usuarios: many(usuario),
  estudiantes: many(estudiante),
  instructors: many(instructor),
}));

export const asistenciaGeneralRelations = relations(
  asistenciaGeneral,
  ({ one }) => ({
    clasePractica: one(clasePractica, {
      fields: [asistenciaGeneral.clasePracticaId],
      references: [clasePractica.id],
    }),
    claseTeorica: one(claseTeorica, {
      fields: [asistenciaGeneral.claseTeoricaId],
      references: [claseTeorica.id],
    }),
    inscripcion: one(inscripcion, {
      fields: [asistenciaGeneral.inscripcionId],
      references: [inscripcion.id],
    }),
  }),
);

export const clasePracticaRelations = relations(
  clasePractica,
  ({ one, many }) => ({
    inscripcion: one(inscripcion, {
      fields: [clasePractica.inscripcionId],
      references: [inscripcion.id],
    }),
    instructor: one(instructor, {
      fields: [clasePractica.instructorId],
      references: [instructor.id],
    }),
    vehiculo: one(vehiculo, {
      fields: [clasePractica.vehiculoId],
      references: [vehiculo.id],
    }),
    asistenciaGenerals: many(asistenciaGeneral),
    avances: many(avanceClase), // NUEVO
  }),
);

export const claseTeoricaRelations = relations(
  claseTeorica,
  ({ one, many }) => ({
    asistenciaGenerals: many(asistenciaGeneral),
    aula: one(aula, {
      fields: [claseTeorica.aulaId],
      references: [aula.id],
    }),
    horarioPlantilla: one(horarioPlantilla, {
      fields: [claseTeorica.horarioPlantillaId],
      references: [horarioPlantilla.id],
    }),
    avances: many(avanceClase), // NUEVO
    curso: one(curso, {
      fields: [claseTeorica.cursoId],
      references: [curso.id],
    }),
  }),
);

export const inscripcionRelations = relations(inscripcion, ({ one, many }) => ({
  asistenciaGenerals: many(asistenciaGeneral),
  gestion: one(gestion, {
    fields: [inscripcion.gestionId],
    references: [gestion.id],
  }),
  curso: one(curso, {
    fields: [inscripcion.cursoId],
    references: [curso.id],
  }),
  estudiante: one(estudiante, {
    fields: [inscripcion.estudianteId],
    references: [estudiante.id],
  }),
  pagos: many(pago),
  horarioElegido: one(horarioPlantilla, {
    fields: [inscripcion.horarioPlantillaId],
    references: [horarioPlantilla.id],
  }),
  clasesPracticas: many(clasePractica),
  evaluaciones: many(evaluacionEstudiante), // NUEVO
}));

export const aulaRelations = relations(aula, ({ one, many }) => ({
  sucursal: one(sucursal, {
    fields: [aula.sucursalId],
    references: [sucursal.id],
  }),
  claseTeoricas: many(claseTeorica),
}));

export const sucursalRelations = relations(sucursal, ({ many }) => ({
  aulas: many(aula),
  cursos: many(curso),
}));

export const vehiculoRelations = relations(vehiculo, ({ many }) => ({
  clasePracticas: many(clasePractica),
}));

export const horarioPlantillaRelations = relations(
  horarioPlantilla,
  ({ one, many }) => ({
    clasePracticas: many(clasePractica),
    claseTeoricas: many(claseTeorica),
    curso: one(curso, {
      fields: [horarioPlantilla.cursoId],
      references: [curso.id],
    }),
    instructor: one(instructor, {
      fields: [horarioPlantilla.instructorId],
      references: [instructor.id],
    }),
    aula: one(aula, {
      fields: [horarioPlantilla.aulaId],
      references: [aula.id],
    }),
  }),
);

export const cursoRelations = relations(curso, ({ one, many }) => ({
  sucursal: one(sucursal, {
    fields: [curso.sucursalId],
    references: [sucursal.id],
  }),
  gestion: one(gestion, {
    fields: [curso.gestionId],
    references: [gestion.id],
  }),
  claseTeoricas: many(claseTeorica),
  horarioPlantillas: many(horarioPlantilla),
  inscripcions: many(inscripcion),
  temas: many(tema), // NUEVO
  examenesProgramados: many(examenProgramado), // NUEVO
}));

export const gestionRelations = relations(gestion, ({ many }) => ({
  cursos: many(curso),
  inscripcions: many(inscripcion),
}));

export const instructorRelations = relations(instructor, ({ one, many }) => ({
  horarioPlantillas: many(horarioPlantilla),
  persona: one(persona, {
    fields: [instructor.personaId],
    references: [persona.id],
  }),
}));

export const estudianteRelations = relations(estudiante, ({ one, many }) => ({
  inscripcions: many(inscripcion),
  persona: one(persona, {
    fields: [estudiante.personaId],
    references: [persona.id],
  }),
}));

export const pagoRelations = relations(pago, ({ one }) => ({
  inscripcion: one(inscripcion, {
    fields: [pago.inscripcionId],
    references: [inscripcion.id],
  }),
}));
export const temaRelations = relations(tema, ({ one, many }) => ({
  curso: one(curso, {
    fields: [tema.cursoId],
    references: [curso.id],
  }),
  avances: many(avanceClase),
}));

export const avanceClaseRelations = relations(avanceClase, ({ one }) => ({
  tema: one(tema, {
    fields: [avanceClase.temaId],
    references: [tema.id],
  }),
  claseTeorica: one(claseTeorica, {
    fields: [avanceClase.claseTeoricaId],
    references: [claseTeorica.id],
  }),
  clasePractica: one(clasePractica, {
    fields: [avanceClase.clasePracticaId],
    references: [clasePractica.id],
  }),
}));

export const examenProgramadoRelations = relations(
  examenProgramado,
  ({ one, many }) => ({
    curso: one(curso, {
      fields: [examenProgramado.cursoId],
      references: [curso.id],
    }),
    evaluacionesEstudiantes: many(evaluacionEstudiante),
  }),
);

export const evaluacionEstudianteRelations = relations(
  evaluacionEstudiante,
  ({ one }) => ({
    examenProgramado: one(examenProgramado, {
      fields: [evaluacionEstudiante.examenProgramadoId],
      references: [examenProgramado.id],
    }),
    inscripcion: one(inscripcion, {
      fields: [evaluacionEstudiante.inscripcionId],
      references: [inscripcion.id],
    }),
  }),
);
