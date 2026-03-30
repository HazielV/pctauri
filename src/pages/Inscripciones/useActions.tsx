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
  inscripcionId: number;
  cursoId: number;
  horarioPlantillaId: number;
  fechaInicio: string; // Formato YYYY-MM-DD
  fechaFin: string; // Formato YYYY-MM-DD
  // La configuración de prácticas que viene del formulario
  diasPracticos: {
    diaSemana: string; // Ej: "MARTES", "JUEVES"
    horaInicio: string;
    horaFin: string;
    instructorId: number;
    vehiculoId: number;
  }[];
}
async function generarClasesLote(params: GenerarClasesParams) {
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
      eq(horarioPlantilla.cursoId, cursoId),
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
  const getHorariosCurso = async (idCurso: number) => {
    try {
      const horarios = await db.query.horarioPlantilla.findMany({
        where: eq(horarioPlantilla.cursoId, idCurso),
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
  const useGetHorariosCurso = (id: number) =>
    useQuery({
      queryKey: ["horarios-x-curso", id], // Si esto cambia, se refetchea
      queryFn: () => getHorariosCurso(id),
      enabled: id > 0,
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
        cursoId: cId,
        gestionId: gId,
        precioPactado: pPactado,
        horarioPlantillaId: hPId,
        fechaInicio,
        fechaFin,
        diaSemanaPractico,
        horaPracticaInicio,
        horaPracticaFin,
        instructorId: iId,
        vehiculoId: vId,
        ...dataPersona
      } = values;

      const cursoId = Number(cId);
      const gestionId = Number(gId);
      const horarioPlantillaId = Number(hPId);
      const precioPactado = Number(pPactado);

      let currentEstudianteId: number | null = null;
      if (nroDocumento) {
        const per = await db.query.persona.findFirst({
          where: eq(persona.nroDocumento, Number(nroDocumento)),
        });

        if (per) {
          const est = await db.query.estudiante.findFirst({
            where: eq(estudiante.personaId, per.id),
          });
          if (est) {
            currentEstudianteId = est.id;
          } else {
            const [nuevoEst] = await db
              .insert(estudiante)
              .values({ personaId: per.id })
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
            .values({ personaId: nuevaPer.id })
            .returning({ id: estudiante.id });
          currentEstudianteId = nuevoEst.id;
        }
      }
      if (!currentEstudianteId)
        throw new Error("No se pudo determinar el estudiante.");

      const inscripcionActiva = await db.query.inscripcion.findFirst({
        where: and(
          eq(inscripcion.estudianteId, currentEstudianteId),
          eq(inscripcion.cursoId, cursoId),
          eq(inscripcion.estado, "activo"),
        ),
      });

      if (inscripcionActiva)
        throw new Error("El estudiante ya tiene una inscripción activa.");

      // 4. FASE: Crear Inscripción
      const [nuevaInscripcion] = await db
        .insert(inscripcion)
        .values({
          cursoId,
          estudianteId: currentEstudianteId,
          precioPactado,
          gestionId,
          horarioPlantillaId,
          fechaInicio,
          fechaFin,
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
            instructorId: Number(iId),
            vehiculoId: Number(vId),
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
    mutationFn: async ({
      id,
      estado,
    }: {
      id: number;
      estado: "activo" | "inactivo";
    }) => {
      // Simulamos error para probar: if(id === 1) throw new Error("Error provocado");
      return await db
        .update(inscripcion)
        .set({ estado })
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
  const handleEdit = (id: number) => {
    show(<LoaderForm />, {
      title: "Editar inscripcion",
      formId: "inscripcion-formulario-edit",
    });
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const isInactive = currentStatus === "inactivo";
    showAlert({
      title: isInactive ? "¿Activar Curso?" : "¿Deshabilitar Curso?",
      description: `El Curso pasará a estar ${isInactive ? "activo" : "inactivo"} en el sistema.`,
      variant: isInactive ? "success" : "error",
      actionText: "Confirmar",
      onAction: async () => {
        // Al ser una mutación de TanStack Query, lanzamos la promesa
        await statusMutation.mutateAsync({
          id,
          estado: isInactive ? "activo" : "inactivo",
        });
        toast.success("Estado actualizado");
      },
    });
  };
  const searchMutation = useMutation({
    mutationFn: async (documento: string) => {
      // Aquí llamas a tu función de Drizzle
      const resultado = await db.query.persona.findFirst({
        where: eq(persona.nroDocumento, Number(documento)),
      });
      return resultado;
    },
    onSuccess: (data) => {
      if (data) {
        toast.success("Usuario encontrado", {
          position: "top-center",
        });
        // Aquí podrías cargar los datos en el formulario
        return data;
      } else {
        toast.error("El usuario no existe", {
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
