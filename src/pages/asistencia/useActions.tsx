// Roles/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db/client";
import {
  asistenciaGeneral,
  avanceClase,
  catalogo,
  clasePractica,
  claseTeorica,
  estado,
  evaluacionEstudiante,
  examenProgramado,
  inscripcion,
  pago,
  persona,
  tema,
} from "@/db/schema";
import { and, between, eq, inArray } from "drizzle-orm";
import { useModalStore } from "@/store/modalState";
import { useAlertStore } from "@/store/AlertState";
import { toast } from "sonner";
import { LoaderFormAsistencia } from "./loaderAsistencia";
import FormClase from "./formClase";
import { format } from "date-fns";
import { LoaderClase } from "./loaderClase";

export const useActions = () => {
  const queryClient = useQueryClient();

  const { setLoading, show, close } = useModalStore();
  const { showAlert } = useAlertStore();
  async function getAsistenciaMatrizGlobal(
    fInicio: string,
    fFin: string,
    page: number,
    perPage: number,
  ) {
    const inscripciones = await db.query.inscripcion.findMany({
      where: eq(
        inscripcion.estado_id,
        db
          .select({ id: estado.id })
          .from(estado)
          .where(
            and(eq(estado.nombre, "ACTIVO"), eq(estado.categoria, "SISTEMA")),
          ),
      ),
      limit: perPage,
      offset: (page - 1) * perPage,
      with: {
        estudiante: {
          with: { persona: true },
        },
        curso: {
          with: {
            horarioPlantillas: {
              with: {
                diaSemana: true,
              },
            },
          }, // vital para saber sus días teóricos
        },
      },
    });

    // Si no hay inscripciones en esta página, devolvemos vacío rápido
    if (inscripciones.length === 0) {
      return {
        inscripciones: [],
        clasesTeoricas: [],
        clasesPracticas: [],
        asistencias: [],
      };
    }

    // Extraemos los IDs para filtrar las siguientes consultas
    const inscripcionesIds = inscripciones.map((i) => i.id);
    // Usamos un Set para no tener IDs duplicados si varios alumnos son del mismo curso
    const cursosIds = [...new Set(inscripciones.map((i) => i.curso_id))];

    // 2. OBTENEMOS EL CALENDARIO REAL DE ESA SEMANA
    // Traemos TODAS las clases (tengan asistencia marcada o no)

    const clasesTeoricas = await db.query.claseTeorica.findMany({
      where: and(
        inArray(claseTeorica.curso_id, cursosIds), // <--- ESTO ES LO QUE FALTABA
        between(claseTeorica.fecha_exacta, fInicio, fFin),
      ),
      with: { horarioPlantilla: true },
    });

    const clasesPracticas = await db.query.clasePractica.findMany({
      where: and(
        inArray(clasePractica.inscripcion_id, inscripcionesIds), // Solo de los alumnos de esta página
        between(clasePractica.fecha_exacta, fInicio, fFin),
      ),
    });

    // 3. OBTENEMOS LAS ASISTENCIAS YA MARCADAS
    const asistencias = await db.query.asistenciaGeneral.findMany({
      where: inArray(asistenciaGeneral.inscripcion_id, inscripcionesIds),
      with: {
        estadoAcademico: true,
      },
    });

    // Devolvemos todo el paquete para que el Frontend arme la matriz
    return {
      inscripciones,
      clasesTeoricas,
      clasesPracticas,
      asistencias,
    };
  }

  // --- QUERIES ---
  const useGetData = ({
    fInicio,
    fFin,
    page,
    perPage,
  }: {
    fInicio: string;
    fFin: string;
    page: number;
    perPage: number;
  }) =>
    useQuery({
      queryKey: [
        "inscripcion-matriz-asistencia-mes",
        fInicio,
        fFin,
        page,
        perPage,
      ],
      queryFn: () => getAsistenciaMatrizGlobal(fInicio, fFin, page, perPage),
    });

  // --- MUTACIONES ---
  const upsertMutation = useMutation({
    mutationFn: async ({ values, fecha }: { values: any; fecha: Date }) => {
      setLoading(true);
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
      const { vehiculoId, instructorId, inscripcionId, horaIni, horaFin } =
        values;
      const fechaFormateada = format(fecha, "yyyy-MM-dd");

      // 1. Crear Clase Práctica Manual
      return await db.insert(clasePractica).values({
        inscripcion_id: inscripcionId,
        instructor_id: instructorId,
        vehiculo_id: vehiculoId,
        fecha_exacta: fechaFormateada,
        hora_inicio: horaIni, // O podrías añadir inputs de hora al form
        hora_fin: horaFin,
        estado_id: estadoActivo.id,
        estado_academico_id: estadoInscripcion.id,
      });
    },
    onSuccess: () => {
      setLoading(false);
      queryClient.invalidateQueries({
        queryKey: ["inscripcion-matriz-asistencia-mes"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inscripciones_x_estudiante"],
      });
      toast.success("Nueva clase practica");
      close();
    },
    onError: (e) => {
      console.log(e);
      setLoading(false);
      toast.error("Error al procesar la solicitud");
    },
  });
  // useActions.tsx
  const useModalContextData = ({
    inscripcionId,
    cursoId,
    fecha,
    tipoClase,
    claseId,
  }: any) => {
    return useQuery({
      queryKey: ["clase-contexto", claseId, inscripcionId],
      queryFn: async () => {
        // 1. FINANZAS: Calcular deuda
        const inscripcionData = await db.query.inscripcion.findFirst({
          where: eq(inscripcion.id, inscripcionId),
          with: { pagos: true },
        });
        const pagado =
          inscripcionData?.pagos.reduce((acc, p) => acc + p.monto_pagado, 0) ||
          0;
        const deuda = (inscripcionData?.precio_pactado || 0) - pagado;

        // 2. TEMAS: Traer temas del curso según el tipo (T o P)
        const temasCurso = await db.query.tema.findMany({
          where: and(
            eq(tema.curso_id, cursoId),
            eq(
              tema.tipo_tema_id,
              db
                .select({ id: catalogo.id })
                .from(catalogo)
                .where(
                  and(
                    eq(
                      catalogo.nombre,
                      tipoClase === "T" ? "TEORICO" : "PRACTICO",
                    ),
                    eq(catalogo.categoria, "TIPO_ACADEMICO"),
                  ),
                ),
            ),
            eq(
              tema.estado_id,
              db
                .select({ id: estado.id })
                .from(estado)
                .where(
                  and(
                    eq(estado.nombre, "ACTIVO"),
                    eq(estado.categoria, "SISTEMA"),
                  ),
                ),
            ),
          ),
        });

        // 3. AVANCES: ¿Qué temas se avanzaron hoy? ¿Y cuáles en el pasado?
        const avancesEstudiante = await db.query.avanceClase.findMany({
          where:
            tipoClase === "T"
              ? eq(avanceClase.clase_teorica_id, claseId) // Si es teoría, todos avanzan juntos
              : eq(avanceClase.clase_practica_id, claseId), // Si es práctica, es su avance individual
        });
        const idsAvanzadosHoy = avancesEstudiante.map((a) => a.tema_id);

        // (Opcional pero recomendado: buscar avances de clases anteriores para marcarlos como "Ya pasados")
        // 4. EXAMEN: ¿Hay examen programado para este día?
        const examenHoy = await db.query.examenProgramado.findFirst({
          where: and(
            eq(examenProgramado.curso_id, cursoId),
            eq(examenProgramado.fecha_exacta, fecha),
            eq(
              examenProgramado.tipo_examen_id,
              db
                .select({ id: catalogo.id })
                .from(catalogo)
                .where(
                  and(
                    eq(
                      catalogo.nombre,
                      tipoClase === "T" ? "TEORICO" : "PRACTICO",
                    ),
                    eq(catalogo.categoria, "TIPO_ACADEMICO"),
                  ),
                ),
            ),
          ),
          with: {
            evaluacionesEstudiantes: {
              where: eq(evaluacionEstudiante.inscripcion_id, inscripcionId),
            },
          },
        });

        return {
          finanzas: { total: inscripcionData?.precio_pactado, pagado, deuda },
          temas: temasCurso,
          avanzadosHoy: idsAvanzadosHoy,
          examen: examenHoy,
        };
      },
      enabled: !!claseId && !!inscripcionId, // Solo se ejecuta si el modal está abierto
    });
  };
  const upsertAsistenciaMutation = useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: any }) => {
      setLoading(true);

      const {
        inscripcionId,
        estadoAsistencia,
        tipoClase,
        claseId,
        montoPago,
        metodoPago,

        temasAvanzados,
        examenProgramadoId,
        notaExamen,
      } = values;
      console.log({
        inscripcionId,
        estadoAsistencia,
        tipoClase,
        claseId,
        montoPago,
        metodoPago,

        temasAvanzados,
        examenProgramadoId,
        notaExamen,
      });

      const estadoActivo = await db.query.estado.findFirst({
        where: (t, { and }) =>
          and(eq(t.nombre, "ACTIVO"), eq(t.categoria, "SISTEMA")),
      });
      const estadoInscripcion = await db.query.estado.findFirst({
        where: (t, { and }) =>
          and(eq(t.nombre, "PENDIENTE"), eq(t.categoria, "ESTADO_INSCRIPCION")),
      });
      const estadoAsistenciaEncontrado = await db.query.estado.findFirst({
        where: (t, { and }) =>
          and(eq(t.id, estadoAsistencia), eq(t.categoria, "ESTADO_ACADEMICO")),
      });
      if (!estadoActivo || !estadoInscripcion || !estadoAsistenciaEncontrado) {
        throw new Error("Error estados");
      }
      const monto = Number(montoPago);
      const iId = inscripcionId;
      const cId = claseId;

      let asistenciaIdFinal = id;

      // ==========================================
      // 1. GESTIÓN DE ASISTENCIA
      // ==========================================
      if (id) {
        await db
          .update(asistenciaGeneral)
          .set({
            estado_academico_id: estadoAsistenciaEncontrado.id,
            updated_at: new Date().toISOString(),
          })
          .where(eq(asistenciaGeneral.id, id));
      } else {
        const payload: any = {
          inscripcion_id: iId,
          estado_academico_id: estadoAsistenciaEncontrado.id,
          estado_id: estadoActivo.id,
        };

        if (tipoClase === "P") {
          payload.clase_practica_id = cId;
        } else {
          payload.clase_teorica_id = cId;
        }

        const [nuevaAsis] = await db
          .insert(asistenciaGeneral)
          .values(payload)
          .returning({ id: asistenciaGeneral.id });

        asistenciaIdFinal = nuevaAsis.id;
      }

      // ==========================================
      // 2. GESTIÓN DE PAGO (Independiente)
      // ==========================================
      if (monto > 0) {
        try {
          await db.insert(pago).values({
            inscripcion_id: iId,
            monto_pagado: monto,
            metodo_pago_id: metodoPago,
            estado_id: estadoActivo.id,
            // estado: "activo", // Descomenta si tu esquema requiere estado en pagos
          });
        } catch (error) {
          console.error("Error al registrar el pago:", error);
        }
      }

      // ==========================================
      // 3. GESTIÓN DE AVANCE (TEMAS DE LA CLASE)
      // ==========================================
      if (temasAvanzados && Array.isArray(temasAvanzados)) {
        // a) Borramos los avances anteriores para esta clase específica
        //    (Es la forma más fácil de hacer un "sync" exacto con los checkboxes)
        if (tipoClase === "P") {
          await db
            .delete(avanceClase)
            .where(eq(avanceClase.clase_practica_id, cId));
        } else {
          await db
            .delete(avanceClase)
            .where(eq(avanceClase.clase_teorica_id, cId));
        }

        // b) Insertamos los checkboxes que vinieron marcados
        if (temasAvanzados.length > 0) {
          const nuevosAvances = temasAvanzados.map((temaId) => ({
            tema_id: temaId,
            clase_practica_id: tipoClase === "P" ? cId : null,
            clase_teorica_id: tipoClase === "T" ? cId : null,
            estado_id: estadoActivo.id,
          }));

          await db.insert(avanceClase).values(nuevosAvances);
        }
      }

      // ==========================================
      // 4. GESTIÓN DE EVALUACIÓN (NOTAS)
      // ==========================================
      // Validamos que haya un examen y que se haya escrito una nota (incluso un 0 cuenta)
      if (examenProgramadoId && notaExamen !== undefined && notaExamen !== "") {
        const notaFinal = Number(notaExamen);

        // Buscamos si el alumno ya tenía una nota en este examen específico
        const evaluacionExistente =
          await db.query.evaluacionEstudiante.findFirst({
            where: and(
              eq(evaluacionEstudiante.examen_programado_id, examenProgramadoId),
              eq(evaluacionEstudiante.inscripcion_id, iId),
            ),
          });

        if (evaluacionExistente) {
          // Actualizamos la nota si ya existía
          await db
            .update(evaluacionEstudiante)
            .set({
              nota: notaFinal,
              fecha_calificacion: new Date().toISOString(),
            })
            .where(eq(evaluacionEstudiante.id, evaluacionExistente.id));
        } else {
          // Creamos la nota por primera vez

          await db.insert(evaluacionEstudiante).values({
            examen_programado_id: examenProgramadoId,
            inscripcion_id: iId,
            nota: notaFinal,
            estado_academico_id: estadoAsistenciaEncontrado.id,
            estado_id: estadoActivo.id,
          });
        }
      }

      return asistenciaIdFinal;
    },

    onSuccess: (_, variables) => {
      setLoading(false);
      queryClient.invalidateQueries({
        queryKey: ["inscripcion-matriz-asistencia-mes"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inscripciones_x_estudiante"],
      });
      if (variables.id)
        queryClient.invalidateQueries({
          queryKey: ["inscripcion-matriz-asistencia-mes", variables.id],
        });
      toast.success(
        variables.id ? "Asistencia actualizada" : "Asistencia creada",
      );
      close();
    },
    onError: () => {
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

  const handleAsignarClase = ({ inscripcionId, fechaActual, tipo }: any) => {
    show(
      <LoaderFormAsistencia
        inscripcionId={inscripcionId}
        fechaActual={fechaActual}
        tipo={tipo}
      />,
      {
        title: "Asignar Clase",
        formId: "inscripcion-asignar-clase",
        size: "md",
      },
    );
  };
  const handleLlenarAsistencia = ({
    cursoId,
    fecha,
    claseId,
    tipoClase,
    inscripcionId,
    data,
  }: any) => {
    show(
      <LoaderClase
        cursoId={cursoId}
        data={data}
        inscripcionId={inscripcionId}
        fecha={fecha}
        claseId={claseId}
        tipoClase={tipoClase}
      />,
      {
        title: "Llenar asistencia",
        formId: "llenar-asistencia-clase",
      },
    );
  };
  {
    /* <FormClase
        cursoId={cursoId}
        data={data}
        inscripcionId={inscripcionId}
        fecha={fecha}
        claseId={claseId}
        tipoClase={tipoClase}
        catalogos={catalogos}
      />, */
  }
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
    useModalContextData,
    handleAsignarClase,
    upsertMutation,
    handleToggleStatus,
    searchMutation,
    handleLlenarAsistencia,
    upsertAsistenciaMutation,
  };
};
