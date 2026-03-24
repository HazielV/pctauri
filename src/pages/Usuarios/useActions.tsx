// Roles/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db/client";
import { persona, usuario } from "@/db/schema";
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
      const [totalResult] = await db.select({ value: count() }).from(usuario);
      const totalItems = totalResult?.value ?? 0;
      const skip = (page - 1) * perPage;
      const data = await db.query.usuario.findMany({
        offset: skip,
        limit: perPage,
        with: {
          persona: {
            columns: {
              nombres: true,
              primerApellido: true,
              segundoApellido: true,
              nroDocumento: true,
            },
          },
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
      console.error("Error obteniendo roles de SQLite:", error);

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
      queryKey: ["usuarios-list", page, perPage], // Si esto cambia, se refetchea
      queryFn: () => getData(page, perPage),
    });

  // --- MUTACIONES ---
  const upsertMutation = useMutation({
    mutationFn: async ({ id, values }: { id?: number; values: any }) => {
      setLoading(true);
      const { username, password, ...dataPersona } = values;
      if (id) {
        return await db.transaction(async (tx) => {
          const [u] = await tx
            .update(usuario)
            .set({ username, password })
            .where(eq(usuario.id, id))
            .returning({ personaId: usuario.personaId });

          if (!u) throw new Error("Usuario no encontrado");
          return await tx
            .update(persona)
            .set(dataPersona)
            .where(eq(persona.id, u.personaId));
        });
      } else
        return await db.transaction(async (tx) => {
          const [u] = await tx
            .insert(persona)
            .values(dataPersona)
            .returning({ id: persona.id });

          if (!u) throw new Error("No se pudo completar la accion");
          return await tx
            .insert(usuario)
            .values({ username, password, personaId: u.id });
        });
    },
    onSuccess: (_, variables) => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ["usuarios-list"] });
      if (variables.id)
        queryClient.invalidateQueries({
          queryKey: ["usuario_data", variables.id],
        });
      toast.success(variables.id ? "Usuario actualizado" : "Usuario creado");
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
      return await db.update(usuario).set({ estado }).where(eq(usuario.id, id));
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["usuarios-list"] }),
  });

  const handleCreate = () => {
    show(<LoaderForm />, {
      title: "Crear nuevo usuario",
      formId: "usuario-formulario-create",
    });
  };
  const handleEdit = (id: number) => {
    show(<LoaderForm id={id} />, {
      title: "Crear nuevo usuario",
      formId: "usuario-formulario-edit",
    });
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const isInactive = currentStatus === "inactivo";
    showAlert({
      title: isInactive ? "¿Activar Usuario?" : "¿Deshabilitar Usuario?",
      description: `El usuario pasará a estar ${isInactive ? "activo" : "inactivo"} en el sistema.`,
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
