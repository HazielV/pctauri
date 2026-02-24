import { useQuery } from "@tanstack/react-query";
/* import { useStudentMutation } from "@/hooks/useStudentMutation"; */

import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "./form";
import { db } from "@/db/client";
import { gestion } from "@/db/schema";
import { eq } from "drizzle-orm";

export function LoaderForm({ id }: { id?: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["gestion_data", id],
    queryFn: async () => {
      const initialData = await db.query.gestion.findFirst({
        where: eq(gestion.id, id!),
      });
      return initialData;
    },
    enabled: !!id, // Solo ejecuta la query si hay un ID
  });

  if (id && isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return <Form data={data} />;
}
