// Roles/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db/client";
import { menu, permiso, recurso, rolesRecursos } from "@/db/schema";
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
      const [totalResult] = await db.select({ value: count() }).from(recurso);
      const totalItems = totalResult?.value ?? 0;
      const skip = (page - 1) * perPage;
      const data = await db.query.recurso.findMany({
        with: {
          menus: {
            columns: {
              nombre: true,
            },
          },
          rolesRecursos: {
            columns: {
              recursoId: true,
              permisos: true,
            },
            with: {
              rol: {
                columns: {
                  nombre: true,
                },
              },
            },
          },
        },
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
      queryKey: ["recursos-list", page, perPage], // Si esto cambia, se refetchea
      queryFn: () => getData(page, perPage),
    });

  // --- MUTACIONES ---
  const upsertMutation = useMutation({
    mutationFn: async ({ id, values }: { id?: number; values: any }) => {
      setLoading(true);
      const {
        nombre,
        menuId,
        roles,
        permisos,
        ruta,
      }: {
        nombre: string;
        menuId: string;
        roles: String[];
        permisos: String[];
        ruta: string;
      } = values;
      const permisosCount = permisos.reduce((prev, act) => {
        return prev + Number(act);
      }, 0);
      if (id) {
        return await db.transaction(async (tx) => {
          const [u] = await tx
            .update(recurso)
            .set({ nombre })
            .where(eq(recurso.id, id))
            .returning({ recursoId: recurso.id });

          if (!u) throw new Error("Recurso no encontrado");
          await tx
            .update(menu)
            .set({ recursoId: u.recursoId })
            .where(eq(menu.id, u.recursoId));

          await tx
            .delete(rolesRecursos)
            .where(eq(rolesRecursos.recursoId, u.recursoId));

          // Insertamos las nuevas relaciones con el bitmask calculado
          if (roles && roles.length > 0) {
            await tx.insert(rolesRecursos).values(
              roles.map((e) => ({
                recursoId: u.recursoId,
                rolId: Number(e),
                permisos: permisosCount,
              })),
            );
          }
        });
      } else
        return await db.transaction(async (tx) => {
          const [u] = await tx
            .insert(recurso)
            .values({ nombre, ruta })
            .returning({ recursoId: recurso.id });

          if (!u) throw new Error("Recurso no encontrado");
          await tx
            .update(menu)
            .set({ recursoId: u.recursoId })
            .where(eq(menu.id, u.recursoId));

          await tx.insert(rolesRecursos).values(
            roles.map((e) => ({
              recursoId: u.recursoId,
              rolId: Number(e),
              permisos: permisosCount,
            })),
          );
        });
    },
    onSuccess: (_, variables) => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ["recursos-list"] });
      if (variables.id)
        queryClient.invalidateQueries({
          queryKey: ["recurso_data", variables.id],
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
      return await db.update(permiso).set({ estado }).where(eq(permiso.id, id));
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["recursos-list"] }),
  });

  const handleCreate = () => {
    show(<LoaderForm />, {
      title: "Crear nuevo recurso",
      formId: "recurso-formulario-create",
    });
  };
  const handleEdit = (id: number) => {
    show(<LoaderForm id={id} />, {
      title: "Editar recurso",
      formId: "recurso-formulario-edit",
    });
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const isInactive = currentStatus === "inactivo";
    showAlert({
      title: isInactive ? "¿Activar Recurso?" : "¿Deshabilitar Recurso?",
      description: `El Recurso pasará a estar ${isInactive ? "activo" : "inactivo"} en el sistema.`,
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
