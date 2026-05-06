import { relations } from "drizzle-orm/relations";
import {
  catalogo,
  estado,
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
  permiso,
} from "./schema";

// ==========================================
// RELACIONES DE CATÁLOGO Y ESTADO
// ==========================================

export const catalogoRelations = relations(catalogo, ({ many }) => ({
  // Opcional: Puedes definir las relaciones inversas si necesitas
  // buscar un catálogo e incluir todas las personas asociadas, etc.
  personasSexo: many(persona, { relationName: "persona_sexo" }),
  personasTipoDoc: many(persona, { relationName: "persona_tipo_doc" }),
  pagos: many(pago),
  horariosDia: many(horarioPlantilla, { relationName: "horario_dia" }),
  horariosTipo: many(horarioPlantilla, { relationName: "horario_tipo" }),
  temas: many(tema),
  examenes: many(examenProgramado),
}));

export const estadoRelations = relations(estado, ({ many }) => ({
  // Las relaciones inversas de estado son muchas, aquí puedes mapear las que uses
  usuarios: many(usuario),
  personas: many(persona),
  cursos: many(curso),
  // ... (puedes agregar más si necesitas hacer querys desde `estado` hacia sus hijos)
}));

// ==========================================
// SISTEMA Y SEGURIDAD
// ==========================================

export const personaRelations = relations(persona, ({ one, many }) => ({
  usuarios: many(usuario),
  estudiantes: many(estudiante),
  instructors: many(instructor),
  estado: one(estado, {
    fields: [persona.estado_id],
    references: [estado.id],
  }),
  sexo: one(catalogo, {
    fields: [persona.sexo_id],
    references: [catalogo.id],
    relationName: "persona_sexo",
  }),
  tipoDocumento: one(catalogo, {
    fields: [persona.tipo_documento_id],
    references: [catalogo.id],
    relationName: "persona_tipo_doc",
  }),
}));

export const usuarioRelations = relations(usuario, ({ one, many }) => ({
  usuariosRoles: many(usuariosRoles),
  persona: one(persona, {
    fields: [usuario.persona_id],
    references: [persona.id],
  }),
  estado: one(estado, {
    fields: [usuario.estado_id],
    references: [estado.id],
  }),
}));

export const rolRelations = relations(rol, ({ one, many }) => ({
  rolesMenus: many(rolesMenus),
  rolesRecursos: many(rolesRecursos),
  usuariosRoles: many(usuariosRoles),
  estado: one(estado, {
    fields: [rol.estado_id],
    references: [estado.id],
  }),
}));

export const permisoRelations = relations(permiso, ({ one }) => ({
  estado: one(estado, {
    fields: [permiso.estado_id],
    references: [estado.id],
  }),
}));

export const recursoRelations = relations(recurso, ({ one, many }) => ({
  menu: one(menu, {
    fields: [recurso.id],
    references: [menu.recurso_id],
  }),
  rolesRecursos: many(rolesRecursos),
  estado: one(estado, {
    fields: [recurso.estado_id],
    references: [estado.id],
  }),
}));

export const menuRelations = relations(menu, ({ one, many }) => ({
  recurso: one(recurso, {
    fields: [menu.recurso_id],
    references: [recurso.id],
  }),
  menu: one(menu, {
    fields: [menu.padre_id],
    references: [menu.id],
    relationName: "menu_padre_id_menu_id",
  }),
  menus: many(menu, {
    relationName: "menu_padre_id_menu_id",
  }),
  rolesMenus: many(rolesMenus),
  estado: one(estado, {
    fields: [menu.estado_id],
    references: [estado.id],
  }),
}));

export const rolesRecursosRelations = relations(rolesRecursos, ({ one }) => ({
  recurso: one(recurso, {
    fields: [rolesRecursos.recurso_id],
    references: [recurso.id],
  }),
  rol: one(rol, {
    fields: [rolesRecursos.rol_id],
    references: [rol.id],
  }),
}));

export const rolesMenusRelations = relations(rolesMenus, ({ one }) => ({
  menu: one(menu, {
    fields: [rolesMenus.menu_id],
    references: [menu.id],
  }),
  rol: one(rol, {
    fields: [rolesMenus.rol_id],
    references: [rol.id],
  }),
  estado: one(estado, {
    fields: [rolesMenus.estado_id],
    references: [estado.id],
  }),
}));

export const usuariosRolesRelations = relations(usuariosRoles, ({ one }) => ({
  rol: one(rol, {
    fields: [usuariosRoles.rol_id],
    references: [rol.id],
  }),
  usuario: one(usuario, {
    fields: [usuariosRoles.usuario_id],
    references: [usuario.id],
  }),
  estado: one(estado, {
    fields: [usuariosRoles.estado_id],
    references: [estado.id],
  }),
}));

// ==========================================
// NIVEL 1 Y 2: ENTIDADES BASE
// ==========================================

