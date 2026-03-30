import { useMemo } from "react";

import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  BookOpen,
  Car,
  ChevronLeft,
  ChevronRight,
  Pen,
  Plus,
  User,
  Users,
} from "lucide-react";

import { useSearchParams } from "wouter";
import { useActions } from "./useActions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CronogramaMes() {
  const { useGetCronogramaMes, handleCreate } = useActions();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Lógica de Fechas
  const mesParam = searchParams.get("mes");
  const fechaReferencia = mesParam ? parseISO(mesParam + "-01") : new Date();

  // Calculamos los bordes del mes
  const inicioMes = startOfMonth(fechaReferencia);
  const finMes = endOfMonth(fechaReferencia);

  // Calculamos los bordes del "Calendario Visible" (desde el domingo anterior hasta el sábado siguiente)
  const inicioCalendario = startOfWeek(inicioMes, { weekStartsOn: 0 }); // 0 = Domingo
  const finCalendario = endOfWeek(finMes, { weekStartsOn: 0 });

  // Array con todos los días que se pintarán en la cuadrícula (siempre serán 28, 35 o 42 días)
  const diasCalendario = useMemo(
    () =>
      eachDayOfInterval({
        start: inicioCalendario,
        end: finCalendario,
      }),
    [inicioCalendario, finCalendario],
  );

  // Strings para la consulta Drizzle
  const fInicioQuery = format(inicioCalendario, "yyyy-MM-dd");
  const fFinQuery = format(finCalendario, "yyyy-MM-dd");

  // 2. Traer Datos
  const { data: eventos } = useGetCronogramaMes({
    fInicio: fInicioQuery,
    fFin: fFinQuery,
  });

  // 3. Funciones de Navegación
  const cambiarMes = (direccion: "ant" | "sig") => {
    const nuevaFecha =
      direccion === "ant"
        ? subMonths(fechaReferencia, 1)
        : addMonths(fechaReferencia, 1);

    const params = new URLSearchParams(searchParams);
    params.set("mes", format(nuevaFecha, "yyyy-MM")); // Guardamos solo año y mes en la URL
    setSearchParams(params, { replace: true });
  };

  // Función para indexar rápido (Tú puedes mejorar esta UI luego)
  const obtenerEventosDelDia = (fechaStr: string) => {
    if (!eventos) return { t: [], p: [], e: [] };
    return {
      t: eventos.teoricas.filter((c) => c.fechaExacta === fechaStr),
      p: eventos.practicas.filter((c) => c.fechaExacta === fechaStr),
      e: eventos.examenes.filter((ex) => ex.fechaExacta === fechaStr),
    };
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* CABECERA Y CONTROLES */}
      <div className="flex justify-between items-center">
        <div>
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
              <div className="flex gap-1 text-xs">
                <button
                  onClick={() => cambiarMes("ant")}
                  className="p-1 border rounded-md hover:bg-secondary aspect-square grid place-content-center"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete("mes"); // Volver a hoy
                    setSearchParams(params);
                  }}
                  className="px-4 py-1 border rounded-md hover:bg-secondary text-xs font-medium"
                >
                  Mes Actual
                </button>
                <button
                  onClick={() => cambiarMes("sig")}
                  className="p-1 border rounded-md hover:bg-secondary aspect-square grid place-content-center"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* EL BOTÓN FUERA PARA EL EXAMEN */}
        <button
          onClick={() => {
            // Aquí abres tu Modal para programar examen
            console.log("Abrir modal de nuevo evento/examen");
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 text-sm cursor-pointer"
        >
          <Plus size={18} />
          Programar Examen
        </button>
      </div>

      {/* DÍAS DE LA SEMANA (Cabecera del calendario) */}
      <div className="grid grid-cols-7 text-center font-medium text-sm text-gray-500 ">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dia) => (
          <div key={dia} className="py-2">
            {dia}
          </div>
        ))}
      </div>

      {/* CUADRÍCULA DEL CALENDARIO */}
      {/* Truco de bordes: El contenedor tiene Top y Left. Los hijos tienen Bottom y Right. */}
      <div className="grid grid-cols-7 border-t border-l border-border bg-card">
        {diasCalendario.map((diaObj) => {
          const fechaStr = format(diaObj, "yyyy-MM-dd");
          const esDelMesActual = isSameMonth(diaObj, fechaReferencia);
          const esHoy = isToday(diaObj);

          const eventosHoy = obtenerEventosDelDia(fechaStr);
          const hayEventos =
            eventosHoy.t.length > 0 ||
            eventosHoy.p.length > 0 ||
            eventosHoy.e.length > 0;

          return (
            <div
              key={fechaStr}
              // min-h-32 (128px) te da un cuadrado decente
              className={`min-h-28 min-w-16 border-b border-r border-border p-1 transition-colors
                ${esDelMesActual ? "bg-card" : "bg-secondary/30 text-muted-foreground"}
                ${hayEventos ? "cursor-pointer hover:bg-secondary/50" : ""}
              `}
              /* onClick={() => {
                if (hayEventos) {
                  // Aquí abres tu mini-resumen modal o panel lateral
                  console.log("Ver resumen del día", fechaStr, eventosHoy);
                }
              }} */
            >
              {/* Número del día */}
              <div className="flex justify-between items-start text-xs">
                <span
                  className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full 
                  ${esHoy ? "bg-blue-600 text-white" : ""}
                `}
                >
                  {format(diaObj, "d")}
                </span>
              </div>

              {/* AQUI RENDERIZAS TUS CLASES (Minutos/Eventos) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mt-2 flex flex-col gap-1 text-[10px] leading-tight">
                    {/* Indicador de Examenes */}
                    {eventosHoy.e.map((ex) => (
                      <div
                        key={ex.id}
                        className="bg-red-500/10 text-red-600 border border-red-500/20 px-1 py-0.5 rounded truncate"
                      >
                        📝 {ex.titulo}
                      </div>
                    ))}

                    {/* Indicador Teoría */}
                    {eventosHoy.t.map((te) => (
                      <div
                        key={te.id}
                        className="border px-1 pl-2.5 py-0.5 rounded flex gap-2 items-center relative justify-between"
                      >
                        <div className="absolute left-0.5 w-0.5 h-4/5 bg-orange-600 rounded-full"></div>
                        <span className="text-muted-foreground">
                          {te.curso?.nombreCurso}
                        </span>
                        <span className="whitespace-nowrap font-semibold">
                          {`${te.horaInicio}-${te.horaFin}`}
                        </span>
                      </div>
                    ))}
                    {eventosHoy.p.map((te) => (
                      <div
                        key={te.id}
                        className="border px-1 pl-2.5 py-0.5 rounded flex gap-2 items-center relative justify-between"
                      >
                        <div className="absolute left-0.5 w-0.5 h-4/5 bg-blue-600 rounded-full"></div>
                        <span className="text-muted-foreground">Practico</span>
                        <span className="whitespace-nowrap font-semibold">
                          {`${te.horaInicio}-${te.horaFin}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  align="center"
                  side="right"
                  className="p-0 border rounded-xl shadow-lg bg-card dark:bg-background text-card-foreground min-w-70 max-w-[320px] overflow-hidden"
                >
                  {/* Cabecera del Tooltip */}
                  <div className="bg-secondary/20 px-4 py-3 border-b flex items-center justify-between">
                    <div>
                      <h3 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">
                        Cronograma
                      </h3>
                      <h2 className="text-sm font-semibold capitalize">
                        {format(diaObj, "EEEE d 'de' MMMM", { locale: es })}
                      </h2>
                    </div>
                  </div>

                  {/* Cuerpo con Scroll si hay muchas clases */}
                  <div className="max-h-75 overflow-y-auto p-2 flex flex-col gap-1">
                    {/* 1. EXÁMENES (Prioridad Alta) */}
                    {eventosHoy.e.map((ex) => (
                      <div
                        key={ex.id}
                        className="flex flex-col gap-1 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                            <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                              {ex.titulo}
                            </span>
                          </div>
                          {/* Botón de editar (solo visible al pasar el mouse) */}
                          <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <Pen size={14} />
                          </button>
                        </div>
                        <div className="text-xs text-muted-foreground pl-4">
                          <span className="font-medium text-foreground">
                            {ex.tipoExamen}
                          </span>{" "}
                          • {ex.curso?.nombreCurso}
                        </div>
                      </div>
                    ))}

                    {/* 2. CLASES TEÓRICAS */}
                    {eventosHoy.t.map((te) => (
                      <div
                        key={te.id}
                        className="flex flex-col gap-1 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></div>
                          <span className="text-sm font-semibold">
                            {te.horaInicio} - {te.horaFin}
                          </span>
                        </div>

                        <div className="pl-4 flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-xs">
                            <Users
                              size={14}
                              className="text-muted-foreground shrink-0"
                            />
                            <span className="font-medium">Teoría Grupal</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <BookOpen size={14} className="shrink-0 mt-0.5" />
                            <span className="leading-tight">
                              {te.curso?.nombreCurso}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* 3. CLASES PRÁCTICAS */}
                    {eventosHoy.p.map((pr) => {
                      // Extraemos el nombre del estudiante si existe
                      const nombreEstudiante = pr.inscripcion?.estudiante
                        ?.persona
                        ? `${pr.inscripcion.estudiante.persona.nombres} ${pr.inscripcion.estudiante.persona.primerApellido}`
                        : "Estudiante no asignado";

                      return (
                        <div
                          key={pr.id}
                          className="flex flex-col gap-1 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                            <span className="text-sm font-semibold">
                              {pr.horaInicio} - {pr.horaFin}
                            </span>
                          </div>

                          <div className="pl-4 flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-xs">
                              <User
                                size={14}
                                className="text-muted-foreground shrink-0"
                              />
                              <span
                                className="font-medium truncate"
                                title={nombreEstudiante}
                              >
                                {nombreEstudiante}
                              </span>
                            </div>
                            {/* Si tienes el dato del vehículo en la query, podrías mostrarlo aquí */}
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Car size={14} className="shrink-0 mt-0.5" />
                              <span className="leading-tight">
                                Práctica de Conducción
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Mensaje de día vacío (si no hay nada) */}
                    {eventosHoy.e.length === 0 &&
                      eventosHoy.t.length === 0 &&
                      eventosHoy.p.length === 0 && (
                        <div className="text-center py-6 text-sm text-muted-foreground">
                          No hay clases ni eventos programados.
                        </div>
                      )}
                  </div>

                  {/* Pie del Tooltip con el Botón */}
                  <div className="p-2 border-t bg-secondary/20">
                    <button
                      onClick={() => {
                        handleCreate({ fecha: format(diaObj, "yyyy-MM-dd") });
                      }}
                      className="w-full flex items-center justify-center gap-2 py-1.5 bg-background border rounded-md text-xs font-medium hover:bg-secondary transition-colors"
                    >
                      <Plus size={14} />
                      Agregar Evento
                    </button>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
}
