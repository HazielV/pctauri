// Roles/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db/client";
import { persona, usuario, usuariosRoles } from "@/db/schema";
import { and, count, eq } from "drizzle-orm";
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
          estado: true,
          persona: {
            columns: {
              nombres: true,
              primer_apellido: true,
              segundo_apellido: true,
              nro_documento: true,
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
      const { username, password, rol_id, ...dataPersona } = values;
      const estadoActivo = await db.query.estado.findFirst({
        where: (t) => and(eq(t.nombre, "ACTIVO"), eq(t.categoria, "SISTEMA")),
      });
      if (!estadoActivo) {
        throw new Error("Error estados");
      }
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
            .set({ username, password, estado_id: estadoActivo?.id })
            .where(eq(usuario.id, id));

          // 3. Actualizamos Persona
          await db
            .update(persona)
            .set(dataPersona)
            .where(eq(persona.id, userRecord.persona_id));

          // 4. Gestionamos el Rol (Wipe & Replace)
          if (rol_id) {
            await db
              .delete(usuariosRoles)
              .where(eq(usuariosRoles.usuario_id, id));

            await db.insert(usuariosRoles).values({
              // id: uuidv4(), // Descomenta si tu tabla UsuariosRoles tiene ID propio
              rol_id: String(rol_id),
              estado_id: estadoActivo?.id,
              usuario_id: id,
              asignado_el: new Date().toISOString(), // Usamos JS puro por seguridad con SQLite
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
            estado_id: estadoActivo?.id,
          });

          // 3. Crear Usuario
          await db.insert(usuario).values({
            id: newUsuarioId, // Inyectamos el ID generado
            username,
            password,
            persona_id: newPersonaId, // Ya lo conocemos, no necesitamos .returning()
            estado_id: estadoActivo?.id,
          });

          // 4. Asignar el Rol
          if (rol_id) {
            await db.insert(usuariosRoles).values({
              // id: uuidv4(), // Descomenta si tu tabla UsuariosRoles tiene ID propio
              estado_id: estadoActivo?.id,
              usuario_id: newUsuarioId,
              rol_id: String(rol_id),
              asignado_el: new Date().toISOString(),
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
    mutationFn: async ({ id, estado }: { id: string; estado: string }) => {
      const estadonuevo = await db.query.estado.findFirst({
        where: (t, { eq, and }) =>
          and(
            eq(t.nombre, estado === "ACTIVO" ? "INACTIVO" : "ACTIVO"),
            eq(t.categoria, "SISTEMA"),
          ),
      });
      return await db
        .update(usuario)
        .set({ estado_id: estadonuevo?.id })
        .where(eq(usuario.id, id));
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
    const isInactive = currentStatus.toLowerCase() === "inactivo";
    showAlert({
      title: isInactive ? "¿Activar Usuario?" : "¿Deshabilitar Usuario?",
      description: `El usuario pasará a estar ${isInactive ? "activo" : "inactivo"} en el sistema.`,
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
