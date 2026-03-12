// Roles/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db/client";
import { menu } from "@/db/schema";
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
      const [totalResult] = await db.select({ value: count() }).from(menu);
      const totalItems = totalResult?.value ?? 0;
      const skip = (page - 1) * perPage;
      const data = await db.query.menu.findMany({
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
      queryKey: ["menus-list", page, perPage], // Si esto cambia, se refetchea
      queryFn: () => getData(page, perPage),
    });

  // --- MUTACIONES ---
  const upsertMutation = useMutation({
    mutationFn: async ({ id, values }: { id?: number; values: any }) => {
      setLoading(true);
      if (id) {
        return await db
          .update(menu)
          .set({ ...values, orden: Number(values["orden"]) })
          .where(eq(menu.id, id));
      } else return await db.insert(menu).values(values);
    },
    onSuccess: async (_, variables) => {
      setLoading(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["menus-list"] }),
        queryClient.invalidateQueries({ queryKey: ["menus-aside"] }),
      ]);
      if (variables.id)
        queryClient.invalidateQueries({
          queryKey: ["menu_data", variables.id],
        });
      toast.success(variables.id ? "Menu actualizado" : "Menu creado");
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
      return await db.update(menu).set({ estado }).where(eq(menu.id, id));
    },
    onSuccess: () => (
      queryClient.invalidateQueries({ queryKey: ["menus-list"] }),
      queryClient.invalidateQueries({ queryKey: ["menus-aside"] })
    ),
  });

  const handleCreate = () => {
    show(<LoaderForm />, {
      title: "Crear nuevo menu",
      formId: "menu-formulario-create",
    });
  };
  const handleEdit = (id: number) => {
    show(<LoaderForm id={id} />, {
      title: "Editar menu",
      formId: "menu-formulario-edit",
    });
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const isInactive = currentStatus === "inactivo";
    showAlert({
      title: isInactive ? "¿Activar Menu?" : "¿Deshabilitar Menu?",
      description: `El Menu pasará a estar ${isInactive ? "activo" : "inactivo"} en el sistema.`,
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
