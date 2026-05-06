import { useQuery } from "@tanstack/react-query";
/* import { useStudentMutation } from "@/hooks/useStudentMutation"; */

import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "./form";
import { db } from "@/db/client";
import { estado, usuario } from "@/db/schema";
import { eq } from "drizzle-orm";
/* import { and, eq } from "drizzle-orm"; */

export function LoaderForm({ id }: { id?: string }) {
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
        where: (t, { eq, and }) =>
          eq(
            t.estado_id,
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
      });
      return initialData;
    },
  });
  const { data: catalogos, isLoading: isLoadingCatalogos } = useQuery({
    queryKey: ["catalogos_data", id],
    queryFn: async () => {
      const initialData = await db.query.catalogo.findMany({
        where: (t, { eq, or }) =>
          or(eq(t.categoria, "TIPO_DOCUMENTO"), eq(t.categoria, "SEXO")),
      });
      return initialData;
    },
  });
  if (id && (isLoading || isLoadingRoles || isLoadingCatalogos)) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return <Form data={data} roles={roles} catalogos={catalogos} />;
}
