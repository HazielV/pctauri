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
    estudianteId: number,
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
          asistenciaGenerals: {
            with: {
              clasePractica: true,
              claseTeorica: true,
            },
          },
          pagos: true,
          curso: {
            columns: {
              nombreCurso: true,
              horasPracticasReq: true,
              horasTeoricasReq: true,
            },
            with: {
              sucursal: true,
              gestion: true,
            },
          },
          estudiante: {
            columns: {
              id: true,
              codigoInterno: true,
            },
            with: {
              persona: true,
            },
          },
        },
        where: eq(inscripcion.estudianteId, estudianteId),
      });
      const inscripcionesConStats = data.map((ins) => {
        // 1. Cálculos de Pagos
        const precioPactado = Number(ins.precioPactado) || 0;
        const montoPagado = ins.pagos.reduce(
          (acc, pago) => acc + Number(pago.montoPagado),
          0,
        );

        // 2. Metas del Curso (TOTAL DE HORAS REQUERIDAS)
        const totalHorasPracticas = Number(ins.curso.horasPracticasReq) || 0;
        const totalHorasTeoricas = Number(ins.curso.horasTeoricasReq) || 0;

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
          if (asistencia.estadoAsistencia === "PRESENTE") {
            if (asistencia.clasePractica) {
              horasPracticasAsistidas += calcularHoras(
                asistencia.clasePractica.horaInicio,
                asistencia.clasePractica.horaFin,
              );
            }
            if (asistencia.claseTeorica) {
              horasTeoricasAsistidas += calcularHoras(
                asistencia.claseTeorica.horaInicio,
                asistencia.claseTeorica.horaFin,
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
  const useGetData = (page: number, perPage: number, estudianteId: number) =>
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
      nroDocumento?: number;
    }) => {
      setLoading(true);

      const { cursoId, gestionId, precioPactado, ...dataPersona } = values;
      if (nroDocumento) {
        const per = await db.query.persona.findFirst({
          where: eq(persona.nroDocumento, Number(nroDocumento)),
        });
        if (per) {
          const [u] = await db
            .insert(estudiante)
            .values({ personaId: per.id })
            .returning({ estudianteId: estudiante.id });

          if (u) {
            await db.insert(inscripcion).values({
              horarioPlantillaId: 1,
              cursoId: cursoId,
              estudianteId: u.estudianteId,
              precioPactado: precioPactado,
              gestionId: gestionId,
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
            .values({ personaId: p.personaId })
            .returning({ estudianteId: estudiante.id });

          if (u) {
            await db.insert(inscripcion).values({
              horarioPlantillaId: 1,
              cursoId: cursoId,
              estudianteId: u.estudianteId,
              precioPactado: precioPactado,
              gestionId: gestionId,
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
      id: number;
      estadoVida: "finalizada" | "abandonada";
      estadoAcademico: "aprobado" | "reprobado";
    }) => {
      // Si tienes una columna "aprobado" (boolean) en tu tabla inscripcion,
      // podrías recibirla aquí y actualizarla también.
      return await db
        .update(inscripcion)
        .set({
          estado: estadoVida,
          estadoInscripcion: estadoAcademico,

          updatedAt: new Date().toISOString(),
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
  const handleAbandonarIns = (id: number) => {
    showAlert({
      title: "Abandonar inscripcion?",
      description: "Esta seguro de marcar como abandono",
      variant: "warning",
      actionText: "Abandonar",
      onAction: async () => {
        // Al ser una mutación de TanStack Query, lanzamos la promesa
        await finalizarInscripcionMutation.mutateAsync({
          id,
          estadoVida: "abandonada",
          estadoAcademico: "reprobado",
        });
        toast.success("Estado actualizado");
      },
    });
  };
  const handleFinalizarIns = (
    id: number,
    mensaje: string,
    estadoAcademico: "aprobado" | "reprobado",
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
          estadoVida: "finalizada",
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