export const gestionRelations = relations(gestion, ({ one, many }) => ({
  cursos: many(curso),
  inscripcions: many(inscripcion),
  estadoGestion: one(estado, {
    fields: [gestion.estado_gestion_id],
    references: [estado.id],
    relationName: "gestion_estado_gestion",
  }),
  estado: one(estado, {
    fields: [gestion.estado_id],
    references: [estado.id],
    relationName: "gestion_estado",
  }),
}));

export const sucursalRelations = relations(sucursal, ({ one, many }) => ({
  aulas: many(aula),
  cursos: many(curso),
  estado: one(estado, {
    fields: [sucursal.estado_id],
    references: [estado.id],
  }),
}));

export const cursoRelations = relations(curso, ({ one, many }) => ({
  sucursal: one(sucursal, {
    fields: [curso.sucursal_id],
    references: [sucursal.id],
  }),
  gestion: one(gestion, {
    fields: [curso.gestion_id],
    references: [gestion.id],
  }),
  claseTeoricas: many(claseTeorica),
  horarioPlantillas: many(horarioPlantilla),
  inscripcions: many(inscripcion),
  temas: many(tema),
  examenesProgramados: many(examenProgramado),
  estado: one(estado, {
    fields: [curso.estado_id],
    references: [estado.id],
  }),
}));

export const estudianteRelations = relations(estudiante, ({ one, many }) => ({
  inscripcions: many(inscripcion),
  persona: one(persona, {
    fields: [estudiante.persona_id],
    references: [persona.id],
  }),
  estado: one(estado, {
    fields: [estudiante.estado_id],
    references: [estado.id],
  }),
}));

export const instructorRelations = relations(instructor, ({ one, many }) => ({
  horarioPlantillas: many(horarioPlantilla),
  persona: one(persona, {
    fields: [instructor.persona_id],
    references: [persona.id],
  }),
  estado: one(estado, {
    fields: [instructor.estado_id],
    references: [estado.id],
  }),
}));

export const vehiculoRelations = relations(vehiculo, ({ one, many }) => ({
  clasePracticas: many(clasePractica),
  estadoOperativo: one(estado, {
    fields: [vehiculo.estado_operativo_id],
    references: [estado.id],
    relationName: "vehiculo_estado_operativo",
  }),
  estado: one(estado, {
    fields: [vehiculo.estado_id],
    references: [estado.id],
    relationName: "vehiculo_estado",
  }),
}));

export const aulaRelations = relations(aula, ({ one, many }) => ({
  sucursal: one(sucursal, {
    fields: [aula.sucursal_id],
    references: [sucursal.id],
  }),
  claseTeoricas: many(claseTeorica),
  estado: one(estado, {
    fields: [aula.estado_id],
    references: [estado.id],
  }),
}));

// ==========================================
// NIVEL 3: INSCRIPCIÓN Y FINANZAS
// ==========================================

export const inscripcionRelations = relations(inscripcion, ({ one, many }) => ({
  asistenciaGenerals: many(asistenciaGeneral),
  gestion: one(gestion, {
    fields: [inscripcion.gestion_id],
    references: [gestion.id],
  }),
  curso: one(curso, {
    fields: [inscripcion.curso_id],
    references: [curso.id],
  }),
  estudiante: one(estudiante, {
    fields: [inscripcion.estudiante_id],
    references: [estudiante.id],
  }),
  pagos: many(pago),
  horarioElegido: one(horarioPlantilla, {
    fields: [inscripcion.horario_plantilla_id],
    references: [horarioPlantilla.id],
  }),
  clasesPracticas: many(clasePractica),
  evaluaciones: many(evaluacionEstudiante),
  estadoInscripcion: one(estado, {
    fields: [inscripcion.estado_inscripcion_id],
    references: [estado.id],
    relationName: "inscripcion_estado_inscripcion",
  }),
  estado: one(estado, {
    fields: [inscripcion.estado_id],
    references: [estado.id],
    relationName: "inscripcion_estado",
  }),
}));

export const pagoRelations = relations(pago, ({ one }) => ({
  inscripcion: one(inscripcion, {
    fields: [pago.inscripcion_id],
    references: [inscripcion.id],
  }),
  metodoPago: one(catalogo, {
    fields: [pago.metodo_pago_id],
    references: [catalogo.id],
  }),
  estado: one(estado, {
    fields: [pago.estado_id],
    references: [estado.id],
  }),
}));

// ==========================================
// NIVEL 4 Y 5: OPERACIONES, CLASES Y ASISTENCIA
// ==========================================

export const horarioPlantillaRelations = relations(
  horarioPlantilla,
  ({ one, many }) => ({
    clasePracticas: many(clasePractica),
    claseTeoricas: many(claseTeorica),
    curso: one(curso, {
      fields: [horarioPlantilla.curso_id],
      references: [curso.id],
    }),
    instructor: one(instructor, {
      fields: [horarioPlantilla.instructor_id],
      references: [instructor.id],
    }),
    aula: one(aula, {
      fields: [horarioPlantilla.aula_id],
      references: [aula.id],
    }),
    diaSemana: one(catalogo, {
      fields: [horarioPlantilla.dia_semana_id],
      references: [catalogo.id],
      relationName: "horario_dia",
    }),
    tipoClase: one(catalogo, {
      fields: [horarioPlantilla.tipo_clase_id],
      references: [catalogo.id],
      relationName: "horario_tipo",
    }),
    estado: one(estado, {
      fields: [horarioPlantilla.estado_id],
      references: [estado.id],
    }),
  }),
);

