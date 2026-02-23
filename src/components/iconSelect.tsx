"use client";

import { useMemo, useState } from "react";
import { icons, HelpCircle } from "lucide-react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";

const ALL_ICON_NAMES = Object.keys(icons);

export default function IconPicker({
  iconoDefault,
}: {
  iconoDefault?: keyof typeof icons;
}) {
  // IMPORTANTE: Inicializar con "" asegura que el componente sea 'controlled' desde el inicio
  const [search, setSearch] = useState(iconoDefault || "");
  const [selectedIconName, setSelectedIconName] = useState(iconoDefault || "");

  const filteredIcons = useMemo(() => {
    return ALL_ICON_NAMES.filter((name) =>
      name.toLowerCase().includes(search.toLowerCase()),
    ).slice(0, 40);
  }, [search]);

  const SelectedIcon =
    selectedIconName && icons[selectedIconName as keyof typeof icons]
      ? icons[selectedIconName as keyof typeof icons]
      : HelpCircle;
  return (
    <Combobox
      defaultValue={iconoDefault}
      required
      name="icono"
      value={selectedIconName}
      onValueChange={(val) => {
        const value = (val as string) ?? "";
        setSelectedIconName(value);
        setSearch(value); // Esto evita que el texto se borre al seleccionar
      }}
      inputValue={search}
      onInputValueChange={(val) => setSearch(val ?? "")}
      items={filteredIcons}
    >
      <ComboboxInput placeholder="Busca un icono...">
        <InputGroupAddon>
          <SelectedIcon className="size-4 text-muted-foreground" />
        </InputGroupAddon>
      </ComboboxInput>

      <ComboboxContent>
        <ComboboxEmpty>No se encontraron iconos.</ComboboxEmpty>
        <ComboboxList
          className="max-h-72 overflow-y-auto"
          onWheel={(e) => e.stopPropagation()}
        >
          {(item) => {
            const IconComponent = icons[item as keyof typeof icons];
            return (
              <ComboboxItem key={item} value={item}>
                <div className="flex items-center gap-2">
                  {IconComponent && <IconComponent className="size-4" />}
                  <span className="text-xs">{item}</span>
                </div>
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
