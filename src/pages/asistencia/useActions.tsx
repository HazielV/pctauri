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
  pago,
  persona,
} from "@/db/schema";
import { and, between, count, eq, inArray } from "drizzle-orm";
import { useModalStore } from "@/store/modalState";
import { useAlertStore } from "@/store/AlertState";
import { toast } from "sonner";
import { LoaderFormAsistencia } from "./loaderAsistencia";
import { FormAsistencia } from "./formAsistencia";
import FormFotter from "./formFotter";
import FormClase from "./formClase";
import { format } from "date-fns";

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
    mutationFn: async ({ values, fecha }: { values: any; fecha: Date }) => {
      setLoading(true);
      const { vehiculoId, instructorId, inscripcionId, horaIni, horaFin } =
        values;
      const fechaFormateada = format(fecha, "yyyy-MM-dd");

      // 1. Crear Clase Práctica Manual
      return await db.insert(clasePractica).values({
        inscripcionId: Number(inscripcionId),
        instructorId: Number(instructorId),
        vehiculoId: Number(vehiculoId),
        fechaExacta: fechaFormateada,
        horaInicio: horaIni, // O podrías añadir inputs de hora al form
        horaFin: horaFin,
        estadoClase: "PROGRAMADA",
      });
    },
    onSuccess: (_, variables) => {
      setLoading(false);
      queryClient.invalidateQueries({
        queryKey: ["inscripcion-matriz-asistencia-mes"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inscripciones_x_estudiante"],
      });
      toast.success("Nueva clase practica");
      close();
    },
    onError: (e) => {
      console.log(e);
      setLoading(false);
      toast.error("Error al procesar la solicitud");
    },
  });
  const upsertAsistenciaMutation = useMutation({
    mutationFn: async ({ id, values }: { id?: number; values: any }) => {
      setLoading(true);
      const {
        inscripcionId,
        estadoAsistencia,
        tipoClase,
        claseId,
        montoPago,
        metodoPago,
      } = values;

      const monto = Number(montoPago);
      console.log(monto);
      const iId = Number(inscripcionId);
      const cId = Number(claseId);

      let asistenciaIdFinal = id;

      // --- 1. GESTIÓN DE ASISTENCIA ---
      if (id) {
        // Caso: Actualizar asistencia existente
        await db
          .update(asistenciaGeneral)
          .set({
            estadoAsistencia,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(asistenciaGeneral.id, id));
      } else {
        // Caso: Nueva asistencia (Insert)
        const payload: any = {
          inscripcionId: iId,
          estadoAsistencia,
        };

        // Asignamos el ID de clase según el tipo (T o P)
        if (tipoClase === "P") {
          payload.clasePracticaId = cId;
        } else {
          payload.claseTeoricaId = cId;
        }

        const [nuevaAsis] = await db
          .insert(asistenciaGeneral)
          .values(payload)
          .returning({ id: asistenciaGeneral.id });

        asistenciaIdFinal = nuevaAsis.id;
      }

      // --- 2. GESTIÓN DE PAGO (Independiente) ---
      // Solo insertamos si el administrativo escribió un monto válido
      if (monto > 0) {
        try {
          await db.insert(pago).values({
            inscripcionId: iId,
            montoPagado: monto,
            metodoPago: metodoPago || "EFECTIVO",
            estado: "activo",
          });
        } catch (error) {
          console.error(
            "Error al registrar el pago, pero la asistencia se guardó:",
            error,
          );
          // No lanzamos error aquí para que no se "caiga" la UI si solo falló el pago
        }
      }

      return asistenciaIdFinal;
    },
    onSuccess: (_, variables) => {
      setLoading(false);
      queryClient.invalidateQueries({
        queryKey: ["inscripcion-matriz-asistencia-mes"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inscripciones_x_estudiante"],
      });
      if (variables.id)
        queryClient.invalidateQueries({
          queryKey: ["inscripcion-matriz-asistencia-mes", variables.id],
        });
      toast.success(
        variables.id ? "Asistencia actualizada" : "Asistencia creada",
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

  /*   const handleCreate = () => {
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
  }; */
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
        size: "md",
      },
    );
  };
  const handleLlenarAsistencia = ({
    fecha,
    claseId,
    tipoClase,
    inscripcionId,
    data,
  }: any) => {
    show(
      <FormClase
        data={data}
        inscripcionId={inscripcionId}
        fecha={fecha}
        claseId={claseId}
        tipoClase={tipoClase}
      />,
      {
        title: "Llenar asistencia",
        formId: "llenar-asistencia-clase",
        size: "sm",
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
    handleToggleStatus,
    searchMutation,
    handleLlenarAsistencia,
    upsertAsistenciaMutation,
  };
};
