// Roles/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db/client";
import { permiso } from "@/db/schema";
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
      const [totalResult] = await db.select({ value: count() }).from(permiso);
      const totalItems = totalResult?.value ?? 0;
      const skip = (page - 1) * perPage;
      const data = await db.query.permiso.findMany({
        offset: skip,
        limit: perPage,
        with: {
          estado: true,
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
      queryKey: ["permisos-list", page, perPage], // Si esto cambia, se refetchea
      queryFn: () => getData(page, perPage),
    });

  // --- MUTACIONES ---
  const upsertMutation = useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: any }) => {
      setLoading(true);
      const estadoActivo = await db.query.estado.findFirst({
        where: (t, { and }) =>
          and(eq(t.nombre, "ACTIVO"), eq(t.categoria, "SISTEMA")),
      });
      if (!estadoActivo) {
        throw new Error("Error estados");
      }
      if (id) {
        return await db.update(permiso).set(values).where(eq(permiso.id, id));
      } else
        return await db
          .insert(permiso)
          .values({ ...values, estado_id: estadoActivo.id });
    },
    onSuccess: (_, variables) => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ["permisos-list"] });
      if (variables.id)
        queryClient.invalidateQueries({
          queryKey: ["permiso_data", variables.id],
        });
      toast.success(variables.id ? "Permiso actualizado" : "Permiso creado");
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
        .update(permiso)
        .set({ estado_id: estadonuevo?.id })
        .where(eq(permiso.id, id));
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["permisos-list"] }),
  });

  const handleCreate = () => {
    console.log("llega al handle");
    show(<LoaderForm />, {
      title: "Crear nuevo permiso",
      formId: "permiso-formulario-create",
    });
  };
  const handleEdit = (id: string) => {
    show(<LoaderForm id={id} />, {
      title: "Editar permiso",
      formId: "permiso-formulario-edit",
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const isInactive = currentStatus.toLowerCase() === "inactivo";
    showAlert({
      title: isInactive ? "¿Activar Permiso?" : "¿Deshabilitar Permiso?",
      description: `El Permiso pasará a estar ${isInactive ? "activo" : "inactivo"} en el sistema.`,
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
    useGetData,
    upsertMutation,
    handleCreate,
    handleEdit,
    handleToggleStatus,
  };
};
