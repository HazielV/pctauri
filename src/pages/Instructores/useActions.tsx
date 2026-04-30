// Roles/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db/client";
import { instructor, persona } from "@/db/schema";
import { count, eq } from "drizzle-orm";
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
      const [totalResult] = await db
        .select({ value: count() })
        .from(instructor);
      const totalItems = totalResult?.value ?? 0;
      const skip = (page - 1) * perPage;
      const data = await db.query.instructor.findMany({
        offset: skip,
        limit: perPage,
        with: {
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
      console.error("Error obteniendo datos de SQLite:", error);

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
      queryKey: ["instructor-list", page, perPage], // Si esto cambia, se refetchea
      queryFn: () => getData(page, perPage),
    });

  // --- MUTACIONES ---
  const upsertMutation = useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: any }) => {
      setLoading(true);
      const { nroLicencia, ...dataPersona } = values;

      try {
        if (id) {
          // --- LÓGICA DE UPDATE ---

          // 1. Actualizar Instructor (obtenemos el personaId para el siguiente paso)
          const [u] = await db
            .update(instructor)
            .set({ nroLicencia })
            .where(eq(instructor.id, id))
            .returning({ personaId: instructor.personaId });

          if (!u) throw new Error("Instructor no encontrado");

          // 2. Actualizar Persona asociada
          return await db
            .update(persona)
            .set(dataPersona)
            .where(eq(persona.id, u.personaId));
        } else {
          // --- LÓGICA DE INSERT ---

          // 1. Insertar primero la Persona
          const [u] = await db
            .insert(persona)
            .values(dataPersona)
            .returning({ id: persona.id });

          if (!u) throw new Error("No se pudo completar la acción");

          // 2. Insertar el Instructor usando el ID de la persona recién creada
          return await db.insert(instructor).values({
            nroLicencia,
            personaId: u.id,
          });
        }
      } catch (error) {
        console.error("Error en mutationFn:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (_, variables) => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ["instructor-list"] });
      if (variables.id)
        queryClient.invalidateQueries({
          queryKey: ["instructor_data", variables.id],
        });
      toast.success(
        variables.id ? "Instructor actualizado" : "Instructor creado",
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
      id: string;
      estado: "activo" | "inactivo";
    }) => {
      // Simulamos error para probar: if(id === 1) throw new Error("Error provocado");
      return await db
        .update(instructor)
        .set({ estado })
        .where(eq(instructor.id, id));
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["instructor-list"] }),
  });

  const handleCreate = () => {
    show(<LoaderForm />, {
      title: "Crear nuevo instructor",
      formId: "instructor-formulario-create",
    });
  };
  const handleEdit = (id: number) => {
    show(<LoaderForm id={id} />, {
      title: "Editar instructor",
      formId: "instructor-formulario-edit",
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const isInactive = currentStatus === "inactivo";
    showAlert({
      title: isInactive ? "¿Activar Instructor?" : "¿Deshabilitar Instructor?",
      description: `El Instructor pasará a estar ${isInactive ? "activo" : "inactivo"} en el sistema.`,
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
    useGetData,
    upsertMutation,
    handleCreate,
    handleEdit,
    handleToggleStatus,
  };
};
