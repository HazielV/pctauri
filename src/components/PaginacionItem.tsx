import { cn } from "@/lib/utils";
import { ChevronsLeft, ChevronsRight, Ellipsis } from "lucide-react";
import { useSearchParams } from "wouter";
export default function PaginacionItem({
  pagina,
  actual,
}: {
  pagina: number;
  actual: number;
}) {
  const [_, setSearchParams] = useSearchParams();

  const handlePageChange = () => {
    // Solo actualizamos el parámetro 'page', manteniendo los demás
    setSearchParams((prev) => {
      prev.set("page", pagina.toString());
      return prev;
    });
  };

  const isvalid = pagina != -1 && pagina != 0;
  /* const query_page = isvalid ? pagina : pagina === -1 ? actual - 3 : actual + 3; */
  return (
    <div
      onClick={handlePageChange}
      className={cn(
        "w-10 h-10 font-medium grid place-items-center bg-background dark:bg-secondary rounded-full cursor-pointer shadow transform duration-200 hover:-translate-y-1 group",
        actual === pagina &&
          isvalid &&
          "bg-blue-600 text-blue-50 dark:bg-blue-600"
      )}
    >
      {isvalid ? pagina : <DotElement pagina={pagina} />}
    </div>
  );
}
const DotElement = ({ pagina }: { pagina: number }) => {
  return (
    <div>
      {pagina === -1 ? (
        <div className=" ">
          <ChevronsLeft size={20} className="hidden group-hover:block" />
          <Ellipsis size={20} className="block group-hover:hidden" />
        </div>
      ) : (
        <div className=" ">
          <Ellipsis size={20} className="block group-hover:hidden" />
          <ChevronsRight size={20} className="hidden group-hover:block" />
        </div>
      )}
    </div>
  );
};
