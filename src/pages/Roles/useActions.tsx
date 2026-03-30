// Roles/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db/client";
import { rol, rolesMenus } from "@/db/schema";
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
      const [totalResult] = await db.select({ value: count() }).from(rol);
      const totalItems = totalResult?.value ?? 0;

      const data = await db
        .select() // Esto hace un "SELECT * FROM Rol" sin el alias "rol"
        .from(rol)
        .limit(perPage)
        .offset((page - 1) * perPage);
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
      queryKey: ["roles-list", page, perPage], // Si esto cambia, se refetchea
      queryFn: () => getData(page, perPage),
    });

  // --- MUTACIONES ---
  const upsertMutation = useMutation({
    mutationFn: async ({ id, values }: { id?: number; values: any }) => {
      const { menus, ...dataRol } = values;
      setLoading(true);
      const menuIds = Array.isArray(menus)
        ? menus.map(Number)
        : menus
          ? [Number(menus)]
          : [];

      let rolIdFinal = id;

      if (id) {
        // --- CASO A: ACTUALIZAR ROL ---
        // 1. Actualizamos nombre y descripción
        await db.update(rol).set(dataRol).where(eq(rol.id, id));

        // 2. Borramos los menús anteriores (Wipe)
        // Asegúrate de importar la tabla intermedia (ej. rolMenu)
        await db.delete(rolesMenus).where(eq(rolesMenus.rolId, id));
      } else {
        // --- CASO B: CREAR NUEVO ROL ---
        // 1. Insertamos y pedimos que nos devuelva el ID generado
        const [nuevoRol] = await db
          .insert(rol)
          .values(dataRol)
          .returning({ id: rol.id });

        rolIdFinal = nuevoRol.id;
      }

      // --- FASE FINAL: INSERTAR LOS MENÚS (Para ambos casos) ---
      // Si el usuario eligió menús, los insertamos en bloque (Bulk Insert)
      if (menuIds.length > 0 && rolIdFinal) {
        const menusAInsertar = menuIds.map((mId) => ({
          rolId: rolIdFinal,
          menuId: mId,
        }));

        await db.insert(rolesMenus).values(menusAInsertar);
      }

      return rolIdFinal;
    },
    onSuccess: (_, variables) => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ["roles-list"] });
      if (variables.id)
        queryClient.invalidateQueries({ queryKey: ["rol_data", variables.id] });
      toast.success(variables.id ? "Rol actualizado" : "Rol creado");
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
      return await db.update(rol).set({ estado }).where(eq(rol.id, id));
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["roles-list"] }),
  });

  const handleCreate = () => {
    show(<LoaderForm />, {
      title: "Crear nuevo Rol",
      formId: "rol-formulario-create",
    });
  };
  const handleEdit = (id: number) => {
    show(<LoaderForm id={id} />, {
      title: "Editar Rol",
      formId: "rol-formulario-edit",
    });
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const isInactive = currentStatus === "inactivo";
    showAlert({
      title: isInactive ? "¿Activar Rol?" : "¿Deshabilitar Rol?",
      description: `El rol pasará a estar ${isInactive ? "activo" : "inactivo"} en el sistema.`,
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
