import { useQuery } from "@tanstack/react-query";
/* import { useStudentMutation } from "@/hooks/useStudentMutation"; */

import { Skeleton } from "@/components/ui/skeleton";

import { db } from "@/db/client";
import { gestion } from "@/db/schema";
import { eq } from "drizzle-orm";
import Form from "./form";

export function LoaderForm({ id, fecha }: { id?: number; fecha?: string }) {
  const { data: cursosActivos, isLoading } = useQuery({
    queryKey: ["cursos-activos"],
    queryFn: async () => {
      const initialData = await db.query.curso.findMany({
        where: eq(gestion.estado, "activo"),
      });
      return initialData;
    },
  });

  if (id && isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return <Form cursosActivos={cursosActivos} fechaSeleccionada={fecha} />;
}
