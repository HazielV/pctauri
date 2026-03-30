// Roles/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db/client";
import { curso, horarioPlantilla, tema } from "@/db/schema";
import { count, eq, inArray } from "drizzle-orm";
import { useModalStore } from "@/store/modalState";
import { useAlertStore } from "@/store/AlertState";
import { toast } from "sonner";
import { LoaderForm } from "./loaderForm";
import Temas from "./temas";

export const useActions = () => {
  const queryClient = useQueryClient();
  const { setLoading, show, close } = useModalStore();
  const { showAlert } = useAlertStore();
  const getData = async (page: number, perPage: number) => {
    try {
      const [totalResult] = await db.select({ value: count() }).from(curso);
      const totalItems = totalResult?.value ?? 0;
      const skip = (page - 1) * perPage;
      const data = await db.query.curso.findMany({
        offset: skip,
        limit: perPage,
        with: {
          temas: true,
          gestion: {
            columns: {
              nombre: true,
            },
          },
          horarioPlantillas: true,
          sucursal: {
            columns: {
              nombre: true,
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
      console.error("Error obteniendo cursos de SQLite:", error);

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
      queryKey: ["cursos-list", page, perPage], // Si esto cambia, se refetchea
      queryFn: () => getData(page, perPage),
    });

  // --- MUTACIONES ---
  const upsertMutation = useMutation({
    mutationFn: async ({ id, values }: { id?: number; values: any }) => {
      setLoading(true);
      const { horarios, ...datosCurso } = values;
      return await db.transaction(async (tx) => {
        let cursoId = id;

        if (id) {
          // 1. UPDATE CURSO
          await tx
            .update(curso)
            .set({ ...datosCurso, updatedAt: new Date().toISOString() })
            .where(eq(curso.id, id));

          // 2. REFRESCAR HORARIOS (La forma más limpia en un Update es borrar y reinsertar)
          await tx
            .delete(horarioPlantilla)
            .where(eq(horarioPlantilla.cursoId, id));
        } else {
          // 1. INSERT CURSO
          const nuevoCurso = await tx
            .insert(curso)
            .values(datosCurso)
            .returning({ id: curso.id });
          cursoId = nuevoCurso[0].id;
        }

        // 3. INSERTAR HORARIOS (Tanto para Create como para Update)
        if (horarios && horarios.length > 0) {
          const horariosConId = horarios.map((h: any) => ({
            ...h,
            cursoId: cursoId,
            nombre: `${h.tipo} - ${h.diaSemana}`, // Autogeneramos un nombre si no hay uno
          }));
          await tx.insert(horarioPlantilla).values(horariosConId);
        }
      });
    },
    onSuccess: (_, variables) => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ["cursos-list"] });
      if (variables.id)
        queryClient.invalidateQueries({
          queryKey: ["curso_data", variables.id],
        });
      toast.success(variables.id ? "Curso actualizado" : "Curso creado");
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
      estado: "activo" | "inactivo" | "finalizado" | "en curso" | "programado";
    }) => {
      return await db.update(curso).set({ estado }).where(eq(curso.id, id));
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["cursos-list"] }),
  });
  const temasUpsertMutation = useMutation({
    mutationFn: async ({ values }: { values: any }) => {
      const { cursoId, temasCurso, temasAnterior } = values;

      // ==========================================
      // 1. INACTIVAR los que el usuario quitó
      // ==========================================
      // Extraemos los IDs que sobrevivieron en el formulario
      const idsSobrevivientes = temasCurso
        .filter((t: any) => t.id > 0)
        .map((t: any) => t.id);

      // Encontramos los que estaban en la DB pero ya no están en el formulario
      const temasParaInactivar = temasAnterior.filter(
        (tOriginal: any) => !idsSobrevivientes.includes(tOriginal.id),
      );

      if (temasParaInactivar.length > 0) {
        const idsInactivar = temasParaInactivar.map((t: any) => t.id);

        // En lugar de delete, hacemos un UPDATE de estado a "inactivo"
        // También podríamos poner el orden en 0 para que no estorbe
        await db
          .update(tema)
          .set({
            estado: "inactivo",
            orden: 0,
          })
          .where(inArray(tema.id, idsInactivar));
      }

      // ==========================================
      // 2. ACTUALIZAR los que se quedaron o modificaron
      // ==========================================
      const temasParaActualizar = temasCurso.filter((t: any) => t.id > 0);

      // Hacemos un update uno por uno (es rápido en SQLite local)
      for (const t of temasParaActualizar) {
        await db
          .update(tema)
          .set({
            titulo: t.titulo,
            orden: t.orden,
            tipo: t.tipo,
            estado: "activo", // Por si acaso revivió
          })
          .where(eq(tema.id, t.id));
      }

      // ==========================================
      // 3. INSERTAR los totalmente nuevos
      // ==========================================
      // Son los que creamos con un ID negativo en el frontend
      const temasNuevos = temasCurso.filter((t: any) => t.id < 0);

      if (temasNuevos.length > 0) {
        const dataAInsertar = temasNuevos.map((t: any) => ({
          cursoId: cursoId,
          titulo: t.titulo,
          tipo: t.tipo,
          orden: t.orden,
          estado: "activo",
        }));

        await db.insert(tema).values(dataAInsertar);
      }

      return true;
    },
    onSuccess: () => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ["cursos-list"] });
      toast.success("Temario actualizado correctamente");
      close();
    },
    onError: (error) => {
      console.error("Error al actualizar temas:", error);
      setLoading(false);
      toast.error("Error al procesar la solicitud");
    },
  });

  const handleCreate = () => {
    show(<LoaderForm />, {
      title: "Crear nuevo curso",
      formId: "curso-formulario-create",
    });
  };
  const handleTemas = ({
    temas,
    cursoId,
    estado,
  }: {
    temas: {
      id: number;
      estado: "activo" | "inactivo";
      orden: number | null;
      cursoId: number;
      tipo: "TEORICO" | "PRACTICO";
      titulo: string;
    }[];
    cursoId: number;
    estado: string;
  }) => {
    if (estado === "en curso") {
      show(<Temas temas={temas} cursoId={cursoId} />, {
        title: "Temas del curso",
        formId: "temas-curso",
        footer: <></>,
      });
    }
    if (estado === "activo") {
      show(<Temas temas={temas} cursoId={cursoId} />, {
        title: "Temas del curso",
        formId: "temas-curso",
      });
    }
  };
  const handleEdit = (id: number) => {
    show(<LoaderForm id={id} />, {
      title: "Editar curso",
      formId: "curso-formulario-edit",
    });
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const isInactive = currentStatus === "inactivo";
    showAlert({
      title: isInactive ? "¿Activar Curso?" : "¿Deshabilitar Curso?",
      description: `El Curso pasará a estar ${isInactive ? "activo" : "inactivo"} en el sistema.`,
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
  const handleComenzarCurso = (id: number) => {
    showAlert({
      title: "Comenzar curso?",
      description: "El curso dara inicio",
      variant: "info",
      actionText: "Comenzar",
      onAction: async () => {
        // Al ser una mutación de TanStack Query, lanzamos la promesa
        await statusMutation.mutateAsync({
          id,
          estado: "en curso",
        });
        toast.success("Estado actualizado");
      },
    });
  };
  const handleFinalizarCurso = (id: number) => {
    showAlert({
      title: "Finalizar curso?",
      description: "El curso finalizara",
      variant: "warning",
      actionText: "Finalizar",
      onAction: async () => {
        // Al ser una mutación de TanStack Query, lanzamos la promesa
        await statusMutation.mutateAsync({
          id,
          estado: "finalizado",
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
    handleComenzarCurso,
    handleFinalizarCurso,
    handleTemas,
    temasUpsertMutation,
  };
};
