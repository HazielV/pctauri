import { useQuery } from "@tanstack/react-query";
/* import { useStudentMutation } from "@/hooks/useStudentMutation"; */

import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "./form";
import { db } from "@/db/client";

export function LoaderForm() {
  const { data: cursos, isLoading: loadingcursos } = useQuery({
    queryKey: ["cursos-activa"],
    queryFn: () => {
      return db.query.curso.findMany({
        where: (curso, { eq }) => eq(curso.estado, "activo"),
      });
    },
  });
  if (loadingcursos) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return <Form /* sucursales={sucursales} */ cursos={cursos} />;
}
