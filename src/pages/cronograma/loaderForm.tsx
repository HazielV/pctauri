import { useQuery } from "@tanstack/react-query";
/* import { useStudentMutation } from "@/hooks/useStudentMutation"; */

import { Skeleton } from "@/components/ui/skeleton";

import { db } from "@/db/client";
import { curso, estado } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import Form from "./form";

export function LoaderForm({ id, fecha }: { id?: string; fecha?: string }) {
  const { data: cursosActivos, isLoading } = useQuery({
    queryKey: ["cursos-activos"],
    queryFn: async () => {
      const initialData = await db.query.curso.findMany({
        where: eq(
          curso.estado_id,
          db
            .select({ id: estado.id })
            .from(estado)
            .where(
              and(
                eq(estado.nombre, "EN CURSO"),
                eq(estado.categoria, "SISTEMA"),
              ),
            ),
        ),
      });
      return initialData;
    },
  });
  const { data: catalogos, isLoading: isLoadingCatalogos } = useQuery({
    queryKey: ["catalogos_data", "TIPO_ACADEMICO", "SEXO"],
    queryFn: async () => {
      const initialData = await db.query.catalogo.findMany({
        where: (t, { eq, or }) =>
          or(eq(t.categoria, "TIPO_ACADEMICO"), eq(t.categoria, "SEXO")),
      });
      return initialData;
    },
  });
  if (id && (isLoading || isLoadingCatalogos)) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <Form
      cursosActivos={cursosActivos}
      catalogos={catalogos}
      fechaSeleccionada={fecha}
    />
  );
}
