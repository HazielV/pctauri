import { useSearchParams, useParams } from "wouter";
import {
  CarFront,
  DollarSign,
  NotebookText,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Contendor } from "@/components/contenido";
import { useActions } from "./useActions";

export default function Page() {
  const {
    useGetData,
    finalizarInscripcionMutation,
    handleAbandonarIns,
    handleFinalizarIns,
  } = useActions();
  const [searchParams] = useSearchParams();
  const params = useParams();

  const estudianteId = Number(params.id);
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perpage") || "10");

  const { data, isLoading, isError } = useGetData(page, perPage, estudianteId);

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500">
        Cargando expediente...
      </div>
    );

  // 1. EXTRAEMOS DE FORMA SEGURA (Fallback a un arreglo vacío si viene un objeto raro)
  const inscripciones = Array.isArray(data?.inscripcion)
    ? data.inscripcion
    : [];

  // 2. VALIDAMOS USANDO NUESTRA VARIABLE SEGURA
  if (isError || !data || inscripciones.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        No se encontraron datos para este estudiante.
      </div>
    );
  }

  // 3. AHORA TYPESCRIPT SABE QUE 'inscripciones' ES UN ARREGLO Y TIENE AL MENOS 1 ELEMENTO
  const estudiante = inscripciones[0].estudiante;
  const persona = estudiante.persona;
  return (
    <Contendor>
      {/* HEADER DEL ESTUDIANTE */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary capitalize tracking-tight">
          {`${persona.nombres} ${persona.primerApellido} ${persona.segundoApellido || ""}`}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Estudiante ID: #{estudiante.id} | CI: {persona.nroDocumento}
        </p>
      </div>

      {/* TARJETAS DE INSCRIPCIÓN (CURSOS) */}
      <div className="space-y-6">
        {inscripciones.map((ins: any) => {
          console.log(ins);
          // Extraemos los cálculos que haremos en el backend/useActions
          const {
            totalPracticas,
            practicasAsistidas,
            totalTeoricas,
            teoricasAsistidas,
            montoPagado,
            precioPactado,
            progresoGeneral,
          } = ins.stats; // Asumiremos que tu useGetData devuelve un objeto 'stats'

          return (
            <div
              key={ins.id}
              className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm "
            >
              {/* CABECERA DEL CURSO */}
              <div className="flex items-center justify-between p-5 border-b border-border bg-secondary/40 ">
                <div>
                  <h3 className="font-semibold  text-lg flex items-center gap-2">
                    {ins.curso.nombreCurso}
                  </h3>
                  <p className="text-xs  mt-1">
                    {ins.fechaInicio} — {ins.fechaFin}
                  </p>
                </div>

                {/* BADGE DE ESTADO */}

                {ins.estadoInscripcion === "pendiente" && (
                  <div className="text-sm rounded-full p-0.75 px-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-800/20 dark:text-emerald-300 text-center border-[0.5px] border-emerald-700/10 cursor-default w-auto min-w-15 capitalize ">
                    {ins.estadoInscripcion}
                  </div>
                )}

                {ins.estadoInscripcion === "aprobado" && (
                  <div className="text-sm rounded-full p-0.75 px-2 bg-blue-50 text-blue-700 dark:bg-blue-800/20 dark:text-blue-300 text-center border-[0.5px] border-blue-700/10 cursor-default w-auto min-w-15 capitalize ">
                    {ins.estadoInscripcion}
                  </div>
                )}
                {ins.estadoInscripcion === "reprobado" && (
                  <div className="text-sm rounded-full p-0.75 px-2 bg-red-50 text-red-700 dark:bg-red-800/20 dark:text-red-300 text-center border-[0.5px] border-red-700/10 cursor-default w-auto min-w-15 capitalize">
                    {ins.estadoInscripcion}
                  </div>
                )}
              </div>

              {/* CONTENIDO ESTADÍSTICO */}
              <div className="p-6">
                {/* BARRA DE PROGRESO */}
                <div className="mb-8">
                  <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                    <span>Progreso del Curso</span>
                    <span>{progresoGeneral}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-secondary-foreground h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progresoGeneral}%` }}
                    />
                  </div>
                </div>

                {/* MÉTRICAS CLAVE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* PRÁCTICAS */}
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-background">
                    <div className="p-2.5 bg-violet-100 text-violet-600 dark:bg-violet-700/30 dark:text-violet-300 rounded-lg">
                      <CarFront size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Horas Prácticas
                      </p>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-primary/40">
                          {practicasAsistidas}
                        </span>
                        <span className="text-sm font-medium text-secondary-foreground">
                          / {totalPracticas}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* TEORÍA */}
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-background">
                    <div className="p-2.5 bg-blue-100 text-blue-600 dark:bg-blue-700/30 dark:text-blue-300 rounded-lg">
                      <NotebookText size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Horas Teoría
                      </p>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-primary/40">
                          {teoricasAsistidas}
                        </span>
                        <span className="text-sm font-medium text-secondary-foreground">
                          / {totalTeoricas}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PAGOS */}
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-background">
                    <div className="p-2.5 bg-emerald-100 text-emerald-600 dark:bg-emerald-700/30 dark:text-emerald-300 rounded-lg">
                      <DollarSign size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Pagos (Bs.)
                      </p>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-primary/40">
                          {montoPagado}
                        </span>
                        <span className="text-sm font-medium text-secondary-foreground">
                          / {precioPactado}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACCIONES (Opcional por ahora) */}
                {/* ACCIONES DE CIERRE (Solo visibles si la inscripción está ACTIVA) */}
                {ins.estadoInscripcion === "pendiente" && (
                  <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                    {/* Mensaje de retroalimentación dinámica */}
                    <div className="text-sm font-medium">
                      {progresoGeneral >= 100 ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={16} /> Listo para graduación
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-1">
                          <Clock size={16} /> Horas incompletas
                        </span>
                      )}
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAbandonarIns(ins.id)}
                        className="px-3 py-2  text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-600 dark:text-rose-50 rounded-xl cursor-pointer transition-colors"
                      >
                        Marcar Abandono
                      </button>

                      <button
                        onClick={() => {
                          const esAprobado = progresoGeneral >= 100;
                          const mensaje =
                            progresoGeneral >= 100
                              ? "¿Finalizar curso y APROBAR al estudiante?"
                              : "El estudiante NO tiene el 100% de horas. ¿Finalizar de todos modos (Reprobado/Incompleto)?";

                          handleFinalizarIns(
                            ins.id,
                            mensaje,
                            esAprobado ? "aprobado" : "reprobado",
                          );
                        }}
                        className={`px-3 py-2 text-xs font-medium text-white rounded-xl cursor-pointer transition-colors shadow-sm ${
                          progresoGeneral >= 100
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {progresoGeneral >= 100
                          ? "Aprobar y Finalizar"
                          : "Finalizar Curso"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Contendor>
  );
}
