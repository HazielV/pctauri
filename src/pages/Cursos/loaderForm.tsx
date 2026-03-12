import { useQuery } from "@tanstack/react-query";
/* import { useStudentMutation } from "@/hooks/useStudentMutation"; */

import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "./form";
import { db } from "@/db/client";
import { curso } from "@/db/schema";
import { eq } from "drizzle-orm";

export function LoaderForm({ id }: { id?: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["curso_data", id],
    queryFn: async () => {
      const initialData = await db.query.curso.findFirst({
        where: eq(curso.id, id!),
        with: {
          horarioPlantillas: true,
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
        where: (sucursal, { eq }) => eq(sucursal.estado, "activo"),
      }),
  });
  const { data: gestiones, isLoading: loadingGestiones } = useQuery({
    queryKey: ["gestiones-activa"],
    queryFn: () => {
      const hoy = new Date().toISOString().split("T")[0];
      return db.query.gestion.findMany({
        where: (gestion, { eq, and, lte, gte }) =>
          and(
            eq(gestion.estado, "activo"),
            lte(gestion.fechaInicio, hoy), // La gestión ya empezó (o empieza hoy)
            gte(gestion.fechaFin, hoy), // La gestión termina hoy o en el futuro
          ),
        // Opcional: ordenarlas para que la más reciente salga primero
        orderBy: (gestion, { desc }) => [desc(gestion.fechaInicio)],
      });
    },
  });
  if ((id && isLoading) || loadingSucursales || loadingGestiones) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return <Form data={data} sucursales={sucursales} gestiones={gestiones} />;
}
