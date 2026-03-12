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
              codigoInterno: true,
            },
            with: {
              persona: true,
            },
          },
        },
        where: eq(inscripcion.estudianteId, estudianteId),
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
  // --- QUERIES ---
  const useGetData = (page: number, perPage: number, estudianteId: number) =>
    useQuery({
      queryKey: ["inscripcion_estudiante", page, perPage, estudianteId], // Si esto cambia, se refetchea
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
      queryClient.invalidateQueries({ queryKey: ["estudiantes-list"] });
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
    upsertMutation,
    handleCreate,
    handleEdit,
    handleToggleStatus,
    searchMutation,
  };
};
