// Roles/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db/client";
import {
  clasePractica,
  claseTeorica,
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
            gte(claseTeorica.fechaExacta, fInicio),
            lte(claseTeorica.fechaExacta, fFin),
            eq(claseTeorica.estado, "activo"),
          ),
          with: {
            curso: true,
          },
        });

        // 2. Clases Prácticas
        const practicas = await db.query.clasePractica.findMany({
          where: and(
            gte(clasePractica.fechaExacta, fInicio),
            lte(clasePractica.fechaExacta, fFin),
            eq(clasePractica.estado, "activo"),
          ),
          with: {
            inscripcion: { with: { estudiante: { with: { persona: true } } } },
          },
        });

        // 3. Exámenes Programados
        const examenes = await db.query.examenProgramado.findMany({
          where: and(
            gte(examenProgramado.fechaExacta, fInicio),
            lte(examenProgramado.fechaExacta, fFin),
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
    mutationFn: async ({ id, values }: { id?: number; values: any }) => {
      // Si usas un estado global para el loading, descomenta esto
      // setLoading(true);

      const { titulo, fechaExacta, tipoExamen, cursoId } = values;
      const cId = Number(cursoId);

      let examenIdFinal = id;

      if (id) {
        // ==========================================
        // CASO: EDITAR EVENTO EXISTENTE (Preparado para luego)
        // ==========================================
        await db
          .update(examenProgramado)
          .set({
            titulo,
            fechaExacta,
            tipoExamen,
            cursoId: cId,
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
            cursoId: cId,
            titulo,
            tipoExamen,
            fechaExacta,
            estado: "PROGRAMADO",
          })
          .returning({ id: examenProgramado.id });

        examenIdFinal = nuevoExamen.id;

        // 2. LA MAGIA: Buscamos a todos los estudiantes inscritos en este curso
        const estudiantesInscritos = await db.query.inscripcion.findMany({
          where: and(
            eq(inscripcion.cursoId, cId),
            eq(inscripcion.estado, "activo"), // Solo a los que siguen estudiando
          ),
        });

        // 3. Generamos las "planillas de notas vacías" para cada uno
        if (estudiantesInscritos.length > 0) {
          const evaluacionesVacias = estudiantesInscritos.map((ins: any) => ({
            examenProgramadoId: examenIdFinal!,
            inscripcionId: ins.id,
            // La nota se queda como NULL por defecto, lista para ser llenada
            estadoAsistencia: "PRESENTE" as const, // Asumimos que irán, se cambia el día de la clase
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
    mutationFn: async ({
      id,
      estado,
    }: {
      id: number;
      estado: "activo" | "inactivo";
    }) => {
      // Simulamos error para probar: if(id === 1) throw new Error("Error provocado");
      return await db.update(gestion).set({ estado }).where(eq(gestion.id, id));
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
  const handleEdit = (id: number) => {
    show(<LoaderForm id={id} />, {
      title: "Editar gestion",
      formId: "gestion-formulario-edit",
    });
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const isInactive = currentStatus === "inactivo";
    showAlert({
      title: isInactive ? "¿Activar Gestion?" : "¿Deshabilitar Gestion?",
      description: `La Gestion pasará a estar ${isInactive ? "activo" : "inactivo"} en el sistema.`,
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

  return {
    useGetCronogramaMes,
    useGetData,
    upsertMutation,
    handleCreate,
    handleEdit,
    handleToggleStatus,
  };
};
