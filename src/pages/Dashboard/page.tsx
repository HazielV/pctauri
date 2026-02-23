import { useQuery } from "@tanstack/react-query";
import { RiSearch2Line } from "@remixicon/react";
import { Link, useLocation, useSearch, useSearchParams } from "wouter";
import {
  ChevronDown,
  Contact,
  MoreHorizontal,
  MoveRight,
  PenLine,
  PlusIcon,
  Search,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BusquedaTabla,
  Contendor,
  ContenedorTabla,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/contenido";

import Paginacion from "@/components/Paginacion";
import * as React from "react";

interface paciente {
  id: number;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  fechaIngreso: string;
  estado: string;
}
interface ResPag<T> {
  data: T[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}

export const getPacientesData = async (page: number, perPage: number) => {
  // Simulamos un pequeño retraso de red/disco para probar los estados de carga (loading)
  await new Promise((resolve) => setTimeout(resolve, 500));

  const totalSimulado = 50; // Supongamos que hay 50 pacientes en total

  // Generamos datos de prueba dinámicos según la página
  const mockData = Array.from({ length: perPage })
    .map((_, i) => {
      const id = (page - 1) * perPage + i + 1;

      // Evitamos generar más de los 50 totales
      if (id > totalSimulado) return null;

      return {
        id: id,
        nombres: `Paciente de Prueba ${id}`,
        email: `paciente${id}@ejemplo.com`,
        fechaNacimiento: new Date().toISOString(),
      };
    })
    .filter(Boolean); // Limpiamos los nulos

  return {
    data: mockData,
    meta: {
      totalItems: totalSimulado,
      pageCount: Math.ceil(totalSimulado / perPage),
      currentPage: page,
      perPage: perPage,
    },
  };
};
export default function Page() {
  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perpage") || "10");
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pacientes", page, perPage], // Si esto cambia, se refetchea
    queryFn: () => getPacientesData(page, perPage),
    // Útil para que la tabla no "parpadee" al paginar
  });

  if (isLoading) return <div>Cargando pacientes desde SQLite...</div>;
  if (isError) return <div>Error: {(error as Error).message}</div>;

  // Ahora pacientes y meta vienen de 'data'
  const { data: pacientes, meta } = data;
  return (
    <Contendor>
      <div className="flex justify-end py-2 pb-4">
        <Link href={"pacientes/nuevo"}>
          <button className="flex gap-3 p-2.5 pl-3 pr-4.5 items-center font-medium text-xs bg-blue-500 hover:bg-blue-600 rounded-2xl text-white cursor-pointer hover:shadow-md transition ">
            <PlusIcon size={16} absoluteStrokeWidth strokeWidth={"2"} />
            <span>Nuevo usuario</span>
          </button>
        </Link>
      </div>
      <ContenedorTabla>
        <BusquedaTabla>
          <div className="flex flex-1 items-center gap-2 text-gray-400 relative  group focus-within:text-blue-600 dark:focus-within:text-blue-300">
            <input
              id="search-params"
              type="text"
              placeholder="Buscar o filtrar..."
              className="text-xs py-3.5 outline-none ps-6 text-black dark:text-gray-200 placeholder:text-gray-400 peer w-full"
            />
            <RiSearch2Line
              size={14}
              className="absolute pointer-events-none group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors peer-placeholder-shown:text-gray-400 peer-hover:text-blue-600 text-blue-600 dark:text-blue-300 dark:peer-hover:text-blue-300"
            />
          </div>

          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto text-xs">
                  Estado <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Activo</DropdownMenuLabel>
                <DropdownMenuItem>Inactivo</DropdownMenuItem>
                <DropdownMenuItem>Otro</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </BusquedaTabla>

        <Table>
          <TableHeader>
            <TableRow className="text-left text-xs font-medium text-gray-400 border-t border-gray-200 *:px-5 *:py-3.5">
              <TableCell className="">Id</TableCell>
              <TableCell>Nombre(s)</TableCell>
              <TableCell>Apellido(s)</TableCell>
              <TableCell>Fecha Nacimiento</TableCell>
              <TableCell>Fecha Ingreso</TableCell>
              <TableCell>Expediente </TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pacientes.map((pac) => (
              <TableRow
                className="font-medium text-gray-600 border-t border-b last:border-b-0 *:px-5 *:py-3.5 border-gray-200"
                key={pac.id}
              >
                <TableCell>{pac.id}</TableCell>
                <TableCell>{pac.nombres}</TableCell>
                <TableCell>{pac.apellidos}</TableCell>
                <TableCell>{pac.fechaNacimiento}</TableCell>
                <TableCell>{pac.fechaIngreso}</TableCell>
                <TableCell>
                  {/* <Link
                    href={{
                      pathname: 'pacientes/expediente',
                      query: { id: pac.id },
                    }}
                  >
                    <button className="flex text-xs whitespace-nowrap gap-2 items-center bg-gray-50 px-2.5 py-1 rounded-lg hover:text-blue-600 cursor-pointer group shadow">
                      <span>Ver</span>
                      <MoveRight
                        size={18}
                        className="transition group-hover:translate-x-0.5"
                      />
                    </button>
                  </Link> */}
                </TableCell>
                <TableCell className="flex">
                  <div className="text-xs rounded-full p-[3px] px-2 bg-emerald-50 text-emerald-700 text-center border-[0.5px] border-emerald-700/10 cursor-default w-auto min-w-[60px] ">
                    {pac.estado}
                  </div>
                </TableCell>
                <TableCell>
                  <div className=" flex gap-2 h-auto">
                    {/* <Link
                      href={{
                        pathname: `pacientes/editar`,
                        query: { id: pac.id },
                      }}
                    >
                      <button>
                        <PenLine
                          size={17}
                          className="cursor-pointer hover:text-black bg"
                        />
                      </button>
                    </Link> */}

                    <Trash2
                      size={17}
                      className="cursor-pointer hover:text-black"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ContenedorTabla>
      <Paginacion total={10} actual={1} className="mx-8" />
    </Contendor>
  );
}
