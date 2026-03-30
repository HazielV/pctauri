import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useActions } from "./useActions";
import { useModalStore } from "@/store/modalState";

type TemaType = {
  id: number;
  estado: "activo" | "inactivo";
  orden: number | null;
  cursoId: number;
  tipo: "TEORICO" | "PRACTICO";
  titulo: string;
};

export default function Temas({
  temas,
  cursoId,
}: {
  temas: TemaType[];
  cursoId: number;
}) {
  const { formId } = useModalStore();
  const { temasUpsertMutation } = useActions();
  const [temasEstado, setTemasEstado] = useState<TemaType[]>(temas ?? []);

  const [nuevoTeorico, setNuevoTeorico] = useState("");
  const [nuevoPractico, setNuevoPractico] = useState("");

  const handleAgregarTema = (tipo: "TEORICO" | "PRACTICO") => {
    const titulo = tipo === "TEORICO" ? nuevoTeorico : nuevoPractico;

    if (!titulo.trim()) return; // No agregar temas vacíos

    // Calculamos el orden basado en la cantidad actual de temas de ese tipo
    const temasDelMismoTipo = temasEstado.filter((t) => t.tipo === tipo);
    const nuevoOrden = temasDelMismoTipo.length + 1;

    const nuevoTema: TemaType = {
      // Usamos Date.now() como ID temporal (negativo para saber que es nuevo al guardar)
      id: -Date.now(),
      estado: "activo",
      orden: nuevoOrden,
      cursoId: cursoId,
      tipo: tipo,
      titulo: titulo.trim(),
    };

    setTemasEstado([...temasEstado, nuevoTema]);

    // Limpiamos el input
    if (tipo === "TEORICO") setNuevoTeorico("");
    else setNuevoPractico("");
  };

  // Función para eliminar un tema
  const handleEliminarTema = (
    idAEliminar: number,
    tipo: "TEORICO" | "PRACTICO",
  ) => {
    setTemasEstado((prev) => {
      // 1. Filtramos el tema eliminado
      const temasRestantes = prev.filter((t) => t.id !== idAEliminar);

      // 2. Recalculamos el orden SOLO para los temas del mismo tipo
      let contadorOrden = 1;
      return temasRestantes.map((t) => {
        if (t.tipo === tipo) {
          return { ...t, orden: contadorOrden++ };
        }
        return t;
      });
    });
  };

  // Función para actualizar el título de un tema existente
  const handleActualizarTitulo = (id: number, nuevoTitulo: string) => {
    setTemasEstado((prev) =>
      prev.map((t) => (t.id === id ? { ...t, titulo: nuevoTitulo } : t)),
    );
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Filtramos por si quedó algún input en blanco (para no guardar basura)
    const temasValidos = temasEstado.filter((t) => t.titulo.trim() !== "");

    // Disparamos la mutación enviando el "Antes" y el "Después"
    temasUpsertMutation.mutate({
      values: {
        cursoId: cursoId,
        temasCurso: temasValidos, // El estado actual (Después)
        temasAnterior: temas, // La prop original (Antes)
      },
    });
  };
  return (
    <form id={formId} onSubmit={handleSubmit} className="flex gap-8 pr-3">
      {/* SECCIÓN TEÓRICA */}
      <div className="flex-1 pb-2">
        <span className="font-medium capitalize text-lg">Temas Teóricos</span>

        <div className="mt-2 text-sm flex flex-col gap-2">
          <div className="flex gap-2 border-b-2 text-sm font-medium capitalize ">
            <div className="w-12 text-center border-r-2 py-1">Orden</div>
            <div className="flex-1 px-1 border-r-2 py-1">Título</div>
            <div className="px-1 py-1">Acción</div>
          </div>

          {/* Lista de temas teóricos */}
          {temasEstado
            .filter((e) => e.tipo === "TEORICO")
            .map((e) => (
              <div className="flex gap-2" key={e.id}>
                <Input
                  readOnly
                  disabled
                  value={e.orden || ""}
                  className="w-12 text-center border rounded-md bg-gray-100 dark:bg-gray-800"
                />
                <Input
                  className="border w-full px-3 py-1 rounded-md"
                  type="text"
                  required
                  value={e.titulo}
                  onChange={(eEvent) =>
                    handleActualizarTitulo(e.id, eEvent.target.value)
                  }
                />
                <div className="flex items-center gap-1 p-0.5">
                  <button
                    type="button"
                    onClick={() => handleEliminarTema(e.id, "TEORICO")}
                    className="border h-full aspect-square flex items-center justify-center rounded-md bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

          {/* Formulario para agregar nuevo teórico */}
          <div className="flex gap-2 mt-1">
            <Input
              readOnly
              disabled
              value="-"
              className="w-12 text-center border rounded-md bg-gray-100 dark:bg-gray-800"
            />
            <Input
              className="border border-dashed w-full px-3 py-1 rounded-md focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Escriba el título del tema teórico"
              value={nuevoTeorico}
              onChange={(e) => setNuevoTeorico(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAgregarTema("TEORICO");
                }
              }}
            />
            <div className="flex items-center gap-1 p-0.5">
              <button
                type="button"
                onClick={() => handleAgregarTema("TEORICO")}
                className="border h-full aspect-square flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN PRÁCTICA */}
      <div className="flex-1">
        <span className="font-medium capitalize text-lg">Temas Prácticos</span>

        <div className="mt-2 text-sm flex flex-col gap-2">
          <div className="flex gap-2 border-b-2 text-sm font-medium capitalize ">
            <div className="w-12 text-center border-r-2 py-1">Orden</div>
            <div className="flex-1 px-1 border-r-2 py-1">Título</div>
            <div className="px-1 py-1">Acción</div>
          </div>

          {/* Lista de temas prácticos */}
          {temasEstado
            .filter((e) => e.tipo === "PRACTICO")
            .map((e) => (
              <div className="flex gap-2" key={e.id}>
                <Input
                  readOnly
                  disabled
                  value={e.orden || ""}
                  className="w-12 text-center border rounded-md bg-gray-100 dark:bg-gray-800"
                />
                <Input
                  className="border w-full px-3 py-1 rounded-md"
                  type="text"
                  required
                  value={e.titulo}
                  onChange={(eEvent) =>
                    handleActualizarTitulo(e.id, eEvent.target.value)
                  }
                />
                <div className="flex items-center gap-1 p-0.5">
                  <button
                    type="button"
                    onClick={() => handleEliminarTema(e.id, "PRACTICO")}
                    className="border h-full aspect-square flex items-center justify-center rounded-md bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

          {/* Formulario para agregar nuevo práctico */}
          <div className="flex gap-2 mt-1">
            <Input
              readOnly
              disabled
              value="-"
              className="w-12 text-center border rounded-md bg-gray-100 dark:bg-gray-800"
            />
            <Input
              className="border border-dashed w-full px-3 py-1 rounded-md focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Escriba el título del tema práctico"
              value={nuevoPractico}
              onChange={(e) => setNuevoPractico(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAgregarTema("PRACTICO");
                }
              }}
            />
            <div className="flex items-center gap-1 p-0.5">
              <button
                type="button"
                onClick={() => handleAgregarTema("PRACTICO")}
                className="border h-full aspect-square flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
