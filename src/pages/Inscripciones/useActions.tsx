// Roles/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db/client";
import {
  clasePractica,
  claseTeorica,
  estudiante,
  horarioPlantilla,
  inscripcion,
  persona,
} from "@/db/schema";
import { and, count, eq } from "drizzle-orm";
import { useModalStore } from "@/store/modalState";
import { useAlertStore } from "@/store/AlertState";
import { toast } from "sonner";
import { LoaderForm } from "./loaderForm";
import { eachDayOfInterval, format, parseISO } from "date-fns";
interface GenerarClasesParams {
  inscripcionId: string;
  cursoId: string;
  horarioPlantillaId: string;
  fechaInicio: string; // Formato YYYY-MM-DD
  fechaFin: string; // Formato YYYY-MM-DD
  diasPracticos: {
    diaSemana: string; // Ej: "MARTES", "JUEVES"
    horaInicio: string;
    horaFin: string;
    instructorId: string;
    vehiculoId: string;
  }[];
}
/* async function generarClasesLote(params: GenerarClasesParams) {
  const {
    inscripcionId,
    cursoId,
    horarioPlantillaId,
    fechaInicio,
    fechaFin,
    diasPracticos,
  } = params;

  // 1. Mapa traductor de JS (0-6) a tu Base de Datos
  const mapaDiasJS: Record<number, string> = {
    0: "DOMINGO",
    1: "LUNES",
    2: "MARTES",
    3: "MIERCOLES",
    4: "JUEVES",
    5: "VIERNES",
    6: "SABADO",
  };

  // 2. Obtener el horario teórico que eligió el alumno
  // NOTA: Si tu horarioPlantilla agrupa varios días, ajusta esta consulta para traerlos todos.
  // Aquí asumo que traes el registro del turno para saber qué días le toca teoría.
  const plantillaElegida = await db.query.horarioPlantilla.findFirst({
    where: eq(horarioPlantilla.id, horarioPlantillaId),
  });

  if (!plantillaElegida) throw new Error("Plantilla teórica no encontrada");

  // 2. Buscamos TODOS los días que corresponden a ese mismo "Turno" (nombre)
  const horariosTeoricos = await db.query.horarioPlantilla.findMany({
    where: and(
      eq(horarioPlantilla.curso_id, cursoId),
      eq(horarioPlantilla.nombre, plantillaElegida.nombre), // Agrupador lógico
    ),
  });

  if (horariosTeoricos.length === 0)
    throw new Error("El curso no tiene horarios teóricos configurados.");
  if (horariosTeoricos.length === 0)
    throw new Error("El curso no tiene horarios teóricos configurados.");

  // Ahora el Set tendrá ["MARTES", "JUEVES"] automáticamente
  const diasTeoriaConfig = new Set(
    horariosTeoricos.map((h) => h.diaSemana.toUpperCase()),
  );

  // 3. Generar el array de todos los días dentro del contrato del alumno
  const diasDelContrato = eachDayOfInterval({
    start: parseISO(fechaInicio),
    end: parseISO(fechaFin),
  });

  // Arrays para almacenar los registros que vamos a insertar al final
  const nuevasPracticas: (typeof clasePractica.$inferInsert)[] = [];
  const teoriasParaVerificar: (typeof claseTeorica.$inferInsert)[] = [];

  // 4. Bucle principal: Evaluamos día por día
  for (const dateObj of diasDelContrato) {
    const fechaExacta = format(dateObj, "yyyy-MM-dd");
    const nombreDiaActual = mapaDiasJS[dateObj.getDay()];

    // --- EVALUAR PRÁCTICA (Individual) ---
    // ¿Este día coincide con algún día práctico configurado?
    const configPractica = diasPracticos.find(
      (dp) => dp.diaSemana === nombreDiaActual,
    );
    if (configPractica) {
      nuevasPracticas.push({
        inscripcionId,
        instructorId: configPractica.instructorId,
        vehiculoId: configPractica.vehiculoId,
        fechaExacta,
        horaInicio: configPractica.horaInicio,
        horaFin: configPractica.horaFin,
        estadoClase: "PROGRAMADA",
      });
    }

    // --- EVALUAR TEORÍA (Grupal) ---
    // ¿Este día toca teoría según su turno?
    if (diasTeoriaConfig.has(nombreDiaActual)) {
      const plantillaDelDia = horariosTeoricos.find(
        (h) => h.diaSemana.toUpperCase() === nombreDiaActual,
      );
      if (plantillaDelDia) {
        teoriasParaVerificar.push({
          cursoId,
          horarioPlantillaId: plantillaDelDia.id,
          aulaId: 1,
          fechaExacta,
          horaInicio: plantillaDelDia.horaInicio,
          horaFin: plantillaDelDia.horaFin,
          estadoClase: "PROGRAMADA",
          estado: "activo",
        });
      }
    }
  }

  // 5. INSERCIÓN MASIVA DE PRÁCTICAS (Fácil, porque son únicas del alumno)
  if (nuevasPracticas.length > 0) {
    await db.insert(clasePractica).values(nuevasPracticas);
  }

  // 6. INSERCIÓN INTELIGENTE DE TEORÍAS (Evitar duplicados)
  for (const teoria of teoriasParaVerificar) {
    // Verificamos si ya existe una clase teórica para ESTE curso en ESTA fecha exacta
    const existeTeoria = await db.query.claseTeorica.findFirst({
      where: and(
        eq(claseTeorica.cursoId, teoria.cursoId),
        eq(claseTeorica.fechaExacta, teoria.fechaExacta),
      ),
    });

    // Solo la insertamos si NO existe.
    // Si ya existe, el alumno simplemente se "acopla" a ella automáticamente en la UI.
    if (!existeTeoria) {
      const { id, ...datosLimpios } = teoria as any;
      await db.insert(claseTeorica).values(datosLimpios);
    }
  }

  return true;
} */
async function generarClasesLote(params: GenerarClasesParams) {
  const {
    inscripcionId,
    cursoId,
    horarioPlantillaId,
    fechaInicio,
    fechaFin,
    diasPracticos, // Ahora asume que trae { diaSemanaId: string, ... }
  } = params;

  // 1. Consultar el catálogo de días en la BD
  // Ajusta el nombre de tu tabla de catálogos según tu esquema en Drizzle
  const catalogosDias = await db.query.catalogo.findMany({
    where: (t) => eq(t.categoria, "DIA_SEMANA"),
  });
  const estadoActivo = await db.query.estado.findFirst({
    where: (t, { and }) =>
      and(eq(t.nombre, "ACTIVO"), eq(t.categoria, "SISTEMA")),
  });
  const estadoAcademicoActivo = await db.query.estado.findFirst({
    where: (t, { and }) =>
      and(eq(t.nombre, "PROGRAMADA"), eq(t.categoria, "ESTADO_ACADEMICO")),
  });
  if (!estadoActivo || !catalogosDias || !estadoAcademicoActivo) {
    throw new Error("Error estados");
  }
  // Mapeo temporal para asociar el string de la BD con el índice de JS
  const indicesDias: Record<string, number> = {
    DOMINGO: 0,
    LUNES: 1,
    MARTES: 2,
    MIERCOLES: 3,
    JUEVES: 4,
    VIERNES: 5,
    SABADO: 6,
  };

  // 1.5 Crear el Mapa traductor de JS (0-6) al UUID de tu Base de Datos
  const mapaDiasUUID: Record<number, string> = {};
  for (const dia of catalogosDias) {
    const indexJS = indicesDias[dia.nombre.toUpperCase()]; // Aseguramos mayúsculas
    if (indexJS !== undefined) {
      mapaDiasUUID[indexJS] = dia.id.toLowerCase(); // dia.id es el UUID
    }
  }
  console.log("=== INICIO GENERACIÓN DE CLASES ===");
  console.log("1. Mapa de Días (JS Index -> UUID BD):", mapaDiasUUID);
  console.log("2. Días Prácticos recibidos por parámetro:", diasPracticos);
  // 2. Obtener la plantilla teórica elegida
  const plantillaElegida = await db.query.horarioPlantilla.findFirst({
    where: eq(horarioPlantilla.id, horarioPlantillaId),
  });

  if (!plantillaElegida) throw new Error("Plantilla teórica no encontrada");

  // Buscamos TODOS los horarios teóricos del mismo turno
  const horariosTeoricos = await db.query.horarioPlantilla.findMany({
    where: and(
      eq(horarioPlantilla.curso_id, cursoId),
      eq(horarioPlantilla.nombre, plantillaElegida.nombre),
    ),
  });

  if (horariosTeoricos.length === 0)
    throw new Error("El curso no tiene horarios teóricos configurados.");

  // Ahora el Set guarda UUIDs en lugar de "MARTES", "JUEVES"
  // Asumiendo que la tabla horarioPlantilla también se actualizó para usar el UUID (diaSemanaId)
  const diasTeoriaConfig = new Set(
    horariosTeoricos.map((h) => h.dia_semana_id),
  );

  // 3. Generar el array de todos los días dentro del contrato
  const diasDelContrato = eachDayOfInterval({
    start: parseISO(fechaInicio),
    end: parseISO(fechaFin),
  });

  const nuevasPracticas = [];
  const teoriasParaVerificar = [];

  // 4. Bucle principal: Evaluamos día por día
  for (const dateObj of diasDelContrato) {
    const fechaExacta = format(dateObj, "yyyy-MM-dd");
    const indexDiaJS = dateObj.getDay();
    const diaActualUUID = mapaDiasUUID[dateObj.getDay()];

    console.log(`\nAnalizando fecha: ${fechaExacta} (Día JS: ${indexDiaJS})`);
    console.log(`UUID esperado para este día: ${diaActualUUID}`);

    // --- EVALUAR PRÁCTICA ---
    // Comparamos UUID con UUID
    const configPractica = diasPracticos.find(
      (dp) => dp.diaSemana.toLowerCase() === diaActualUUID.toLowerCase(),
    );

    if (configPractica) {
      console.log(
        `✅ ¡COINCIDENCIA PRÁCTICA ENCONTRADA! Preparando inserción para ${fechaExacta}.`,
      );
      nuevasPracticas.push({
        inscripcion_id: inscripcionId,
        instructor_id: configPractica.instructorId,
        vehiculo_id: configPractica.vehiculoId,
        fecha_exacta: fechaExacta,
        hora_inicio: configPractica.horaInicio,
        hora_fin: configPractica.horaFin,
        estado_id: estadoActivo.id,
        estado_academico_id: estadoAcademicoActivo.id,
      });
    } else {
      console.log(`❌ No hay práctica configurada para este día.`);
    }

    // --- EVALUAR TEORÍA ---
    // Comprobamos si el UUID de hoy está en el Set de UUIDs teóricos
    if (diasTeoriaConfig.has(diaActualUUID)) {
      const plantillaDelDia = horariosTeoricos.find(
        (h) => h.dia_semana_id === diaActualUUID,
      );
      if (plantillaDelDia) {
        teoriasParaVerificar.push({
          curso_id: cursoId,
          horario_plantilla_id: plantillaDelDia.id,
          aula_id: "asdf5123456",
          fecha_exacta: fechaExacta,
          hora_inicio: plantillaDelDia.hora_inicio,
          hora_fin: plantillaDelDia.hora_fin,
          estado_academico_id: estadoAcademicoActivo.id,
          estado_id: estadoActivo.id,
        });
      }
    }
  }
  console.log(`\n=== RESUMEN DE INSERCIÓN ===`);
  console.log(`Prácticas a insertar: ${nuevasPracticas.length}`);
  // 5. INSERCIÓN MASIVA DE PRÁCTICAS
  if (nuevasPracticas.length > 0) {
    await db.insert(clasePractica).values(nuevasPracticas);
  }

  // 6. INSERCIÓN INTELIGENTE DE TEORÍAS
  for (const teoria of teoriasParaVerificar) {
    const existeTeoria = await db.query.claseTeorica.findFirst({
      where: and(
        eq(claseTeorica.curso_id, teoria.curso_id),
        eq(claseTeorica.fecha_exacta, teoria.fecha_exacta),
      ),
    });

    if (!existeTeoria) {
      const datosLimpios = teoria;
      await db.insert(claseTeorica).values(datosLimpios);
    }
  }

  return true;
}
export const useActions = () => {
  const queryClient = useQueryClient();
  const { setLoading, show, close } = useModalStore();
  const { showAlert } = useAlertStore();
  const getData = async (page: number, perPage: number) => {
    try {
      const [totalResult] = await db
        .select({ value: count() })
        .from(estudiante);
      const totalItems = totalResult?.value ?? 0;
      const skip = (page - 1) * perPage;
      const data = await db.query.estudiante.findMany({
        offset: skip,
        limit: perPage,
        with: {
          inscripcions: true,
          persona: true,
          estado: true,
        },
      });

      return {
        data,
        meta: {
          totalItems,
          pageCount: Math.ceil(totalItems / perPage),
          currentPage: page,
          perPage: perPage,
        },
      };
    } catch (error) {
      console.error("Error obteniendo cursos de SQLite:", error);

      return {
        data: [],
        meta: {
          totalItems: 0,
          pageCount: 0,
          currentPage: page,
          perPage: perPage,
        },
      };
    }
  };
  const getHorariosCurso = async (idCurso: string) => {
    try {
      console.log("idCurso", idCurso);
      const horarios = await db.query.horarioPlantilla.findMany({
        where: eq(horarioPlantilla.curso_id, idCurso),
        with: {
          diaSemana: true,
          tipoClase: true,
        },
      });
      return horarios;
    } catch (error) {
      console.error("Error obteniendo cursos de SQLite:", error);
      return [];
    }
  };
  // --- QUERIES ---
  const useGetData = (page: number, perPage: number) =>
    useQuery({
      queryKey: ["inscripciones-list", page, perPage], // Si esto cambia, se refetchea
      queryFn: () => getData(page, perPage),
    });
  const useGetHorariosCurso = (id: string) =>
    useQuery({
      queryKey: ["horarios-x-curso", id], // Si esto cambia, se refetchea
      queryFn: () => getHorariosCurso(id),
    });

  // --- MUTACIONES ---
  const upsertMutation = useMutation({
    mutationFn: async ({
      id,
      values,
      nroDocumento,
    }: {
      id?: number;
      values: any;
      nroDocumento?: number;
    }) => {
      setLoading(true);

      const {
        cursoId,
        tipo_documento_id,
        gestion_id: gestionId,
        precioPactado: pPactado,
        horarioPlantillaId,
        fechaInicio,
        fechaFin,
        diaSemanaPractico,
        horaPracticaInicio,
        horaPracticaFin,
        instructorId: iId,
        vehiculoId: vId,
        ...dataPersona
      } = values;
      const estadoActivo = await db.query.estado.findFirst({
        where: (t, { and }) =>
          and(eq(t.nombre, "ACTIVO"), eq(t.categoria, "SISTEMA")),
      });
      const estadoInscripcion = await db.query.estado.findFirst({
        where: (t, { and }) =>
          and(eq(t.nombre, "PENDIENTE"), eq(t.categoria, "ESTADO_INSCRIPCION")),
      });
      if (!estadoActivo || !estadoInscripcion) {
        throw new Error("Error estados");
      }
      console.log("valores de llegada: ", values);
      /* throw new Error("Error simulado"); */
      const precioPactado = Number(pPactado);

      let currentEstudianteId: string | null = null;
      if (nroDocumento) {
        const per = await db.query.persona.findFirst({
          where: eq(persona.nro_documento, Number(nroDocumento)),
        });

        if (per) {
          const est = await db.query.estudiante.findFirst({
            where: eq(estudiante.persona_id, per.id),
          });
          if (est) {
            currentEstudianteId = est.id;
          } else {
            const [nuevoEst] = await db
              .insert(estudiante)
              .values({ persona_id: per.id, estado_id: estadoActivo.id })
              .returning({ id: estudiante.id });
            currentEstudianteId = nuevoEst.id;
          }
        }
      } else {
        const [nuevaPer] = await db
          .insert(persona)
          .values({ ...dataPersona })
          .returning({ id: persona.id });
        if (nuevaPer) {
          const [nuevoEst] = await db
            .insert(estudiante)
            .values({ persona_id: nuevaPer.id, estado_id: estadoActivo.id })
            .returning({ id: estudiante.id });
          currentEstudianteId = nuevoEst.id;
        }
      }
      if (!currentEstudianteId)
        throw new Error("No se pudo determinar el estudiante.");

      const inscripcionActiva = await db.query.inscripcion.findFirst({
        where: and(
          eq(inscripcion.estudiante_id, currentEstudianteId),
          eq(inscripcion.curso_id, cursoId),
          eq(inscripcion.estado_id, estadoActivo.id),
        ),
      });

      if (inscripcionActiva)
        throw new Error("El estudiante ya tiene una inscripción activa.");

      // 4. FASE: Crear Inscripción
      const [nuevaInscripcion] = await db
        .insert(inscripcion)
        .values({
          curso_id: cursoId,
          estudiante_id: currentEstudianteId,
          precio_pactado: precioPactado,
          gestion_id: gestionId,
          horario_plantilla_id: horarioPlantillaId,
          estado_inscripcion_id: estadoInscripcion.id,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          estado_id: estadoActivo.id,
        })
        .returning({ id: inscripcion.id });

      // 5. FASE: Generar Clases en Lote
      // Formateamos el "día único" de práctica como el array que espera la función
      await generarClasesLote({
        inscripcionId: nuevaInscripcion.id,
        cursoId,
        horarioPlantillaId,
        fechaInicio,
        fechaFin,
        diasPracticos: [
          {
            diaSemana: diaSemanaPractico.toUpperCase(),
            horaInicio: horaPracticaInicio,
            horaFin: horaPracticaFin,
            instructorId: iId,
            vehiculoId: vId,
          },
        ],
      });

      return nuevaInscripcion;
    },
    onSuccess: (_, variables) => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ["inscripciones-list"] });
      if (variables.id)
        queryClient.invalidateQueries({
          queryKey: ["estudiante_data", variables.id],
        });
      toast.success(
        variables.id ? "Inscripcion actualizada" : "Inscripcion creado",
      );
      close();
    },
    onError: (e) => {
      console.log(e);
      setLoading(false);
      toast.error("Error al procesar la solicitud");
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: string }) => {
      const estadonuevo = await db.query.estado.findFirst({
        where: (t, { eq, and }) =>
          and(
            eq(t.nombre, estado === "ACTIVO" ? "INACTIVO" : "ACTIVO"),
            eq(t.categoria, "SISTEMA"),
          ),
      });
      return await db
        .update(inscripcion)
        .set({ estado_id: estadonuevo?.id })
        .where(eq(inscripcion.id, id));
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["estudiantes-list"] }),
  });

  const handleCreate = () => {
    show(<LoaderForm />, {
      title: "Crear nueva inscripcion",
      formId: "inscripcion-formulario-create",
    });
  };
  const handleEdit = (id: string) => {
    show(<LoaderForm />, {
      title: "Editar inscripcion",
      formId: "inscripcion-formulario-edit",
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const isInactive = currentStatus.toLowerCase() === "inactivo";
    showAlert({
      title: isInactive ? "¿Activar Curso?" : "¿Deshabilitar Curso?",
      description: `El Curso pasará a estar ${isInactive ? "activo" : "inactivo"} en el sistema.`,
      variant: isInactive ? "success" : "error",
      actionText: "Confirmar",
      onAction: async () => {
        // Al ser una mutación de TanStack Query, lanzamos la promesa
        await statusMutation.mutateAsync({
          id,
          estado: currentStatus,
        });
        toast.success("Estado actualizado");
      },
    });
  };
  const searchMutation = useMutation({
    mutationFn: async (documento: string) => {
      // Aquí llamas a tu función de Drizzle
      const resultado = await db.query.persona.findFirst({
        where: eq(persona.nro_documento, Number(documento)),
      });
      return resultado;
    },
    onSuccess: (data) => {
      if (data) {
        toast.success("Persona encontrada", {
          position: "top-center",
        });
        // Aquí podrías cargar los datos en el formulario
        return data;
      } else {
        toast.error("La Persona no existe", {
          position: "top-center",
        });
        // Opcional: abrir modal de registro
      }
    },
    onError: () => {
      toast.error("Error en la conexión con la base de datos");
    },
  });

  return {
    useGetData,
    useGetHorariosCurso,
    upsertMutation,
    handleCreate,
    handleEdit,
    handleToggleStatus,
    searchMutation,
  };
};
