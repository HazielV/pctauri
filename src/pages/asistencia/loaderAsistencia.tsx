import { useQuery } from "@tanstack/react-query";
/* import { useStudentMutation } from "@/hooks/useStudentMutation"; */

import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "./form";
import { db } from "@/db/client";
import { FormAsistencia } from "./formAsistencia";

export function LoaderFormAsistencia({
  inscripcionId,
  fechaActual,
  tipo,
}: any) {
  const { data: inscripcion, isLoading: loadingInscripcion } = useQuery({
    queryKey: ["cursos-activa"],
    queryFn: () => {
      return db.query.inscripcion.findFirst({
        where: (curso, { eq }) => eq(curso.estado, "activo"),
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
  if (loadingInscripcion) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <FormAsistencia
      dataInscripcion={inscripcion}
      fechaActual={fechaActual} /* sucursales={sucursales} */
    />
  );
}
