import { useQuery } from "@tanstack/react-query";
/* import { useStudentMutation } from "@/hooks/useStudentMutation"; */

import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "./form";
import { db } from "@/db/client";
import { estado } from "@/db/schema";

export function LoaderForm() {
  const { data: cursos, isLoading: loadingcursos } = useQuery({
    queryKey: ["cursos-activos"],
    queryFn: () => {
      return db.query.curso.findMany({
        where: (curso, { eq, and }) =>
          eq(
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
  const { data: catalogos, isLoading: isLoadingCatalogos } = useQuery({
    queryKey: ["catalogos_data", "TIPO_DOCUMENTO", "SEXO"],
    queryFn: async () => {
      const initialData = await db.query.catalogo.findMany({
        where: (t, { eq, or }) =>
          or(
            eq(t.categoria, "TIPO_DOCUMENTO"),
            eq(t.categoria, "SEXO"),
            eq(t.categoria, "DIA_SEMANA"),
          ),
      });
      return initialData;
    },
  });
  if (
    loadingcursos ||
    loadinginstructores ||
    loadingvehiculos ||
    isLoadingCatalogos
  ) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <Form
      instructores={instructores}
      vehiculos={vehiculos}
      cursos={cursos}
      catalogos={catalogos}
    />
  );
}
