import { cn } from "@/lib/utils";
import { Circle, CircleCheckIcon } from "lucide-react";
import { useState } from "react";

export default function MultiSelect({
  data,
  multiple = false,
  name,
}: {
  data: Record<string, string>[];
  multiple?: boolean;
  name: string;
}) {
  const [select, setSelect] = useState<string[]>([]);
  const seleccionar = (elegido: string) => {
    if (multiple) {
      setSelect((prev) => {
        const existe = prev.some((e) => e === elegido);

        if (existe) {
          return prev.filter((e) => e !== elegido);
        }
        return [...prev, elegido];
      });
    } else {
      setSelect((prev) => (prev[0] === elegido ? [] : [elegido]));
    }
  };
  /* <input
          name={name}
          value={select.map((e) => e)}
          type="checkbox"
          data-slot="input"
        /> */
  return (
    <>
      {multiple ? (
        <select
          name={name}
          value={select}
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
        <input
          readOnly
          hidden
          data-slot="input"
          name={name}
          value={select[0]}
        />
      )}
      <ul className="flex flex-wrap gap-2.5 dark:bg-input/30 min-h-9 min-w-0 border border-input rounded-md items-center px-2 py-2">
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
