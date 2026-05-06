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
          estado: true,
          temas: {
            with: {
              tipoTema: true,
            },
          },
          gestion: {
            columns: {
              nombre: true,
            },
          },
          horarioPlantillas: {
            with: {
              diaSemana: true,
            },
          },
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
    mutationFn: async ({ id, values }: { id?: string; values: any }) => {
      setLoading(true);
      const { horarios, ...datosCurso } = values;
      console.log(values);
      const estadoActivo = await db.query.estado.findFirst({
        where: (t, { and }) =>
          and(eq(t.nombre, "ACTIVO"), eq(t.categoria, "SISTEMA")),
      });

      if (!estadoActivo) {
        throw new Error("Error estados");
      }
      let cursoId = id;

      if (id) {
        // 1. UPDATE CURSO
        await db
          .update(curso)
          .set({ ...datosCurso, updatedAt: new Date().toISOString() })
          .where(eq(curso.id, id));

        // 2. REFRESCAR HORARIOS (Borrar para reinsertar)
        await db
          .delete(horarioPlantilla)
          .where(eq(horarioPlantilla.curso_id, id));

        cursoId = id;
      } else {
        // 1. INSERT CURSO
        const nuevoCurso = await db
          .insert(curso)
          .values({ ...datosCurso, estado_id: estadoActivo.id })
          .returning({ id: curso.id });

        cursoId = nuevoCurso[0].id;
      }

      // 3. INSERTAR HORARIOS (Tanto para Create como para Update)
      if (horarios && horarios.length > 0) {
        const horariosConId = horarios.map((h: any) => ({
          dia_semana_id: h.diaSemana,
          estado_id: estadoActivo.id,
          tipo_clase_id: h.tipo,
          curso_id: cursoId,
          hora_inicio: h.horaInicio,
          hora_fin: h.horaFin,
          nombre: `${h.tipo}`,
        }));
        console.log(horariosConId);
        await db.insert(horarioPlantilla).values(horariosConId);
      }

      return cursoId;
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
    mutationFn: async ({ id, estado }: { id: string; estado: string }) => {
      const estadoComenzar = await db.query.estado.findFirst({
        where: (t, { and }) =>
          and(eq(t.nombre, estado.toUpperCase()), eq(t.categoria, "SISTEMA")),
      });
      return await db
        .update(curso)
        .set({ estado_id: estadoComenzar?.id })
        .where(eq(curso.id, id));
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["cursos-list"] }),
  });
  const temasUpsertMutation = useMutation({
    mutationFn: async ({ values }: { values: any }) => {
      const { cursoId, temasCurso, temasAnterior } = values;

      const estadoActivo = await db.query.estado.findFirst({
        where: (t, { and }) =>
          and(eq(t.nombre, "ACTIVO"), eq(t.categoria, "SISTEMA")),
      });
      const estadoInactivo = await db.query.estado.findFirst({
        where: (t, { and }) =>
          and(eq(t.nombre, "INACTIVO"), eq(t.categoria, "SISTEMA")),
      });
      if (!estadoActivo || !estadoInactivo) {
        throw new Error("Error estados");
      }
      const tipoCatalogo = await db.query.catalogo.findMany({
        where: (t, { and }) => and(eq(t.categoria, "TIPO_ACADEMICO")),
      });
      if (!tipoCatalogo) {
        throw new Error("Error catalogo");
      }

      const idsSobrevivientes = temasCurso
        .filter((t: any) => !t.id.startsWith("NEW"))
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
            estado_id: estadoInactivo.id,
            orden: 0,
          })
          .where(inArray(tema.id, idsInactivar));
      }

      // ==========================================
      // 2. ACTUALIZAR los que se quedaron o modificaron
      // ==========================================
      const temasParaActualizar = temasCurso.filter(
        (t: any) => !t.id.startsWith("NEW"),
      );

      // Hacemos un update uno por uno (es rápido en SQLite local)
      for (const t of temasParaActualizar) {
        await db
          .update(tema)
          .set({
            titulo: t.titulo,
            orden: t.orden,
            tipo_tema_id: tipoCatalogo.find((tipo) => tipo.nombre === t.nombre)
              ?.id,
            estado_id: estadoActivo.id, // Por si acaso revivió
          })
          .where(eq(tema.id, t.id));
      }

      // ==========================================
      // 3. INSERTAR los totalmente nuevos
      // ==========================================
      // Son los que creamos con un ID negativo en el frontend
      const temasNuevos = temasCurso
        .filter((t: any) => t.id.startsWith("NEW"))
        .map((t: any) => ({
          ...t,
          id: t.id.replace(/^NEW-/, ""),
          tipo_tema_id: tipoCatalogo.find((tipo) => tipo.nombre === t.tipo)?.id,
        }));

      if (temasNuevos.length > 0) {
        const dataAInsertar = temasNuevos.map((t: any) => ({
          curso_id: cursoId,
          titulo: t.titulo,
          orden: t.orden,
          tipo_tema_id: tipoCatalogo.find((tipo) => tipo.nombre === t.tipo)?.id,
          estado_id: estadoActivo.id, // Por si acaso revivió
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
      id: string;
      estado_id: string;
      orden: number | null;
      curso_id: string;
      titulo: string;
      tipo_tema_id: string;
      tipoTema: {
        id: string;
        nombre: string;
        categoria: string | null;
        descripcion: string | null;
      };
    }[];
    cursoId: string;
    estado: string;
  }) => {
    if (estado.toLowerCase() === "en curso") {
      show(
        <Temas
          temas={temas.map((t) => ({
            id: t.id,
            estado_id: t.estado_id,
            orden: t.orden,
            titulo: t.titulo,
            tipo: t.tipoTema.nombre,
            curso_id: t.curso_id,
          }))}
          cursoId={cursoId}
        />,
        {
          title: "Temas del curso",
          formId: "temas-curso",
          footer: <></>,
        },
      );
    }
    if (estado.toLowerCase() === "activo") {
      show(
        <Temas
          temas={temas.map((t) => ({
            id: t.id,
            estado_id: t.estado_id,
            orden: t.orden,
            titulo: t.titulo,
            tipo: t.tipoTema.nombre,
            curso_id: t.curso_id,
          }))}
          cursoId={cursoId}
        />,
        {
          title: "Temas del curso",
          formId: "temas-curso",
        },
      );
    }
  };
  const handleEdit = (id: string) => {
    show(<LoaderForm id={id} />, {
      title: "Editar curso",
      formId: "curso-formulario-edit",
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const isInactive = currentStatus.toLowerCase() === "inactivo";
    showAlert({
      title: isInactive ? "¿Activar Curso?" : "¿Deshabilitar Curso?",
      description: `El Curso pasará a estar ${isInactive ? "activo" : "inactivo"} en el sistema.`,
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
  const handleComenzarCurso = (id: string) => {
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
  const handleFinalizarCurso = (id: string) => {
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
