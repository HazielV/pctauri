import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { persona } from "../../db/schema";
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

export type NewData =
  | {
      id: number;
      createdAt: string;
      updatedAt: string;
      estado: "activo" | "inactivo" | "pendiente";
      username: string;
      password: string;
      personaId: number;
      usuariosRoles: {
        rol: {
          id: number;
        };
      }[];
      persona: {
        id: number;
        nombres: string;
        primerApellido: string;
        segundoApellido: string | null;
        nroDocumento: number;
        nroCelular: number;
        email: string;
        sexo: "MASCULINO" | "FEMENINO" | "OTRO";
        fechaNacimiento: string;
        direccion: string | null;
        createdAt: string;
        updatedAt: string;
        tipoDocumento: "CEDULA" | "PASAPORTE" | "EXTRANJERO";
        estado: "activo" | "inactivo" | "pendiente";
      };
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
export function Form({
  data,
  roles,
}: {
  data?: NewData | undefined;
  roles: roles;
}) {
  const { formId } = useModalStore();
  const { upsertMutation } = useActions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formdata = Object.fromEntries(
      new FormData(e.currentTarget as HTMLFormElement),
    );

    upsertMutation.mutate({ id: data?.id, values: formdata });
  };
  return (
    <form id={formId} onSubmit={handleSubmit} className="grid gap-5">
      <FieldGroup className="grid grid-cols-2 lg:grid-cols-3">
        <Field className="w-full">
          <FieldLabel htmlFor="username">
            Usuario <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="username"
              placeholder="Nombre de usuario"
              name="username"
              defaultValue={data?.username}
            />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="password">
            Contraseña <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="password"
              type="password"
              placeholder="**********"
              name="password"
            />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="rolId">
            Rol del usuario <span className="text-destructive">*</span>
          </FieldLabel>

          <Select
            name="rolId"
            defaultValue={String(data?.usuariosRoles?.[0]?.rol?.id) || ""}
          >
            <SelectTrigger id="rolId">
              <SelectValue placeholder="Seleccione un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {roles?.map((valor, index) => (
                  <SelectItem key={index} value={String(valor.id)}>
                    {valor.descripcion}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
      <FieldSeparator />
      <FieldSet>
        <FieldLegend>Datos de persona</FieldLegend>
        <FieldGroup className="grid grid-cols-2 lg:grid-cols-3">
          <Field className="w-full">
            <FieldLabel htmlFor="nombres">
              Nombres <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="nombres"
                placeholder="Ingrese su nombre"
                name="nombres"
                defaultValue={data?.persona.nombres || undefined}
              />
            </InputGroup>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="primerApellido">
              Primer apelldio <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="primerApellido"
                placeholder="Ingrese su primer apellido"
                name="primerApellido"
                defaultValue={data?.persona.primerApellido || undefined}
              />
            </InputGroup>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="segundoApellido">Segundo apelldio</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="segundoApellido"
                placeholder="Ingrese su segundo apellido"
                name="segundoApellido"
                defaultValue={data?.persona.segundoApellido || undefined}
              />
            </InputGroup>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="fechaNacimiento">
              Fecha de nacimiento <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="fechaNacimiento"
                placeholder="Ingrese su correo"
                name="fechaNacimiento"
                type="date"
                defaultValue={data?.persona.fechaNacimiento || undefined}
              />
            </InputGroup>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="email">
              Correo <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="email"
                placeholder="Ingrese su correo"
                name="email"
                type="email"
                defaultValue={data?.persona.email || undefined}
              />
            </InputGroup>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="nroDocumento">
              Nro documento <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="nroDocumento"
                placeholder="Numero de documento"
                name="nroDocumento"
                type="number"
                defaultValue={data?.persona.nroDocumento || undefined}
              />
            </InputGroup>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="tipoDocumento">
              Tipo documento <span className="text-destructive">*</span>
            </FieldLabel>

            <Select
              name="tipoDocumento"
              defaultValue={
                data?.persona?.tipoDocumento ||
                persona.tipoDocumento.enumValues[0]
              }
            >
              <SelectTrigger id="tipoDocumento">
                <SelectValue placeholder="Seleccione un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {persona.tipoDocumento.enumValues.map((valor, index) => (
                    <SelectItem key={index} value={valor}>
                      {valor}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="direccion">Direccion</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="direccion"
                placeholder="Ingrese su direccion"
                name="direccion"
                defaultValue={data?.persona.direccion || undefined}
              />
            </InputGroup>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="sexo">
              Sexo <span className="text-destructive">*</span>
            </FieldLabel>
            <Select
              name="sexo"
              defaultValue={data?.persona?.sexo || persona.sexo.enumValues[0]}
            >
              <SelectTrigger id="sexo">
                <SelectValue placeholder="Seleccione un sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {persona.sexo.enumValues.map((valor, index) => (
                    <SelectItem key={index} value={valor}>
                      {valor}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="nroCelular">
              Nro. Celular <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="nroCelular"
                placeholder="Numero de celular"
                name="nroCelular"
                type="number"
                defaultValue={data?.persona.nroCelular || undefined}
              />
            </InputGroup>
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSeparator />
    </form>
  );
}
