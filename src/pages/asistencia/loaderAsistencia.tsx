import { useQuery } from "@tanstack/react-query";
/* import { useStudentMutation } from "@/hooks/useStudentMutation"; */
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db/client";
import { FormAsistencia } from "./formAsistencia";

export function LoaderFormAsistencia({ inscripcionId, fechaActual }: any) {
  const { data: inscripcion, isLoading: loadingInscripcion } = useQuery({
    queryKey: ["inscripcion-asistencia"],
    queryFn: () => {
      return db.query.inscripcion.findFirst({
        where: (inscripcion, { eq }) =>
          eq(inscripcion.id, Number(inscripcionId)),
        with: {
          estudiante: {
            columns: {
              id: true,
              codigoInterno: true,
            },
            with: {
              persona: {
                columns: {
                  nombres: true,
                  primerApellido: true,
                  segundoApellido: true,
                },
              },
            },
          },
          curso: {
            columns: {
              id: true,
              nombreCurso: true,
            },
          },
        },
      });
    },
  });
  const { data: vehiculos, isLoading: loadingVehiculos } = useQuery({
    queryKey: ["vehiculos-disponibles"],
    queryFn: () => {
      return db.query.vehiculo.findMany();
    },
  });
  const { data: instructores, isLoading: loadingInstructores } = useQuery({
    queryKey: ["instructores-disponibles"],
    queryFn: () => {
      return db.query.instructor.findMany({
        with: {
          persona: true,
        },
      });
    },
  });
  if (loadingInscripcion || loadingVehiculos || loadingInstructores) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <FormAsistencia
      instructores={instructores}
      vehiculos={vehiculos}
      dataInscripcion={inscripcion}
      fechaActual={fechaActual} /* sucursales={sucursales} */
    />
  );
}
