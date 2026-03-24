import { useQuery } from "@tanstack/react-query";
/* import { useStudentMutation } from "@/hooks/useStudentMutation"; */

import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "./form";
import { db } from "@/db/client";

export function LoaderForm() {
  const { data: cursos, isLoading: loadingcursos } = useQuery({
    queryKey: ["cursos-activos"],
    queryFn: () => {
      return db.query.curso.findMany({
        where: (curso, { eq }) => eq(curso.estado, "en curso"),
      });
    },
  });
  const { data: instructores, isLoading: loadinginstructores } = useQuery({
    queryKey: ["instructores-activos"],
    queryFn: () => {
      return db.query.instructor.findMany({
        with: {
          persona: true,
        },
      });
    },
  });
  const { data: vehiculos, isLoading: loadingvehiculos } = useQuery({
    queryKey: ["vehiculos-activos"],
    queryFn: () => {
      return db.query.vehiculo.findMany({});
    },
  });

  if (loadingcursos || loadinginstructores || loadingvehiculos) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <Form instructores={instructores} vehiculos={vehiculos} cursos={cursos} />
  );
}
