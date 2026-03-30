import { useQuery } from "@tanstack/react-query";
/* import { useStudentMutation } from "@/hooks/useStudentMutation"; */

import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "./form";
import { db } from "@/db/client";
import { menu, rol } from "@/db/schema";
import { eq } from "drizzle-orm";

export function LoaderForm({ id }: { id?: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["rol_data", id],
    queryFn: async () => {
      const initialData = await db.query.rol.findFirst({
        where: eq(rol.id, id!),
        with: {
          rolesMenus: true,
        },
      });
      return initialData;
    },
    enabled: !!id, // Solo ejecuta la query si hay un ID
  });
  const { data: menus, isLoading: isLoadingMenus } = useQuery({
    queryKey: ["menus_data", id],
    queryFn: async () => {
      const initialData = await db.query.menu.findMany({
        where: eq(menu.estado, "activo"),
      });
      return initialData;
    },
  });
  if (id && (isLoading || isLoadingMenus)) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return <Form data={data} menus={menus} />;
}
