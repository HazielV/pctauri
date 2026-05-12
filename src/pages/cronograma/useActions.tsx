// Roles/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db/client";
import {
  clasePractica,
  claseTeorica,
  estado,
  evaluacionEstudiante,
  examenProgramado,
  gestion,
  inscripcion,
} from "@/db/schema";
import { and, count, eq, gte, lte } from "drizzle-orm";
import { useModalStore } from "@/store/modalState";
import { useAlertStore } from "@/store/AlertState";
import { toast } from "sonner";
import { LoaderForm } from "./loaderForm";

export const useActions = () => {
  const queryClient = useQueryClient();
  const { setLoading, show, close } = useModalStore();
  const { showAlert } = useAlertStore();
  const getData = async (page: number, perPage: number) => {
    try {
      const [totalResult] = await db.select({ value: count() }).from(gestion);
      const totalItems = totalResult?.value ?? 0;
      const skip = (page - 1) * perPage;
      const data = await db.query.gestion.findMany({
        offset: skip,
        limit: perPage,
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
      console.error("Error obteniendo menus de SQLite:", error);

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
  // --- QUERIES ---
  const useGetData = (page: number, perPage: number) =>
    useQuery({
      queryKey: ["gestion-list", page, perPage], // Si esto cambia, se refetchea
      queryFn: () => getData(page, perPage),
    });
  const useGetCronogramaMes = ({
    fInicio,
    fFin,
  }: {
    fInicio: string;
    fFin: string;
  }) => {
    return useQuery({
      queryKey: ["cronograma-mes", fInicio, fFin],
      queryFn: async () => {
        // 1. Clases Teóricas
        const teoricas = await db.query.claseTeorica.findMany({
          where: and(
            gte(claseTeorica.fecha_exacta, fInicio),
            lte(claseTeorica.fecha_exacta, fFin),
            eq(
              claseTeorica.estado_id,
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
          with: {
            curso: true,
          },
        });

        // 2. Clases Prácticas
        const practicas = await db.query.clasePractica.findMany({
          where: and(
            gte(clasePractica.fecha_exacta, fInicio),
            lte(clasePractica.fecha_exacta, fFin),
            eq(
              clasePractica.estado_id,
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
          with: {
            inscripcion: { with: { estudiante: { with: { persona: true } } } },
          },
        });

        // 3. Exámenes Programados
        const examenes = await db.query.examenProgramado.findMany({
          where: and(
            gte(examenProgramado.fecha_exacta, fInicio),
            lte(examenProgramado.fecha_exacta, fFin),
            // No traemos los cancelados
          ),
          with: { curso: true },
        });

        return { teoricas, practicas, examenes };
      },
      enabled: !!fInicio && !!fFin,
    });
  };

  // --- MUTACIONES ---
  const upsertMutation = useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: any }) => {
      // Si usas un estado global para el loading, descomenta esto
      // setLoading(true);
      const estadoActivo = await db.query.estado.findFirst({
        where: (t, { and }) =>
          and(eq(t.nombre, "ACTIVO"), eq(t.categoria, "SISTEMA")),
      });
      const estadoProgramado = await db.query.estado.findFirst({
        where: (t, { and }) =>
          and(eq(t.nombre, "PROGRAMADO"), eq(t.categoria, "SISTEMA")),
      });
      const estadoPresente = await db.query.estado.findFirst({
        where: (t, { and }) =>
          and(eq(t.nombre, "PRESENTE"), eq(t.categoria, "ESTADO_ACADEMICO")),
      });
      if (!estadoActivo || !estadoProgramado || !estadoPresente) {
        throw new Error("Error estados");
      }
      const { titulo, fechaExacta, tipoExamen, cursoId } = values;
      const cId = cursoId;

      let examenIdFinal = id;

      if (id) {
        // ==========================================
        // CASO: EDITAR EVENTO EXISTENTE (Preparado para luego)
        // ==========================================
        await db
          .update(examenProgramado)
          .set({
            titulo,
            fecha_exacta: fechaExacta,
            tipo_examen_id: tipoExamen,
            curso_id: cId,
          })
          .where(eq(examenProgramado.id, id));
      } else {
        // ==========================================
        // CASO: CREAR NUEVO EVENTO / EXAMEN
        // ==========================================

        // 1. Insertamos el evento en el calendario
        const [nuevoExamen] = await db
          .insert(examenProgramado)
          .values({
            curso_id: cId,
            titulo,
            tipo_examen_id: tipoExamen,
            fecha_exacta: fechaExacta,
            estado_id: estadoProgramado.id,
          })
          .returning({ id: examenProgramado.id });

        examenIdFinal = nuevoExamen.id;

        // 2. LA MAGIA: Buscamos a todos los estudiantes inscritos en este curso
        const estudiantesInscritos = await db.query.inscripcion.findMany({
          where: and(
            eq(inscripcion.curso_id, cId),
            eq(inscripcion.estado_id, estadoActivo.id), // Solo a los que siguen estudiando
          ),
        });

        // 3. Generamos las "planillas de notas vacías" para cada uno
        if (estudiantesInscritos.length > 0) {
          const evaluacionesVacias = estudiantesInscritos.map((ins: any) => ({
            examen_programado_id: examenIdFinal!,
            inscripcion_id: ins.id,
            // La nota se queda como NULL por defecto, lista para ser llenada
            estado_academico_id: estadoPresente.id,
            estado_id: estadoActivo.id, // Asumimos que irán, se cambia el día de la clase
          }));

          // Insertamos masivamente todas las planillas
          await db.insert(evaluacionEstudiante).values(evaluacionesVacias);
        }
      }

      return examenIdFinal;
    },

    onSuccess: (_, variables) => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ["cronograma-mes"] });
      toast.success(variables.id ? "Evento actualizado" : "Evento creado");
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
        .update(gestion)
        .set({ estado_id: estadonuevo?.id })
        .where(eq(gestion.id, id));
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["gestion-list"] }),
  });

  const handleCreate = ({ fecha }: { fecha?: string }) => {
    show(<LoaderForm fecha={fecha} />, {
      title: "Nuevo evento gestion",
      formId: "gestion-formulario-create",
    });
  };
  const handleEdit = (id: string) => {
    show(<LoaderForm id={id} />, {
      title: "Editar gestion",
      formId: "gestion-formulario-edit",
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const isInactive = currentStatus.toLowerCase() === "inactivo";
    showAlert({
      title: isInactive ? "¿Activar Gestion?" : "¿Deshabilitar Gestion?",
      description: `La Gestion pasará a estar ${isInactive ? "activo" : "inactivo"} en el sistema.`,
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

  return {
    useGetCronogramaMes,
    useGetData,
    upsertMutation,
    handleCreate,
    handleEdit,
    handleToggleStatus,
  };
};