export const claseTeoricaRelations = relations(
  claseTeorica,
  ({ one, many }) => ({
    asistenciaGenerals: many(asistenciaGeneral),
    aula: one(aula, {
      fields: [claseTeorica.aula_id],
      references: [aula.id],
    }),
    horarioPlantilla: one(horarioPlantilla, {
      fields: [claseTeorica.horario_plantilla_id],
      references: [horarioPlantilla.id],
    }),
    avances: many(avanceClase),
    curso: one(curso, {
      fields: [claseTeorica.curso_id],
      references: [curso.id],
    }),
    estadoAcademico: one(estado, {
      fields: [claseTeorica.estado_academico_id],
      references: [estado.id],
      relationName: "clase_teorica_estado_acad",
    }),
    estado: one(estado, {
      fields: [claseTeorica.estado_id],
      references: [estado.id],
      relationName: "clase_teorica_estado",
    }),
  }),
);

export const clasePracticaRelations = relations(
  clasePractica,
  ({ one, many }) => ({
    inscripcion: one(inscripcion, {
      fields: [clasePractica.inscripcion_id],
      references: [inscripcion.id],
    }),
    instructor: one(instructor, {
      fields: [clasePractica.instructor_id],
      references: [instructor.id],
    }),
    vehiculo: one(vehiculo, {
      fields: [clasePractica.vehiculo_id],
      references: [vehiculo.id],
    }),
    asistenciaGenerals: many(asistenciaGeneral),
    avances: many(avanceClase),
    estadoAcademico: one(estado, {
      fields: [clasePractica.estado_academico_id],
      references: [estado.id],
      relationName: "clase_practica_estado_acad",
    }),
    estado: one(estado, {
      fields: [clasePractica.estado_id],
      references: [estado.id],
      relationName: "clase_practica_estado",
    }),
  }),
);

export const asistenciaGeneralRelations = relations(
  asistenciaGeneral,
  ({ one }) => ({
    clasePractica: one(clasePractica, {
      fields: [asistenciaGeneral.clase_practica_id],
      references: [clasePractica.id],
    }),
    claseTeorica: one(claseTeorica, {
      fields: [asistenciaGeneral.clase_teorica_id],
      references: [claseTeorica.id],
    }),
    inscripcion: one(inscripcion, {
      fields: [asistenciaGeneral.inscripcion_id],
      references: [inscripcion.id],
    }),
    estadoAcademico: one(estado, {
      fields: [asistenciaGeneral.estado_academico_id],
      references: [estado.id],
    }),
  }),
);

export const temaRelations = relations(tema, ({ one, many }) => ({
  curso: one(curso, {
    fields: [tema.curso_id],
    references: [curso.id],
  }),
  avances: many(avanceClase),
  tipoTema: one(catalogo, {
    fields: [tema.tipo_tema_id],
    references: [catalogo.id],
  }),
  estado: one(estado, {
    fields: [tema.estado_id],
    references: [estado.id],
  }),
}));

export const avanceClaseRelations = relations(avanceClase, ({ one }) => ({
  tema: one(tema, {
    fields: [avanceClase.tema_id],
    references: [tema.id],
  }),
  claseTeorica: one(claseTeorica, {
    fields: [avanceClase.clase_teorica_id],
    references: [claseTeorica.id],
  }),
  clasePractica: one(clasePractica, {
    fields: [avanceClase.clase_practica_id],
    references: [clasePractica.id],
  }),
}));

export const examenProgramadoRelations = relations(
  examenProgramado,
  ({ one, many }) => ({
    curso: one(curso, {
      fields: [examenProgramado.curso_id],
      references: [curso.id],
    }),
    evaluacionesEstudiantes: many(evaluacionEstudiante),
    tipoExamen: one(catalogo, {
      fields: [examenProgramado.tipo_examen_id],
      references: [catalogo.id],
    }),
    estado: one(estado, {
      fields: [examenProgramado.estado_id],
      references: [estado.id],
    }),
  }),
);

export const evaluacionEstudianteRelations = relations(
  evaluacionEstudiante,
  ({ one }) => ({
    examenProgramado: one(examenProgramado, {
      fields: [evaluacionEstudiante.examen_programado_id],
      references: [examenProgramado.id],
    }),
    inscripcion: one(inscripcion, {
      fields: [evaluacionEstudiante.inscripcion_id],
      references: [inscripcion.id],
    }),
    estadoAcademico: one(estado, {
      fields: [evaluacionEstudiante.estado_academico_id],
      references: [estado.id],
    }),
  }),
);
