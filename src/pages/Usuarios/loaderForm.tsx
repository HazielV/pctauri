import { useQuery } from "@tanstack/react-query";
/* import { useStudentMutation } from "@/hooks/useStudentMutation"; */

import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "./form";
import { db } from "@/db/client";
import { rol, usuario } from "@/db/schema";
import { eq } from "drizzle-orm";

export function LoaderForm({ id }: { id?: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["usuario_data", id],
    queryFn: async () => {
      const initialData = await db.query.usuario.findFirst({
        where: eq(usuario.id, id!),
        with: {
          persona: true,
          usuariosRoles: {
            columns: {},
            with: {
              rol: {
                columns: {
                  id: true,
                },
              },
            },
          },
        },
      });
      return initialData;
    },
    enabled: !!id, // Solo ejecuta la query si hay un ID
  });
  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles_data", id],
    queryFn: async () => {
      const initialData = await db.query.rol.findMany({
        where: eq(rol.estado, "activo"),
      });
      return initialData;
    },
  });
  if (id && (isLoading || isLoadingRoles)) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return <Form data={data} roles={roles} />;
}
