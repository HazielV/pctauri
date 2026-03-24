import { RiSearch2Line } from "@remixicon/react";
import { useSearchParams } from "wouter";
import {
  ChevronDown,
  CircleCheckBig,
  PenLine,
  PlusIcon,
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
  TableHeader,
  TableRow,
} from "@/components/contenido";

import Paginacion from "@/components/Paginacion";

import { useActions } from "./useActions";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function Page() {
  const { handleCreate, handleEdit, handleToggleStatus, useGetData } =
    useActions();

  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perpage") || "10");
  const { data, isLoading, isError } = useGetData(page, perPage);

  if (isLoading) return <div>Cargando...</div>;
  if (isError || !data) return <div>Error o sin datos</div>;

  const { data: roles, meta } = data;
  return (
    <Contendor>
      <div className="flex justify-end py-2 pb-4">
        <button
          onClick={handleCreate}
          className="flex gap-3 p-2.5 pl-3 pr-4.5 items-center font-medium text-xs bg-blue-500 hover:bg-blue-600 rounded-2xl text-white cursor-pointer hover:shadow-md transition "
        >
          <PlusIcon size={16} absoluteStrokeWidth strokeWidth={"2"} />
          <span>Nuevo rol</span>
        </button>
      </div>
      <ScrollArea className="pb-3">
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
                <TableCell>Nombre rol</TableCell>
                <TableCell>Descripcion</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {roles.map((data, index) => (
                <TableRow
                  className="font-medium text-gray-600 border-t border-b last:border-b-0 *:px-5 *:py-3.5 border-gray-200"
                  key={index}
                >
                  <TableCell>{data.id}</TableCell>
                  <TableCell>{data.nombre}</TableCell>
                  <TableCell>{data.descripcion}</TableCell>

                  <TableCell className="flex">
                    <div className="text-xs rounded-full p-0.75 px-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-800/20 dark:text-emerald-300 text-center border-[0.5px] border-emerald-700/10 cursor-default w-auto min-w-15 ">
                      {data.estado}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {data.estado === "activo" && (
                        <button
                          onClick={() => handleEdit(data.id)}
                          className=" flex gap-2 h-auto"
                        >
                          <PenLine
                            size={17}
                            className="cursor-pointer hover:text-green-400"
                          />
                        </button>
                      )}
                      {data.estado === "activo" && (
                        <button
                          onClick={() =>
                            handleToggleStatus(data.id, data.estado)
                          }
                          className=" flex gap-2 h-auto"
                        >
                          <Trash2
                            size={17}
                            className="cursor-pointer hover:text-red-400"
                          />
                        </button>
                      )}
                      {data.estado === "inactivo" && (
                        <button
                          onClick={() =>
                            handleToggleStatus(data.id, data.estado)
                          }
                          className=" flex gap-2 h-auto"
                        >
                          <CircleCheckBig
                            size={17}
                            className="cursor-pointer hover:text-green-400"
                          />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ContenedorTabla>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Paginacion
        total={meta.totalItems}
        actual={meta.currentPage}
        className="mx-8"
        perPage={perPage}
      />
    </Contendor>
  );
}
