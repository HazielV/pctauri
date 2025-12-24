import { ChevronLeft, ChevronRight } from "lucide-react";
import { ComponentProps, useMemo } from "react";
import { useSearchParams } from "wouter";
import { cn } from "@/lib/utils";
import PaginacionItem from "./PaginacionItem";

interface props extends ComponentProps<"div"> {
  total?: number;
  actual?: number;
}
export default function Paginacion({
  total = 0,
  actual = 0,
  className,
}: props) {
  const [_, setSearchParams] = useSearchParams();

  const generarPaginas = (total: number, actual: number) => {
    total = Math.ceil(total / 10);
    const paginas: number[] = [];
    if (total < 8) {
      const inicio = 1;
      const fin = total;
      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }
      return paginas;
    }

    const delta = 1; // Muestra un elemento antes y uno después de la página actual

    paginas.push(1); // Siempre muestra la primera página

    // Mostrar "..." si la página actual es mayor a 4 (para evitar mostrar todas las primeras páginas)
    if (actual > delta + 3) {
      paginas.push(-1);
    } else {
      for (let i = 2; i < actual - delta; i++) {
        paginas.push(i);
      }
    }

    // Muestra páginas alrededor de la página actual
    const inicio = Math.max(2, actual - delta);
    const fin = Math.min(total - 1, actual + delta);
    if (actual > total - delta - 2) {
      for (let i = total - 4; i < actual - delta; i++) {
        paginas.push(i);
      }
    }
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    if (actual < delta + 3) {
      const aux = [];
      for (let i = 5; i > actual + delta; i--) {
        aux.push(i);
      }
      aux.reverse().forEach((element) => {
        paginas.push(element);
      });
    }

    // Mostrar "..." si la página actual está muy cerca del final
    if (actual < total - delta - 2) {
      paginas.push(0);
    } else {
      for (let i = total - 1; i > actual + delta; i--) {
        paginas.push(i);
      }
      /*  */
    }

    // Siempre muestra la última página si es mayor que 1
    if (total > 1) {
      paginas.push(total);
    }

    return paginas;
  };
  const setQueryParams = (page: number) => {
    setSearchParams((prev) => {
      prev.set("page", page.toString());
      return prev;
    });
  };

  const paginas = useMemo(() => generarPaginas(total, actual), [total, actual]);
  const anterior = actual > 1 ? actual - 1 : 1;
  const siguiente = actual < total ? actual + 1 : total;
  return (
    <div className={cn("", className)}>
      <ul className="flex gap-2 justify-center ">
        <div onClick={() => setQueryParams(anterior)}>
          <button
            className="bg-background dark:bg-secondary p-2.5  rounded-full disabled:bg-gray-200 disabled:text-gray-400 shadow transform duration-200 hover:-translate-y-1 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed disabled:hover:translate-y-0"
            disabled={actual === 1}
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        <div className="flex gap-1.5 text-sm">
          {paginas.map((pagina, index) => (
            <PaginacionItem actual={actual} pagina={pagina} key={index} />
          ))}
        </div>
        <div onClick={() => setQueryParams(siguiente)}>
          <button
            className="bg-background dark:bg-secondary p-2.5  rounded-full disabled:bg-gray-200 disabled:text-gray-400 shadow transform duration-200 hover:-translate-y-1 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed disabled:hover:translate-y-0"
            disabled={actual === total}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </ul>
    </div>
  );
}
