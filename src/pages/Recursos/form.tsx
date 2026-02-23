import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";

import { useModalStore } from "@/store/modalState";

import { useActions } from "./useActions";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MultiSelect from "@/components/multiselect";

export type NewData =
  | {
      id: number;
      createdAt: string;
      updatedAt: string;
      estado: "activo" | "inactivo" | "pendiente";
      nombre: string;
      ruta: string;
      menus: {
        id: number;
        estado: "activo" | "inactivo" | "pendiente";
        nombre: string;
        ruta: string;
        icono: string | null;
        orden: number;
        padreId: number | null;
        recursoId: number | null;
        menu: {
          id: number;
          estado: "activo" | "inactivo" | "pendiente";
          nombre: string;
          ruta: string;
          icono: string | null;
          orden: number;
          padreId: number | null;
          recursoId: number | null;
        } | null;
      }[];
      rolesRecursos: {
        recursoId: number;
        rolId: number;
        permisos: number;
        rol: {
          id: number;
          estado: "activo" | "inactivo" | "pendiente";
          nombre: string;
          descripcion: string | null;
        };
      }[];
    }
  | undefined;
type roles =
  | {
      id: number;
      estado: "activo" | "inactivo" | "pendiente";
      nombre: string;
      descripcion: string | null;
    }[]
  | undefined;
type menus =
  | {
      id: number;
      estado: "activo" | "inactivo" | "pendiente";
      nombre: string;
      ruta: string;
      icono: string | null;
      orden: number;
      padreId: number | null;
      recursoId: number | null;
    }[]
  | undefined;
type permisos =
  | {
      id: number;
      descripcion: string | null;
    }[]
  | undefined;
export function Form({
  data,
  roles,
  menus,
  permisos,
}: {
  data?: NewData | undefined;
  roles: roles;
  menus: menus;
  permisos: permisos;
}) {
  const { formId } = useModalStore();
  const { upsertMutation } = useActions();

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
    console.log(values);

    //upsertMutation.mutate({ id: data?.id, values: formdata });
  };
  console.log(data);
  return (
    <form id={formId} onSubmit={handleSubmit} className="grid gap-5">
      <FieldGroup className="grid grid-cols-2 lg:grid-cols-3">
        <Field className="w-full">
          <FieldLabel htmlFor="nombre">
            Nombre <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="nombre"
              placeholder="Nombre del recurso"
              name="nombre"
              defaultValue={data?.nombre}
            />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="Menu">
            Menu <span className="text-destructive">*</span>
          </FieldLabel>

          <Select
            name="Menu"
            defaultValue={
              (data?.menus || []).length > 0
                ? String(data?.menus![0].id)
                : undefined
            }
          >
            <SelectTrigger id="Menu">
              <SelectValue placeholder="Seleccione un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {menus?.map((valor, index) => (
                  <SelectItem key={index} value={String(valor.id)}>
                    {valor.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
      <FieldSeparator />
      <FieldSet>
        <FieldLegend>Roles y Permisos</FieldLegend>
        <FieldGroup className="grid ">
          <Field className="w-full ">
            <FieldLabel htmlFor="roles">
              Roles <span className="text-destructive">*</span>
            </FieldLabel>
            {roles && (
              <MultiSelect
                multiple
                name="roles"
                data={roles?.map((e) => ({
                  descripcion: e.nombre,
                  valor: String(e.id),
                }))}
              />
            )}
          </Field>
          <Field className="w-full ">
            <FieldLabel htmlFor="roles">
              Permisos <span className="text-destructive">*</span>
            </FieldLabel>
            {permisos && (
              <MultiSelect
                multiple
                name="permisos"
                data={permisos?.map((e) => ({
                  descripcion: e.descripcion || "",
                  valor: String(e.id),
                }))}
              />
            )}
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
