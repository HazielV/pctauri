// Roles/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db/client";
import { persona, usuario, usuariosRoles } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { useModalStore } from "@/store/modalState";
import { useAlertStore } from "@/store/AlertState";
import { toast } from "sonner";
import { LoaderForm } from "./loaderForm";
import { v4 as uuidv4 } from "uuid";
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
    mutationFn: async ({ id, values }: { id?: string; values: any }) => {
      setLoading(true);
      console.log("Valores recibidos:", values);
      const { username, password, rolId, ...dataPersona } = values;

      try {
        if (id) {
          // ---------------------------------------------------------
          // CASO ACTUALIZAR
          // ---------------------------------------------------------

          // 1. Buscamos el usuario primero para saber su personaId (Evitamos .returning)
          const userRecord = await db.query.usuario.findFirst({
            where: eq(usuario.id, id),
          });

          if (!userRecord) throw new Error("Usuario no encontrado");

          // 2. Actualizamos Usuario
          await db
            .update(usuario)
            .set({ username, password })
            .where(eq(usuario.id, id));

          // 3. Actualizamos Persona
          await db
            .update(persona)
            .set(dataPersona)
            .where(eq(persona.id, userRecord.personaId));

          // 4. Gestionamos el Rol (Wipe & Replace)
          if (rolId) {
            await db
              .delete(usuariosRoles)
              .where(eq(usuariosRoles.usuarioId, id));

            await db.insert(usuariosRoles).values({
              // id: uuidv4(), // Descomenta si tu tabla UsuariosRoles tiene ID propio
              usuarioId: id,
              rolId: String(rolId),
              asignadoEl: new Date().toISOString(), // Usamos JS puro por seguridad con SQLite
            });
          }

          return id;
        } else {
          // ---------------------------------------------------------
          // CASO CREAR
          // ---------------------------------------------------------

          // 1. Generamos los IDs aquí mismo para no depender de la DB ni de .returning()
          const newPersonaId = uuidv4();
          const newUsuarioId = uuidv4();

          // 2. Crear Persona
          await db.insert(persona).values({
            ...dataPersona,
            id: newPersonaId, // Inyectamos el ID generado
          });

          // 3. Crear Usuario
          await db.insert(usuario).values({
            id: newUsuarioId, // Inyectamos el ID generado
            username,
            password,
            personaId: newPersonaId, // Ya lo conocemos, no necesitamos .returning()
          });

          // 4. Asignar el Rol
          if (rolId) {
            await db.insert(usuariosRoles).values({
              // id: uuidv4(), // Descomenta si tu tabla UsuariosRoles tiene ID propio
              usuarioId: newUsuarioId,
              rolId: String(rolId),
              asignadoEl: new Date().toISOString(),
            });
          }

          return newUsuarioId;
        }
      } catch (error) {
        console.error("Error en la mutación:", error);
        throw error;
      } finally {
        setLoading(false);
      }
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
      id: string;
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
  const handleEdit = (id: string) => {
    show(<LoaderForm id={id} />, {
      title: "Crear nuevo usuario",
      formId: "usuario-formulario-edit",
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
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
