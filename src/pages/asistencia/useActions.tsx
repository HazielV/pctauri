// Roles/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db/client";
import {
  asistenciaGeneral,
  clasePractica,
  claseTeorica,
  estudiante,
  horarioPlantilla,
  inscripcion,
  persona,
} from "@/db/schema";
import { and, between, count, eq, inArray } from "drizzle-orm";
import { useModalStore } from "@/store/modalState";
import { useAlertStore } from "@/store/AlertState";
import { toast } from "sonner";
import { LoaderForm } from "./loaderForm";
import { LoaderFormAsistencia } from "./loaderAsistencia";
import { FormAsistencia } from "./formAsistencia";
import FormFotter from "./formFotter";

export const useActions = () => {
  const queryClient = useQueryClient();
  const { setLoading, show, close } = useModalStore();
  const { showAlert } = useAlertStore();
  async function getAsistenciaMatrizGlobal(
    fInicio: string,
    fFin: string,
    page: number,
    perPage: number,
  ) {
    const inscripciones = await db.query.inscripcion.findMany({
      where: eq(inscripcion.estado, "activo"),
      limit: perPage,
      offset: (page - 1) * perPage,
      with: {
        estudiante: {
          with: { persona: true },
        },
        curso: {
          with: { horarioPlantillas: true }, // vital para saber sus días teóricos
        },
      },
    });

    // Si no hay inscripciones en esta página, devolvemos vacío rápido
    if (inscripciones.length === 0) {
      return {
        inscripciones: [],
        clasesTeoricas: [],
        clasesPracticas: [],
        asistencias: [],
      };
    }

    // Extraemos los IDs para filtrar las siguientes consultas
    const inscripcionesIds = inscripciones.map((i) => i.id);
    // Usamos un Set para no tener IDs duplicados si varios alumnos son del mismo curso
    const cursosIds = [...new Set(inscripciones.map((i) => i.cursoId))];

    // 2. OBTENEMOS EL CALENDARIO REAL DE ESA SEMANA
    // Traemos TODAS las clases (tengan asistencia marcada o no)

    const clasesTeoricas = await db.query.claseTeorica.findMany({
      where: and(
        inArray(claseTeorica.cursoId, cursosIds), // <--- ESTO ES LO QUE FALTABA
        between(claseTeorica.fechaExacta, fInicio, fFin),
      ),
      with: { horarioPlantilla: true },
    });

    const clasesPracticas = await db.query.clasePractica.findMany({
      where: and(
        inArray(clasePractica.inscripcionId, inscripcionesIds), // Solo de los alumnos de esta página
        between(clasePractica.fechaExacta, fInicio, fFin),
      ),
    });

    // 3. OBTENEMOS LAS ASISTENCIAS YA MARCADAS
    const asistencias = await db.query.asistenciaGeneral.findMany({
      where: inArray(asistenciaGeneral.inscripcionId, inscripcionesIds),
    });

    // Devolvemos todo el paquete para que el Frontend arme la matriz
    return {
      inscripciones,
      clasesTeoricas,
      clasesPracticas,
      asistencias,
    };
  }

  // Ejemplo de lo que debería hacer tu función getAsistenciaMatriz

  // --- QUERIES ---
  const useGetData = ({
    fInicio,
    fFin,
    page,
    perPage,
  }: {
    fInicio: string;
    fFin: string;
    page: number;
    perPage: number;
  }) =>
    useQuery({
      queryKey: [
        "inscripcion-matriz-asistencia-mes",
        fInicio,
        fFin,
        page,
        perPage,
      ],
      queryFn: () => getAsistenciaMatrizGlobal(fInicio, fFin, page, perPage),
    });

  // --- MUTACIONES ---
  const upsertMutation = useMutation({
    mutationFn: async ({
      id,
      values,
      nroDocumento,
    }: {
      id?: number;
      values: any;
      nroDocumento?: number;
    }) => {
      setLoading(true);

      const { cursoId, gestionId, precioPactado, ...dataPersona } = values;
      if (nroDocumento) {
        const per = await db.query.persona.findFirst({
          where: eq(persona.nroDocumento, Number(nroDocumento)),
        });
        if (per) {
          const [u] = await db
            .insert(estudiante)
            .values({ personaId: per.id })
            .returning({ estudianteId: estudiante.id });

          if (u) {
            await db.insert(inscripcion).values({
              cursoId: cursoId,
              estudianteId: u.estudianteId,
              precioPactado: precioPactado,
              gestionId: gestionId,
            });
          }
        }
      } else {
        const [p] = await db
          .insert(persona)
          .values({ ...dataPersona })
          .returning({ personaId: persona.id });
        if (p) {
          const [u] = await db
            .insert(estudiante)
            .values({ personaId: p.personaId })
            .returning({ estudianteId: estudiante.id });

          if (u) {
            await db.insert(inscripcion).values({
              cursoId: cursoId,
              estudianteId: u.estudianteId,
              precioPactado: precioPactado,
              gestionId: gestionId,
            });
          }
        }
      }
    },
    onSuccess: (_, variables) => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ["estudiantes-list"] });
      if (variables.id)
        queryClient.invalidateQueries({
          queryKey: ["estudiante_data", variables.id],
        });
      toast.success(
        variables.id ? "Inscripcion actualizada" : "Inscripcion creado",
      );
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
      return await db
        .update(inscripcion)
        .set({ estado })
        .where(eq(inscripcion.id, id));
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["estudiantes-list"] }),
  });

  const handleCreate = () => {
    show(<LoaderForm />, {
      title: "Crear nueva inscripcion",
      formId: "inscripcion-formulario-create",
    });
  };
  const handleEdit = (id: number) => {
    show(<LoaderForm />, {
      title: "Editar inscripcion",
      formId: "inscripcion-formulario-edit",
    });
  };
  const handleAsignarClase = ({ inscripcionId, fechaActual, tipo }: any) => {
    show(
      <LoaderFormAsistencia
        inscripcionId={inscripcionId}
        fechaActual={fechaActual}
        tipo={tipo}
      />,
      {
        title: "Asignar Clase",
        formId: "inscripcion-asignar-clase",
        size: "sm",
        footer: <FormFotter />,
      },
    );
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
  const searchMutation = useMutation({
    mutationFn: async (documento: string) => {
      // Aquí llamas a tu función de Drizzle
      const resultado = await db.query.persona.findFirst({
        where: eq(persona.nroDocumento, Number(documento)),
      });
      return resultado;
    },
    onSuccess: (data) => {
      if (data) {
        toast.success("Usuario encontrado", {
          position: "top-center",
        });
        // Aquí podrías cargar los datos en el formulario
        return data;
      } else {
        toast.error("El usuario no existe", {
          position: "top-center",
        });
        // Opcional: abrir modal de registro
      }
    },
    onError: () => {
      toast.error("Error en la conexión con la base de datos");
    },
  });

  return {
    useGetData,
    handleAsignarClase,
    upsertMutation,
    handleCreate,
    handleEdit,
    handleToggleStatus,
    searchMutation,
  };
};
