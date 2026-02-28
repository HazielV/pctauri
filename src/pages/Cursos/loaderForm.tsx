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
  if ((id && isLoading) || loadingSucursales) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return <Form data={data} sucursales={sucursales} />;
}
