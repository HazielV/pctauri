import { cn } from "@/lib/utils";
import { Circle, CircleCheckIcon } from "lucide-react";
import { useState } from "react";

export default function MultiSelect({
  data,
  multiple = false,
  name,
  defaultData,
  setDataSelect,
}: {
  data: Record<string, string>[];
  multiple?: boolean;
  name: string;
  defaultData?: string[];
  setDataSelect?: (e: any) => void;
}) {
  const [select, setSelect] = useState<string[]>(defaultData ?? []);
  const seleccionar = (elegido: string) => {
    if (multiple) {
      // 1. Calculamos el nuevo estado basado en el estado actual
      const existe = select.includes(elegido);
      const nuevoEstado = existe
        ? select.filter((e) => e !== elegido) // Si existe, lo quitamos
        : [...select, elegido]; // Si no existe, lo agregamos

      // 2. Actualizamos ambos estados de forma segura y paralela
      setSelect(nuevoEstado);
      if (setDataSelect) {
        setDataSelect(nuevoEstado);
      }
    } else {
      // Misma lógica para el caso de selección única
      const nuevoEstado = select[0] === elegido ? [] : [elegido];

      setSelect(nuevoEstado);
      if (setDataSelect) {
        setDataSelect(nuevoEstado);
      }
    }
  };

  return (
    <>
      {!setDataSelect && multiple ? (
        <select
          name={name}
          defaultValue={select}
          multiple
          id="multiple-select"
          hidden
          onChange={() => {}}
        >
          {select.map((e, index) => (
            <option key={index} value={e}></option>
          ))}
        </select>
      ) : (
        !setDataSelect && (
          <input
            readOnly
            hidden
            data-slot="input"
            name={name}
            value={select[0]}
          />
        )
      )}
      <ul className="flex flex-wrap gap-2.5 dark:bg-input/30 min-h-9 min-w-0 border border-input rounded-md items-center px-2 py-2 w-full">
        {data.map((elem, index) => (
          <li
            onClick={() => seleccionar(elem["valor"])}
            className={cn(
              "px-2.5 pr-2 py-1 rounded-md flex items-center gap-2.5 text-sm bg-gray-100 dark:bg-gray-700/20 cursor-pointer hover:bg-gray-200",
            )}
            key={index}
          >
            <div>{elem["descripcion"]}</div>
            {multiple ? (
              <div className="mt-[1.5px]">
                {select.some((e) => e === elem["valor"]) ? (
                  <CircleCheckIcon
                    size={15}
                    className="text-blue-600 dark:text-blue-400"
                  />
                ) : (
                  <Circle
                    size={15}
                    className="text-gray-400 dark:text-gray-500"
                  />
                )}
              </div>
            ) : (
              <div className="mt-[1.5px]">
                {select[0] === elem["valor"] ? (
                  <CircleCheckIcon
                    size={15}
                    className="text-blue-600 dark:text-blue-400"
                  />
                ) : (
                  <Circle
                    size={15}
                    className="text-gray-400 dark:text-gray-500"
                  />
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
