import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "./form";
import { db } from "@/db/client";
import { estado } from "@/db/schema";

export function LoaderForm({ id }: { id?: string }) {
  const { data: roles, isLoading: loadingRoles } = useQuery({
    queryKey: ["roles-activos"],
    queryFn: () =>
      db.query.rol.findMany({
        where: (rol, { eq }) =>
          eq(rol.estado_id, "677a02b3-38ca-4a24-9281-9e38b2d674e0"),
      }),
  });
  const { data: permisos, isLoading: loadingPermisos } = useQuery({
    queryKey: ["permisos-activos"],
    queryFn: () =>
      db.query.permiso.findMany({
        columns: {
          id: true,
          descripcion: true,
          valor: true,
          nombre: true,
        },
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
      }),
  });
  const { data: menus, isLoading: loadingMenus } = useQuery({
    queryKey: ["menus-activos"],
    queryFn: () =>
      db.query.menu.findMany({
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
      }),
  });

  const { data: recurso, isLoading: loadingRecurso } = useQuery({
    queryKey: ["recurso_data", id],
    queryFn: () =>
      db.query.recurso.findFirst({
        where: (recurso, { eq }) => eq(recurso.id, id!),
        with: {
          rolesRecursos: { with: { rol: true } },
          menu: true,
        },
      }),
    enabled: !!id,
  });

  const isLoading =
    loadingRoles || loadingMenus || loadingPermisos || (!!id && loadingRecurso);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <Form
      data={recurso}
      roles={roles || []}
      menus={menus || []}
      permisos={permisos || []}
    />
  );
}
