// Roles/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db/client";
import { estudiante, inscripcion, persona } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { useModalStore } from "@/store/modalState";
import { useAlertStore } from "@/store/AlertState";
import { toast } from "sonner";
import { LoaderForm } from "./loaderForm";

export const useActions = () => {
  const queryClient = useQueryClient();
  const { setLoading, show, close } = useModalStore();
  const { showAlert } = useAlertStore();
  const getData = async (
    page: number,
    perPage: number,
    estudianteId: string,
  ) => {
    try {
      const [totalResult] = await db
        .select({ value: count() })
        .from(estudiante);
      const totalItems = totalResult?.value ?? 0;
      const skip = (page - 1) * perPage;
      const data = await db.query.inscripcion.findMany({
        offset: skip,
        limit: perPage,
        with: {
          evaluaciones: {
            with: {
              examenProgramado: true,
            },
          },

          estadoInscripcion: true,
          estado: true,
          asistenciaGenerals: {
            with: {
              clasePractica: {
                with: {
                  avances: true,
                },
              },
              claseTeorica: {
                with: {
                  avances: true,
                },
              },
            },
          },
          pagos: true,
          curso: {
            columns: {
              nombre_curso: true,
              horas_teoricas_req: true,
              horas_practicas_req: true,
            },
            with: {
              temas: true,
              sucursal: true,
              gestion: true,
            },
          },
          estudiante: {
            columns: {
              id: true,
              codigo_interno: true,
            },
            with: {
              persona: true,
            },
          },
        },
        where: eq(inscripcion.estudiante_id, estudianteId),
      });
      const estadoActivo = await db.query.estado.findFirst({
        where: (t, { and }) =>
          and(eq(t.nombre, "ACTIVO"), eq(t.categoria, "SISTEMA")),
      });
      const estadoAcademico = await db.query.estado.findFirst({
        where: (t, { and }) =>
          and(eq(t.nombre, "PRESENTE"), eq(t.categoria, "ESTADO_ACADEMICO")),
      });
      if (!estadoActivo || !estadoAcademico) {
        throw new Error("Error estados");
      }
      const inscripcionesConStats = data.map((ins) => {
        // 1. Cálculos de Pagos
        const precioPactado = Number(ins.precio_pactado) || 0;
        const montoPagado = ins.pagos.reduce(
          (acc, pago) => acc + Number(pago.monto_pagado),
          0,
        );

        // 2. Metas del Curso (TOTAL DE HORAS REQUERIDAS)
        const totalHorasPracticas = Number(ins.curso.horas_practicas_req) || 0;
        const totalHorasTeoricas = Number(ins.curso.horas_teoricas_req) || 0;

        // 3. Función auxiliar para calcular duración en horas ("10:30" - "08:00" = 2.5)
        const calcularHoras = (horaInicio?: string, horaFin?: string) => {
          if (!horaInicio || !horaFin) return 0;
          const [hInicio, mInicio] = horaInicio.split(":").map(Number);
          const [hFin, mFin] = horaFin.split(":").map(Number);
          const tiempoInicio = hInicio + mInicio / 60;
          const tiempoFin = hFin + mFin / 60;
          return tiempoFin - tiempoInicio > 0 ? tiempoFin - tiempoInicio : 0;
        };

        // 4. Cálculos de Asistencias (Sumamos HORAS, no clases)
        let horasPracticasAsistidas = 0;
        let horasTeoricasAsistidas = 0;

        ins.asistenciaGenerals.forEach((asistencia) => {
          if (asistencia.estado_academico_id === estadoAcademico.id) {
            if (asistencia.clasePractica) {
              horasPracticasAsistidas += calcularHoras(
                asistencia.clasePractica.hora_inicio,
                asistencia.clasePractica.hora_fin,
              );
            }
            if (asistencia.claseTeorica) {
              horasTeoricasAsistidas += calcularHoras(
                asistencia.claseTeorica.hora_inicio,
                asistencia.claseTeorica.hora_fin,
              );
            }
          }
        });

        // 5. Progreso General (Basado estrictamente en horas)
        const metaTotalHoras = totalHorasPracticas + totalHorasTeoricas;
        const avanceTotalHoras =
          horasPracticasAsistidas + horasTeoricasAsistidas;
        let progresoGeneral =
          metaTotalHoras > 0
            ? Math.round((avanceTotalHoras / metaTotalHoras) * 100)
            : 0;

        if (progresoGeneral > 100) progresoGeneral = 100;

        return {
          ...ins,
          stats: {
            precioPactado,
            montoPagado,
            totalPracticas: totalHorasPracticas,
            totalTeoricas: totalHorasTeoricas,
            // Redondeamos a 1 decimal (ej. 1.5 horas) para la UI
            practicasAsistidas: Math.round(horasPracticasAsistidas * 10) / 10,
            teoricasAsistidas: Math.round(horasTeoricasAsistidas * 10) / 10,
            progresoGeneral,
          },
        };
      });

      return {
        inscripcion: inscripcionesConStats,
      };
    } catch (error) {
      console.error("Error obteniendo cursos de SQLite:", error);

      return {
        inscripcion: {},
      };
    }
  };
  // --- QUERIES ---
  const useGetData = (page: number, perPage: number, estudianteId: string) =>
    useQuery({
      queryKey: ["inscripciones_x_estudiante", page, perPage, estudianteId], // Si esto cambia, se refetchea
      queryFn: () => getData(page, perPage, estudianteId),
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
      nroDocumento?: string;
    }) => {
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
      const { cursoId, gestionId, precioPactado, ...dataPersona } = values;
      if (nroDocumento) {
        const per = await db.query.persona.findFirst({
          where: eq(persona.nro_documento, Number(nroDocumento)),
        });
        if (per) {
          const [u] = await db
            .insert(estudiante)
            .values({ persona_id: per.id, estado_id: estadoActivo.id })
            .returning({ estudianteId: estudiante.id });

          if (u) {
            await db.insert(inscripcion).values({
              horario_plantilla_id: "1",
              curso_id: cursoId,
              estudiante_id: u.estudianteId,
              precio_pactado: precioPactado,
              gestion_id: gestionId,
              estado_id: estadoActivo.id,
              estado_inscripcion_id: estadoInscripcion.id,
            });
          }
        }
      } else {
        const [p] = await db
          .insert(persona)
          .values({ ...dataPersona })
          .returning({ personaId: persona.id });
        if (p) {
          const [u] = await db
            .insert(estudiante)
            .values({ persona_id: p.personaId, estado_id: estadoActivo.id })
            .returning({ estudianteId: estudiante.id });

          if (u) {
            await db.insert(inscripcion).values({
              horario_plantilla_id: "1",
              curso_id: cursoId,
              estudiante_id: u.estudianteId,
              precio_pactado: precioPactado,
              gestion_id: gestionId,
              estado_id: estadoActivo.id,
              estado_inscripcion_id: estadoInscripcion.id,
            });
          }
        }
      }
    },
    onSuccess: (_, variables) => {
      setLoading(false);
      queryClient.invalidateQueries({
        queryKey: ["inscripciones_x_estudiante"],
      });
      if (variables.id)
        queryClient.invalidateQueries({
          queryKey: ["estudiante_data", variables.id],
        });
      toast.success(
        variables.id ? "Inscripcion actualizada" : "Inscripcion creado",
      );
      close();
    },
    onError: () => {
      setLoading(false);
      toast.error("Error al procesar la solicitud");
    },
  });
  const finalizarInscripcionMutation = useMutation({
    mutationFn: async ({
      id,
      estadoVida,
      estadoAcademico,
    }: {
      id: string;
      estadoVida: "FINALIZADO" | "ABANDONADA";
      estadoAcademico: "APROBADO" | "REPROBADO";
    }) => {
      const estadoacademico = await db.query.estado.findFirst({
        where: (t, { eq, and }) =>
          and(
            eq(t.nombre, estadoAcademico.toUpperCase()),
            eq(t.categoria, "SISTEMA"),
          ),
      });
      const estadonuevo = await db.query.estado.findFirst({
        where: (t, { eq, and }) =>
          and(
            eq(t.nombre, estadoVida.toUpperCase()),
            eq(t.categoria, "SISTEMA"),
          ),
      });
      return await db
        .update(inscripcion)
        .set({
          estado_id: estadonuevo?.id,
          estado_inscripcion_id: estadoacademico?.id,
          updated_at: new Date().toISOString(),
        })
        .where(eq(inscripcion.id, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["inscripciones_x_estudiante"],
      });
      toast.success("Estado de la inscripción actualizado correctamente.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al actualizar la inscripción.");
    },
  });
  const statusMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: string }) => {
      const estadonuevo = await db.query.estado.findFirst({
        where: (t, { eq, and }) =>
          and(eq(t.nombre, estado), eq(t.categoria, "SISTEMA")),
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
  const handleAbandonarIns = (id: string) => {
    showAlert({
      title: "Abandonar inscripcion?",
      description: "Esta seguro de marcar como abandono",
      variant: "warning",
      actionText: "Abandonar",
      onAction: async () => {
        // Al ser una mutación de TanStack Query, lanzamos la promesa
        await finalizarInscripcionMutation.mutateAsync({
          id,
          estadoVida: "ABANDONADA",
          estadoAcademico: "REPROBADO",
        });
        toast.success("Estado actualizado");
      },
    });
  };
  const handleFinalizarIns = (
    id: string,
    mensaje: string,
    estadoAcademico: "APROBADO" | "REPROBADO",
  ) => {
    showAlert({
      title: "Finalizar inscripcion?",
      description: mensaje,
      variant: "info",
      actionText: "Finalizar",
      onAction: async () => {
        // Al ser una mutación de TanStack Query, lanzamos la promesa
        await finalizarInscripcionMutation.mutateAsync({
          id,
          estadoVida: "FINALIZADO",
          estadoAcademico: estadoAcademico,
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
    upsertMutation,
    handleCreate,
    handleEdit,
    handleToggleStatus,
    searchMutation,
    finalizarInscripcionMutation,
    handleAbandonarIns,
    handleFinalizarIns,
  };
};
