import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db/client";
import FormClase from "./formClase";

export function LoaderClase({
  cursoId,
  fecha,
  claseId,
  tipoClase,
  inscripcionId,
  data,
}: any) {
  const { data: catalogos, isLoading: isLoadingCatalogos } = useQuery({
    queryKey: ["catalogos_data", "METODO_PAGO", "TIPO_ACADEMICO"],
    queryFn: async () => {
      const data = await db.query.catalogo.findMany({
        where: (t, { eq, or }) =>
          or(eq(t.categoria, "METODO_PAGO"), eq(t.categoria, "TIPO_ACADEMICO")),
      });
      return data;
    },
  });
  const { data: estados, isLoading: isLoadingEstados } = useQuery({
    queryKey: ["estados_data", "ESTADO_ACADEMICO", "ESTADO_INSCRIPCION"],
    queryFn: async () => {
      const data = await db.query.estado.findMany({
        where: (t, { eq, or }) =>
          or(
            eq(t.categoria, "ESTADO_ACADEMICO"),
            eq(t.categoria, "ESTADO_INSCRIPCION"),
          ),
      });
      return data;
    },
  });
  if (isLoadingCatalogos || isLoadingEstados) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  return (
    <FormClase
      cursoId={cursoId}
      data={data}
      inscripcionId={inscripcionId}
      fecha={fecha}
      claseId={claseId}
      tipoClase={tipoClase}
      catalogos={catalogos}
      estados={estados}
    />
  );
}
