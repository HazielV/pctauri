import { useQuery } from "@tanstack/react-query";
/* import { useStudentMutation } from "@/hooks/useStudentMutation"; */

import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "./form";
import { db } from "@/db/client";
import { instructor } from "@/db/schema";
import { eq } from "drizzle-orm";

export function LoaderForm({ id }: { id?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["instructor_data", id],
    queryFn: async () => {
      const initialData = await db.query.instructor.findFirst({
        where: eq(instructor.id, id!),
        with: {
          persona: true,
        },
      });
      return initialData;
    },
    enabled: !!id, // Solo ejecuta la query si hay un ID
  });
  const { data: catalogos, isLoading: isLoadingCatalogos } = useQuery({
    queryKey: ["catalogos_data", "TIPO_DOCUMENTO", "SEXO"],
    queryFn: async () => {
      const initialData = await db.query.catalogo.findMany({
        where: (t, { eq, or }) =>
          or(eq(t.categoria, "TIPO_DOCUMENTO"), eq(t.categoria, "SEXO")),
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

  return <Form data={data} catalogos={catalogos} />;
}
