import {
  Activity,
  Users,
  CalendarDays,
  CarFront,
  DollarSign,
  Clock,
  BookOpen,
  Flag,
} from "lucide-react";
import { Contendor } from "@/components/contenido";
import { useActions } from "./useActions";
// Asegúrate de importar tu componente Calendar si quieres el calendario interactivo abajo
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { useGetData } = useActions(); // Asumiendo que conectaste la query arriba
  const [date, setDate] = useState<Date>(new Date());

  // Para propósitos de este ejemplo, usaremos el data estático si isLoading
  const { data, isLoading, isError, error } = useGetData();

  if (isLoading)
    return <div className="p-8 text-slate-500">Cargando panel...</div>;
  if (isError)
    return <div className="p-8 text-rose-500">Error al cargar datos</div>;

  const dashboard = data || {
    estudiantesActivos: 25,
    clasesHoyTotales: 8,
    ingresosMes: 4500,
    agendaHoy: [
      {
        id: 1,
        tipo: "Práctica",
        titulo: "Clase Práctica - Vehículo 1",
        horaInicio: "10:00",
        horaFin: "12:00",
        estado: "Pendiente",
      },
      {
        id: 2,
        tipo: "Teoría",
        titulo: "Educación Vial - Curso 2",
        horaInicio: "14:00",
        horaFin: "16:00",
        estado: "Pendiente",
      },
    ],
  };

  return (
    <Contendor>
      {/* HEADER */}
      <div className="flex flex-col py-4 mb-2">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          Buen día, <span>{user && user.username}</span> 👋
        </h1>
        <p className="text-primary/60 text-sm mt-1">
          Aquí tienes un resumen del rendimiento y las clases de hoy.
        </p>
      </div>

      {/* BLOQUE 1: TARJETAS PRINCIPALES (Grid de 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Tarjeta 1 */}
        <div className="bg-background border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-secondary-foreground font-medium">
              <Activity className="text-amber-500" size={20} />
              Estado de ingresos
            </div>
            <span className="text-xs text-slate-400 hover:text-blue-500 cursor-pointer">
              Ver finanzas
            </span>
          </div>
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-primary/70 text-sm">Este mes</span>
              <span className="text-2xl font-bold text-primary">
                Bs. {dashboard.ingresosMes}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-amber-400 h-1.5 rounded-full"
                style={{ width: "70%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tarjeta 2 */}
        <div className="bg-background border border-border  rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-secondary-foreground font-medium">
              <CarFront className="text-violet-500" size={20} />
              Próxima Clase
            </div>
            <span className="text-xs text-slate-400 hover:text-blue-500 cursor-pointer">
              Gestionar
            </span>
          </div>
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-primary/70 text-sm">Hora de inicio</span>
              <span className="text-2xl font-bold text-primary">10:00 AM</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-violet-500 h-1.5 rounded-full"
                style={{ width: "40%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tarjeta 3 */}
        <div className="bg-background border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-secondary-foreground font-medium">
              <Users className="text-emerald-500" size={20} />
              Estudiantes Activos
            </div>
            <span className="text-xs text-slate-400 hover:text-blue-500 cursor-pointer">
              Ver todos
            </span>
          </div>
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-primary/70 text-sm">Inscripciones</span>
              <span className="text-2xl font-bold text-primary">
                {dashboard.estudiantesActivos}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 flex gap-1">
              <div className="bg-emerald-400 h-1.5 rounded-full flex-1"></div>
              <div className="bg-emerald-200 h-1.5 rounded-full w-1/4"></div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE 2: PÍLDORAS RÁPIDAS (Grid de 4) */}
      <h2 className="text-lg font-semibold text-primary mb-4">
        Métricas de Hoy
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-background border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2.5 rounded-full text-indigo-500 dark:bg-indigo-600/40 dark:text-indigo-200">
              <BookOpen size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">
                {dashboard.clasesHoyTotales}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Clases Programadas
              </span>
            </div>
          </div>
        </div>

        <div className="bg-background border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="bg-orange-50 p-2.5 rounded-full text-orange-500 dark:bg-orange-600/40 dark:text-orange-20">
              <Flag size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">3</span>
              <span className="text-xs text-slate-400 font-medium">
                Exámenes Hoy
              </span>
            </div>
          </div>
        </div>

        <div className="bg-background border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-2.5 rounded-full text-emerald-500 dark:bg-emerald-600/40 dark:text-emerald-20">
              <DollarSign size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">5</span>
              <span className="text-xs text-slate-400 font-medium">
                Pagos Pendientes
              </span>
            </div>
          </div>
        </div>

        <div className="bg-background border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-50 p-2.5 rounded-full text-cyan-500 dark:bg-cyan-600/40 dark:text-cyan-20">
              <CarFront size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">8</span>
              <span className="text-xs text-slate-400 font-medium">
                Vehículos en Uso
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE 3: CALENDARIO Y AGENDA */}
      <h2 className="text-lg font-semibold text-primary mb-4">Agenda</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario (Columna izquierda) */}
        <div className="bg-background border border-border rounded-3xl p-6 shadow-sm">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && setDate(d)}
            className="w-full h-full flex justify-center border-none"
          />
        </div>

        {/* Lista de Eventos (Columna derecha, ocupa 2 espacios) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboard.agendaHoy.map((clase: any, idx: number) => (
            <div
              key={idx}
              className="bg-background border border-border rounded-3xl p-5 shadow-sm hover:border-slate-200 transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${clase.tipo === "Teoría" ? "bg-blue-400" : "bg-emerald-400"}`}
                  ></div>
                  <h3 className="font-semibold text-slate-800">
                    {clase.titulo}
                  </h3>
                </div>
                <span
                  className={`text-[10px] px-2 py-1 rounded-full font-medium ${clase.tipo === "Teoría" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}
                >
                  {clase.tipo}
                </span>
              </div>

              <div className="flex items-end justify-between mt-6">
                <div>
                  <span className="text-2xl font-bold text-primary">
                    {clase.horaInicio}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    Horario programado
                  </p>
                </div>
                <div className="w-1/2 bg-slate-100 rounded-full h-1.5 mb-1">
                  <div className="bg-blue-500 h-1.5 rounded-full w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Contendor>
  );
}
