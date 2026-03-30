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
  const getPermisosActivos = async () => {
    return await db.query.permiso.findMany({
      columns: {
        id: true,
        descripcion: true,
        valor: true,
        nombre: true,
      },
      where: (permisos, { eq }) => eq(permisos.estado, "activo"),
    });
  };
  const getData = async (page: number, perPage: number) => {
    try {
      const [totalResult] = await db.select({ value: count() }).from(recurso);
      const totalItems = totalResult?.value ?? 0;
      const skip = (page - 1) * perPage;
      const data = await db.query.recurso.findMany({
        with: {
          menu: true,
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
  const useGetPermisos = () =>
    useQuery({
      queryKey: ["permisos-activos"],
      queryFn: () => getPermisosActivos(),
    });
  // --- MUTACIONES ---
  const upsertMutation = useMutation({
    mutationFn: async ({ id, values }: { id?: number; values: any }) => {
      setLoading(true);

      const { nombre, menuId, ruta, permisosRol } = values;

      if (id) {
        // --- UPDATE CASE ---

        // 1. Update the resource
        const [u] = await db
          .update(recurso)
          .set({ nombre, ruta })
          .where(eq(recurso.id, id))
          .returning({ recursoId: recurso.id });

        if (!u) throw new Error("Recurso no encontrado");

        // 2. Link to Menu
        if (menuId) {
          await db
            .update(menu)
            .set({ recursoId: u.recursoId })
            .where(eq(menu.id, Number(menuId)));
        }

        // 3. Clear previous relations (Wipe)
        await db
          .delete(rolesRecursos)
          .where(eq(rolesRecursos.recursoId, u.recursoId));

        // 4. Insert new relations (Replace) with individual bitmask calculation
        if (permisosRol && permisosRol.length > 0) {
          const relacionesAInsertar = permisosRol.map((pr: any) => {
            const permisosMask = pr.permisos.reduce(
              (sum: number, p: string) => sum + Number(p),
              0,
            );

            return {
              recursoId: u.recursoId,
              rolId: pr.rolid,
              permisos: permisosMask,
            };
          });

          await db.insert(rolesRecursos).values(relacionesAInsertar);
        }

        return u.recursoId;
      } else {
        // --- CREATE CASE ---

        // 1. Insert the resource
        const [u] = await db
          .insert(recurso)
          .values({ nombre, ruta })
          .returning({ recursoId: recurso.id });

        if (!u) throw new Error("No se pudo crear el recurso");

        // 2. Link to Menu
        if (menuId) {
          await db
            .update(menu)
            .set({ recursoId: u.recursoId })
            .where(eq(menu.id, Number(menuId)));
        }

        // 3. Insert relations with individual bitmask calculation
        if (permisosRol && permisosRol.length > 0) {
          const relacionesAInsertar = permisosRol.map((pr: any) => {
            const permisosMask = pr.permisos.reduce(
              (sum: number, p: string) => sum + Number(p),
              0,
            );

            return {
              recursoId: u.recursoId,
              rolId: pr.rolid,
              permisos: permisosMask,
            };
          });

          await db.insert(rolesRecursos).values(relacionesAInsertar);
        }

        return u.recursoId;
      }
    },
    onSuccess: (_, variables) => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ["recursos-list"] });
      if (variables.id)
        queryClient.invalidateQueries({
          queryKey: ["recurso_data", variables.id],
        });
      toast.success(variables.id ? "Recurso actualizado" : "Recurso creado");
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
    useGetPermisos,
    useGetData,
    upsertMutation,
    handleCreate,
    handleEdit,
    handleToggleStatus,
  };
};
