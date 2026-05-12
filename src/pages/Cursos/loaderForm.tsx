import { useQuery } from "@tanstack/react-query";
/* import { useStudentMutation } from "@/hooks/useStudentMutation"; */

import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "./form";
import { db } from "@/db/client";
import { curso, estado } from "@/db/schema";
import { eq } from "drizzle-orm";

export function LoaderForm({ id }: { id?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["curso_data", id],
    queryFn: async () => {
      const initialData = await db.query.curso.findFirst({
        where: eq(curso.id, id!),
        with: {
          horarioPlantillas: {
            with: {
              diaSemana: true,
              tipoClase: true,
            },
          },
        },
      });
      return initialData;
    },
    enabled: !!id,
  });
  const { data: sucursales, isLoading: loadingSucursales } = useQuery({
    queryKey: ["sucursales-activos"],
    queryFn: () =>
      db.query.sucursal.findMany({
        where: (sucursal, { eq, and }) =>
          eq(
            sucursal.estado_id,
            db
              .select({ id: estado.id })
              .from(estado)
              .where(
                and(
                  eq(estado.nombre, "ACTIVO"),
                  eq(estado.categoria, "SISTEMA"),
                ),
              ),
          ),
      }),
  });
  const { data: gestiones, isLoading: loadingGestiones } = useQuery({
    queryKey: ["gestiones-activa"],
    queryFn: () => {
      const hoy = new Date().toISOString().split("T")[0];
      return db.query.gestion.findMany({
        where: (gestion, { eq, and, lte, gte }) =>
          and(
            eq(
              gestion.estado_id,
              db
                .select({ id: estado.id })
                .from(estado)
                .where(
                  and(
                    eq(estado.nombre, "ACTIVO"),
                    eq(estado.categoria, "SISTEMA"),
                  ),
                ),
            ),
            lte(gestion.fecha_inicio, hoy), // La gestión ya empezó (o empieza hoy)
            gte(gestion.fecha_fin, hoy), // La gestión termina hoy o en el futuro
          ),
        // Opcional: ordenarlas para que la más reciente salga primero
        orderBy: (gestion, { desc }) => [desc(gestion.fecha_fin)],
      });
    },
  });
  const { data: catalogos, isLoading: isLoadingCatalogos } = useQuery({
    queryKey: ["catalogos_data", "DIA_SEMANA", "TIPO_ACADEMICO"],
    queryFn: async () => {
      const initialData = await db.query.catalogo.findMany({
        where: (t, { eq, or }) =>
          or(eq(t.categoria, "DIA_SEMANA"), eq(t.categoria, "TIPO_ACADEMICO")),
      });
      return initialData;
    },
  });
  if (
    (id && isLoading) ||
    loadingSucursales ||
    loadingGestiones ||
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
      data={data}
      sucursales={sucursales}
      gestiones={gestiones}
      catalogos={catalogos}
    />
  );
}
