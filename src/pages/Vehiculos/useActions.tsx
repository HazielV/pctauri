// Roles/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db/client";
import { vehiculo } from "@/db/schema";
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
      const [totalResult] = await db.select({ value: count() }).from(vehiculo);
      const totalItems = totalResult?.value ?? 0;
      const skip = (page - 1) * perPage;
      const data = await db.query.vehiculo.findMany({
        offset: skip,
        limit: perPage,
        with: {
          estado: true,
          estadoOperativo: true,
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
      queryKey: ["vehiculo-list", page, perPage], // Si esto cambia, se refetchea
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
      const estadoOperativo = await db.query.estado.findFirst({
        where: (t, { and }) =>
          and(eq(t.nombre, "DISPONIBLE"), eq(t.categoria, "ESTADO_OPERATIVO")),
      });
      if (!estadoActivo || !estadoOperativo) {
        throw new Error("Error estados");
      }
      if (id) {
        await db
          .update(vehiculo)
          .set({ ...values })
          .where(eq(vehiculo.id, id));
      } else
        return await db.insert(vehiculo).values({
          ...values,
          estado_id: estadoActivo.id,
          estado_operativo_id: estadoOperativo.id,
        });
    },
    onSuccess: (_, variables) => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ["vehiculo-list"] });
      if (variables.id)
        queryClient.invalidateQueries({
          queryKey: ["vehiculo_data", variables.id],
        });
      toast.success(variables.id ? "Vehiculo actualizado" : "Vehiculo creado");
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
        .update(vehiculo)
        .set({ estado_id: estadonuevo?.id })
        .where(eq(vehiculo.id, id));
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["vehiculo-list"] }),
  });

  const handleCreate = () => {
    show(<LoaderForm />, {
      title: "Crear nueva vehiculo",
      formId: "vehiculo-formulario-create",
    });
  };
  const handleEdit = (id: string) => {
    show(<LoaderForm id={id} />, {
      title: "Editar vehiculo",
      formId: "vehiculo-formulario-edit",
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const isInactive = currentStatus.toLocaleLowerCase() === "inactivo";
    showAlert({
      title: isInactive ? "¿Activar Vehiculo?" : "¿Deshabilitar Vehiculo?",
      description: `El Vehiculo pasará a estar ${isInactive ? "activo" : "inactivo"} en el sistema.`,
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
