import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";

import { useModalStore } from "@/store/modalState";

import { useActions } from "./useActions";
import MultiSelect from "@/components/multiselect";
import { useMemo, useState } from "react";
export type NewRol =
  | {
      id: string;
      nombre: string;
      descripcion: string | null;
      estado_id: string;
      rolesMenus: {
        id: string;
        estado_id: string;
        rol_id: string;
        permisos: number;
        menu_id: string;
      }[];
    }
  | undefined;
type menus =
  | {
      id: string;
      nombre: string;
      estado_id: string;
      ruta: string;
      icono: string | null;
      orden: number;
      padre_id: string | null;
      recurso_id: string;
    }[]
  | undefined;
export function Form({
  data,
  menus,
}: {
  data?: NewRol | undefined;
  menus: menus;
}) {
  const { formId } = useModalStore();
  const { upsertMutation } = useActions();
  const [menusElegidos, setMenusElegidos] = useState<string | string[]>("");
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const values: Record<string, any> = {};

    formData.forEach((value, key) => {
      if (!values[key]) {
        values[key] = value;
        return;
      }
      if (!Array.isArray(values[key])) {
        values[key] = [values[key]];
      }
      values[key].push(value);
    });

    /* console.log({ ...values, menus: menusElegidos }); */
    upsertMutation.mutate({
      id: data?.id,
      values: { ...values, menus: menusElegidos },
    });
  };
  const menusMapeados = useMemo(() => {
    if (!menus) return [];
    return menus.map((e) => ({
      descripcion: e.nombre || "",
      valor: String(e.id),
    }));
  }, [menus]);
  return (
    <form id={formId} onSubmit={handleSubmit}>
      <FieldGroup className="grid grid-cols-2">
        <Field className="w-full">
          <FieldLabel htmlFor="input-required">
            Nombre <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="inline-start-input"
              placeholder="Nombre del rol"
              name="nombre"
              defaultValue={data?.nombre}
            />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="input-required">
            Descripcion <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="inline-start-input"
              placeholder="Descripcion del rol"
              name="descripcion"
              defaultValue={data?.descripcion || undefined}
            />
          </InputGroup>
        </Field>
        <Field className="w-full md:col-span-2 ">
          <FieldLabel htmlFor="menus">
            Menus para el rol <span className="text-destructive">*</span>
          </FieldLabel>

          {menusMapeados && (
            <MultiSelect
              multiple
              name="menus"
              defaultData={data?.rolesMenus?.map((e) => String(e.menu_id))}
              setDataSelect={setMenusElegidos}
              data={menusMapeados} // <-- Usamos la variable memorizada
            />
          )}
        </Field>
      </FieldGroup>
    </form>
  );
}
