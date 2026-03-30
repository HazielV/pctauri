import { endOfMonth, format, startOfMonth } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/db/client";
import { clasePractica, claseTeorica, inscripcion, pago } from "@/db/schema";
import { and, count, eq, gte, lte, sum } from "drizzle-orm";

export const useActions = () => {
  // Ya no usamos useQueryClient aquí adentro porque rompería las reglas de los Hooks

  async function getDashboardData() {
    const hoy = format(new Date(), "yyyy-MM-dd");
    const inicioMes = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const finMes = format(endOfMonth(new Date()), "yyyy-MM-dd");

    // 1. Total de estudiantes activos
    const [inscripcionesActivas] = await db
      .select({ total: count() })
      .from(inscripcion)
      .where(eq(inscripcion.estadoInscripcion, "pendiente")); // Asegúrate que "pendiente" o "ACTIVA" sea tu estado correcto

    // 2. Clases para HOY (Prácticas y Teóricas)
    const practicasHoy = await db.query.clasePractica.findMany({
      where: eq(clasePractica.fechaExacta, hoy),
      with: { instructor: { with: { persona: true } } },
      limit: 5,
    });

    const teoricasHoy = await db.query.claseTeorica.findMany({
      where: eq(claseTeorica.fechaExacta, hoy),
      limit: 5,
    });

    // 3. Ingresos del Mes actual
    const [ingresosMes] = await db
      .select({ total: sum(pago.montoPagado) })
      .from(pago)
      .where(and(gte(pago.createdAt, inicioMes), lte(pago.createdAt, finMes)));

    // Combinamos y ordenamos las próximas clases del día
    const proximasClases = [...practicasHoy, ...teoricasHoy].sort((a, b) =>
      a.horaInicio.localeCompare(b.horaInicio),
    );

    return {
      estudiantesActivos: inscripcionesActivas.total,
      clasesHoyTotales: practicasHoy.length + teoricasHoy.length,
      ingresosMes: ingresosMes.total || 0,
      proximaClase: proximasClases[0] || null,
      agendaHoy: proximasClases,
    };
  }

  const useGetData = () =>
    useQuery({
      queryKey: ["data-dashboard"],
      queryFn: () => getDashboardData(),
    });

  return {
    useGetData,
  };
};
