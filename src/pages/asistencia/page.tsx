import { Link, useSearchParams } from "wouter";

import {
  Contendor,
  ContenedorTabla,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/contenido";

import { useActions } from "./useActions";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Clock,
  Clock4,
  Plus,
  X,
} from "lucide-react";

import {
  addDays,
  startOfWeek,
  endOfWeek,
  format,
  isBefore,
  eachWeekOfInterval,
  parseISO,
  subWeeks,
  addWeeks,
  isWithinInterval,
} from "date-fns";
import { es } from "date-fns/locale";
import { useMemo } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { inscripcion } from "@/db/schema";
const mapaDias: Record<string, string> = {
  lunes: "LUNES",
  martes: "MARTES",
  miércoles: "MIERCOLES", // Mapeas con tilde a sin tilde si es necesario
  jueves: "JUEVES",
  viernes: "VIERNES",
  sábado: "SABADO",
  domingo: "DOMINGO",
};

export default function Page() {
  const { useGetData, handleAsignarClase, handleLlenarAsistencia } =
    useActions();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perpage") || "10");
  const semanaParam = searchParams.get("semana");
  const fechaReferencia = semanaParam ? parseISO(semanaParam) : new Date();

  const inicioSemana = startOfWeek(fechaReferencia, { weekStartsOn: 0 });
  const finSemana = endOfWeek(fechaReferencia, { weekStartsOn: 0 });

  const labelSemana = `${format(inicioSemana, "dd MMM", { locale: es })} - ${format(finSemana, "dd MMM", { locale: es })}`;
  const cambiarSemana = (direccion: "ant" | "sig") => {
    const nuevaFecha =
      direccion === "ant"
        ? subWeeks(fechaReferencia, 1)
        : addWeeks(fechaReferencia, 1);

    const params = new URLSearchParams(searchParams);
    // Guardamos el lunes de esa semana en la URL
    params.set("semana", format(nuevaFecha, "yyyy-MM-dd"));
    setSearchParams(params, { replace: true });
  };

  const updateFiltro = (clave: string, valor: string) => {
    const params = new URLSearchParams(searchParams);
    if (valor && valor !== "0") params.set(clave, valor);
    else params.delete(clave);
    setSearchParams(params, { replace: true });
  };
  const diasSemanaArray = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(inicioSemana, i);
      return format(d, "yyyy-MM-dd");
    });
  }, [inicioSemana]);
  const fInicio = format(inicioSemana, "yyyy-MM-dd");
  const fFin = format(finSemana, "yyyy-MM-dd");

  const {
    data: matriz,
    isLoading: loadingMatriz,
    isFetching: fetchingMatriz,
  } = useGetData({
    fInicio: fInicio,
    fFin: fFin,
    page,
    perPage,
  });

  const mapaTeoria = useMemo(() => {
    const map = new Map();
    matriz?.clasesTeoricas?.forEach((clase) => {
      map.set(`${clase.cursoId}-${clase.fechaExacta}`, clase);
    });
    return map;
  }, [matriz?.clasesTeoricas]);

  // Indexamos las clases PRÁCTICAS por inscripcionId + fecha (porque son individuales)
  const mapaPractica = useMemo(() => {
    const map = new Map();
    matriz?.clasesPracticas?.forEach((clase) => {
      map.set(`${clase.inscripcionId}-${clase.fechaExacta}`, clase);
    });
    return map;
  }, [matriz?.clasesPracticas]);

  // Indexamos las ASISTENCIAS por inscripcionId + (claseTeoricaId O clasePracticaId)
  const mapaAsistencias = useMemo(() => {
    const map = new Map();
    matriz?.asistencias?.forEach((asist) => {
      const key = asist.claseTeoricaId
        ? `T-${asist.inscripcionId}-${asist.claseTeoricaId}`
        : `P-${asist.inscripcionId}-${asist.clasePracticaId}`;
      map.set(key, asist);
    });
    return map;
  }, [matriz?.asistencias]);

  return (
    <Contendor>
      {/* contenido */}
      <div className="flex flex-col gap-2 relative">
        <ScrollArea className="pb-3">
          <ContenedorTabla>
            <div className="flex p-3 gap-4 items-center justify-between">
              {/* calendario */}
              <div className="flex gap-4">
                <div className="grid bg-secondary/40 text-center  font-medium rounded-md place-content-center justify-center items-center border border-border/80">
                  <div className="text-primary/65 text-xs p-1">
                    {format(fechaReferencia, "MMM", { locale: es })}
                  </div>
                  <div className="bg-background text-sm border border-primary/25 rounded-md p-1 px-6 -mx-px">
                    {format(fechaReferencia, "d")}
                  </div>
                </div>
                <div className="grid ">
                  <div className="text-lg capitalize  font-semibold">
                    {format(fechaReferencia, "MMMM yyyy", { locale: es })}
                  </div>
                  <div className="text-sm text-primary/60 capitalize ">
                    {format(inicioSemana, "MMM d, yyyy", { locale: es })} -{" "}
                    {format(finSemana, "MMM d, yyyy", { locale: es })}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  onClick={() => cambiarSemana("ant")}
                  size={"icon"}
                  variant={"outline"}
                >
                  <ChevronLeft />
                </Button>
                <Button variant={"outline"}>semana actual</Button>
                <Button
                  onClick={() => cambiarSemana("sig")}
                  size={"icon"}
                  variant={"outline"}
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
            <Table className="">
              <TableHeader>
                <TableRow className="text-left text-xs font-medium text-gray-400 border-t border-gray-200 *:px-5 *:py-3.5">
                  <TableCell rowSpan={2} className="border-r w-36">
                    Nombre del estudiante
                  </TableCell>

                  <TableCell colSpan={7} className="text-center">
                    <span className="uppercase">Asistencia</span>
                  </TableCell>
                </TableRow>
                <TableRow className="text-center text-xs font-medium text-gray-400 border-t border-gray-200 *:px-5 *:py-3.5 uppercase">
                  {diasSemanaArray.map((fecha) => {
                    const fechaObj = new Date(fecha + "T00:00:00");
                    const esHoy = fecha === format(new Date(), "yyyy-MM-dd");

                    return (
                      <TableCell
                        key={fecha}
                        className={`w-24 border-r last:border-r-0 ${esHoy ? " text-primary" : ""}`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {/* Nombre del día (lun, mar...) */}
                          <span>
                            {format(fechaObj, "EEEE", { locale: es })}
                          </span>
                          {/* Número del día (9, 10...) */}
                          <span
                            className={`text-sm font-medium text-primary/70`}
                          >
                            {format(fechaObj, "d")}
                          </span>
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHeader>

              <TableBody>
                {loadingMatriz && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      Cargando datos de asistencia...
                    </TableCell>
                  </TableRow>
                )}

                {matriz?.inscripciones.map((ins) => {
                  const diasTeoriaConfig = new Set(
                    ins.curso?.horarioPlantillas?.map((h: any) =>
                      h.diaSemana.toUpperCase(),
                    ) || [],
                  );

                  return (
                    <TableRow key={ins.id} className="">
                      <TableCell className="border-r font-medium  z-10 min-w-45">
                        <div className="text-sm leading-none mb-1">
                          {`${ins.estudiante.persona.nombres} ${ins.estudiante.persona.primerApellido}`}
                        </div>
                        <div className="text-[10px] text-foreground/50 uppercase font-bold tracking-tighter">
                          {ins.curso.nombreCurso}
                        </div>
                      </TableCell>

                      {/* COLUMNAS DE DÍAS (0-6) */}
                      {diasSemanaArray.map((fechaDia) => {
                        const fechaObj = new Date(fechaDia + "T00:00:00");
                        const diaSemana = format(fechaObj, "EEEE", {
                          locale: es,
                        }).toLowerCase();
                        const nombreDiaDB =
                          mapaDias[diaSemana] || diaSemana.toUpperCase();

                        // 1. Buscamos clases en los Mapas (O(1) performance)
                        const claseT = mapaTeoria.get(
                          `${ins.cursoId}-${fechaDia}`,
                        );
                        const claseP = mapaPractica.get(
                          `${ins.id}-${fechaDia}`,
                        );
                        const fechaActualObj = new Date(fechaDia + "T00:00:00");
                        const inicioInscripcionObj = new Date(
                          ins.fechaInicio + "T00:00:00",
                        );
                        const finInscripcionObj = new Date(
                          ins.fechaFin + "T00:00:00",
                        );

                        const estaEnRangoInscripcion = isWithinInterval(
                          fechaActualObj,
                          {
                            start: inicioInscripcionObj,
                            end: finInscripcionObj,
                          },
                        );

                        // 2. ¿El horario oficial (contrato) dice que debería estar aquí?
                        const esDiaTeoriaOficial =
                          estaEnRangoInscripcion &&
                          diasTeoriaConfig.has(nombreDiaDB);
                        const plantillaDelDia =
                          ins.curso?.horarioPlantillas?.find(
                            (h: any) =>
                              h.diaSemana.toUpperCase() === nombreDiaDB,
                          );

                        // 3. LA NUEVA REGLA: Tiene clase si hay un registro físico (T o P) O si el contrato lo exige
                        const tieneClase =
                          !!claseT || !!claseP || esDiaTeoriaOficial;

                        if (!tieneClase) {
                          return (
                            <TableCell
                              key={fechaDia}
                              className="bg-secondary/30 hover:bg-secondary/5 cursor-pointer transition border-r border-dashed p-10! relative"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  handleAsignarClase({
                                    inscripcionId: ins.id,
                                    fechaActual: fechaDia,
                                    tipo: "clase",
                                  })
                                }
                              >
                                <div className="absolute group inset-0 flex items-center justify-center  w-full h-full">
                                  <Plus
                                    size={22}
                                    strokeWidth={2}
                                    className="text-primary/35 group-hover:text-primary"
                                  />
                                </div>
                              </button>
                            </TableCell>
                          );
                        }

                        return (
                          <TableCell
                            key={fechaDia}
                            className="text-center border-r border-dashed  
                             p-0! "
                          >
                            <div className="flex flex-col items-center gap-2 p-1">
                              {(claseT || esDiaTeoriaOficial) && (
                                <IconoAsistencia
                                  onClick={() => {
                                    if (claseT) {
                                      const asis = mapaAsistencias.get(
                                        `T-${ins.id}-${claseT.id}`,
                                      );
                                      handleLlenarAsistencia({
                                        fecha: fechaDia,
                                        claseId: claseT.id,
                                        tipoClase: "T",
                                        inscripcionId: ins.id,
                                        data: asis || null,
                                      });
                                    }
                                  }}
                                  tipo="T"
                                  clase={claseT}
                                  fallbackInicio={plantillaDelDia?.horaInicio}
                                  fallbackFin={plantillaDelDia?.horaFin}
                                  asistencia={
                                    claseT
                                      ? mapaAsistencias.get(
                                          `T-${ins.id}-${claseT.id}`,
                                        )
                                      : null
                                  }
                                />
                              )}

                              {claseP && (
                                <IconoAsistencia
                                  onClick={() => {
                                    const asis = mapaAsistencias.get(
                                      `P-${ins.id}-${claseP.id}`,
                                    );
                                    handleLlenarAsistencia({
                                      fecha: fechaDia,
                                      claseId: claseP.id,
                                      tipoClase: "P",
                                      inscripcionId: ins.id,
                                      data: asis || null,
                                    });
                                  }}
                                  tipo="P"
                                  clase={claseP}
                                  asistencia={mapaAsistencias.get(
                                    `P-${ins.id}-${claseP.id}`,
                                  )}
                                />
                              )}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ContenedorTabla>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </Contendor>
  );
}
const IconoAsistencia = ({
  tipo,
  clase,
  asistencia,
  fallbackInicio,
  fallbackFin,
  ...props
}: any) => {
  const horaInicio = clase?.horaInicio || fallbackInicio || "--:--";
  const horaFin = clase?.horaFin || fallbackFin || "--:--";
  return (
    <div
      {...props}
      className={`flex flex-1  items-center justify-center w-full p-1 py-1 rounded border relative overflow-hidden cursor-pointer group${
        !clase ? "  opacity-50" : ""
      }`}
    >
      {tipo === "T" ? (
        <div className="flex-1 flex flex-col justify-start items-start px-2">
          <div className="w-1 bg-blue-700 h-full absolute transition-all top-0 left-0 z-5"></div>
          <span className="z-10  group-hover:z-100">Teorico </span>
          <span className="z-10  group-hover:z-100">{`${horaInicio} - ${horaFin}`}</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-start items-start px-2">
          <div className="w-1 bg-violet-700 h-full absolute top-0   left-0 transition-all"></div>
          <span className="z-10  group-hover:z-100 ">Practico </span>
          <span className="z-10  group-hover:z-100">
            {`${horaInicio} - ${horaFin}`}
          </span>
        </div>
      )}

      <div className="absolute top-1 right-1">
        {!clase ? (
          <CircleDashed size={14} className="text-slate-300 animate-pulse" />
        ) : !asistencia ? (
          <Clock size={14} className="text-blue-400" />
        ) : asistencia.estadoAsistencia === "PRESENTE" ? (
          <CheckCircle size={14} className="text-emerald-500" />
        ) : asistencia.estadoAsistencia === "REPROGRAMADA" ? (
          <Clock4 size={14} className="text-yellow-500" />
        ) : (
          <X size={14} className="text-rose-500" />
        )}
      </div>
    </div>
  );
};
