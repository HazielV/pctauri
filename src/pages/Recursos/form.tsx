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
import { useState } from "react";

export type NewData =
  | {
      id: number;
      createdAt: string;
      updatedAt: string;
      estado: "activo" | "inactivo" | "pendiente";
      nombre: string;
      ruta: string;
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
      nombre: string;
      descripcion: string | null;
      valor: number;
    }[]
  | undefined;

const convertirPermiso = (permisos: permisos, valorBitmask: number) => {
  if (!permisos) return [];

  console.log("llega permisos", permisos, "valor bitmask", valorBitmask);
  console.log(
    "salida",
    permisos
      .filter((p) => (valorBitmask & p.valor) !== 0)
      .map((p) => String(p.valor)),
  );
  return permisos
    .filter((p) => (valorBitmask & p.valor) !== 0) // Lógica Bitwise AND
    .map((p) => String(p.valor));
};

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
  const [ruta, setRuta] = useState(data?.menu?.ruta ?? "");
  const [rolesSelect, setRolesSelect] = useState<string[]>(
    data?.rolesRecursos.map((e) => String(e.rolId)) ?? [],
  );
  const [permisosRol, setPermisosRol] = useState<
    { rolid: number; permisos: string[] }[]
  >(
    data?.rolesRecursos.map((e) => ({
      rolid: e.rolId,
      permisos: convertirPermiso(permisos, e.permisos),
    })) ?? [],
  );

  const handlePermisosChange = (rolId: number, nuevosPermisos: string[]) => {
    // Aseguramos que siempre sea un array
    const permisosArray = Array.isArray(nuevosPermisos)
      ? nuevosPermisos
      : [nuevosPermisos];

    setPermisosRol((prev) => {
      if (!prev) {
        return [{ rolid: rolId, permisos: nuevosPermisos }];
      } else {
        // 1. Verificamos si ya existe ese rol en nuestro estado
        const index = prev.findIndex((item) => item.rolid === rolId);

        if (index !== -1) {
          // 2. Si existe, creamos una copia del array y actualizamos solo ese objeto
          const nuevoEstado = [...prev];
          nuevoEstado[index] = {
            ...nuevoEstado[index],
            permisos: permisosArray,
          };
          return nuevoEstado;
        } else {
          // 3. Si no existe (es la primera vez que selecciona algo para este rol), lo agregamos
          return [...prev, { rolid: rolId, permisos: permisosArray }];
        }
      }
    });
  };
  console.log(permisosRol);
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
    console.log({ ...values, permisosRol });

    upsertMutation.mutate({
      id: data?.id,
      values: { ...values, ruta, permisosRol },
    });
  };
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
          <FieldLabel htmlFor="menuId">
            Menu <span className="text-destructive">*</span>
          </FieldLabel>

          <Select
            name="menuId"
            defaultValue={String(data?.menu?.id)}
            onValueChange={(e) => {
              if (!menus) return;

              const menu = menus.find((m) => m.id === Number(e));

              if (menu && menu.ruta) {
                setRuta(menu.ruta);
              }
            }}
          >
            <SelectTrigger id="Menu">
              <SelectValue placeholder="Seleccione un menu" />
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
        <Field className="w-full">
          <FieldLabel htmlFor="tipo">
            Tipo permiso <span className="text-destructive">*</span>
          </FieldLabel>

          <Select name="tipo">
            <SelectTrigger id="tipo">
              <SelectValue placeholder="Seleccione un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={"front"}>Aplicacion</SelectItem>
                <SelectItem value={"back"}>Servidor</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field className="col-span-3 ">
          <FieldLabel htmlFor="roles">
            Roles <span className="text-destructive">*</span>
          </FieldLabel>
          {roles && (
            <MultiSelect
              multiple
              setDataSelect={setRolesSelect}
              name="roles"
              defaultData={data?.rolesRecursos.map((rolrec) =>
                String(rolrec.rolId),
              )}
              data={roles?.map((e) => ({
                descripcion: e.nombre,
                valor: String(e.id),
              }))}
            />
          )}
        </Field>
      </FieldGroup>
      <FieldSeparator />
      <FieldSet>
        <FieldLegend>Permisos por Rol</FieldLegend>
        <FieldGroup className="grid ">
          {rolesSelect &&
            rolesSelect.map((rol) => (
              <Field className="w-full gap-2 pl-5 " orientation={"responsive"}>
                <FieldLabel htmlFor="roles" className="min-w-20">
                  {roles?.find((e) => e.id === Number(rol))?.nombre}
                </FieldLabel>
                {permisos && (
                  <MultiSelect
                    name="permisos"
                    multiple
                    setDataSelect={(seleccionados) =>
                      handlePermisosChange(Number(rol), seleccionados)
                    }
                    defaultData={
                      permisosRol.find((e) => String(e.rolid) === rol)?.permisos
                    }
                    data={permisos?.map((e) => ({
                      descripcion: e.nombre || "",
                      valor: String(e.valor),
                    }))}
                  />
                )}
              </Field>
            ))}
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
