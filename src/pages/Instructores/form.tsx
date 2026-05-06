import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
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

type NewData =
  | {
      id: string;
      estado_id: string;
      created_at: string;
      updated_at: string;
      persona_id: string;
      nro_licencia: string;
      disponibilidad_activa: boolean;
      persona: {
        id: string;
        nombres: string;
        primer_apellido: string;
        segundo_apellido: string | null;
        nro_documento: number;
        nro_celular: number;
        email: string;
        sexo_id: string;
        tipo_documento_id: string;
        fecha_nacimiento: string;
        direccion: string | null;
        estado_id: string;
        created_at: string;
        updated_at: string;
      };
    }
  | undefined;
type catalogos =
  | {
      id: string;
      nombre: string;
      categoria: string | null;
      descripcion: string | null;
    }[]
  | undefined;
export function Form({
  data,
  catalogos,
}: {
  data?: NewData | undefined;
  catalogos: catalogos;
}) {
  const { formId } = useModalStore();
  const { upsertMutation } = useActions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formdata = Object.fromEntries(
      new FormData(e.currentTarget as HTMLFormElement),
    );
    console.log(formdata);
    console.log("id", data?.id);
    upsertMutation.mutate({ id: data?.id, values: formdata });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="grid gap-5">
      <FieldSet>
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
            <FieldLabel htmlFor="primer_apellido">
              Primer apelldio <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="primer_apellido"
                placeholder="Ingrese su primer apellido"
                name="primer_apellido"
                defaultValue={data?.persona.primer_apellido || undefined}
              />
            </InputGroup>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="segundo_apellido">Segundo apelldio</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="segundo_apellido"
                placeholder="Ingrese su segundo apellido"
                name="segundo_apellido"
                defaultValue={data?.persona.segundo_apellido || undefined}
              />
            </InputGroup>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="fecha_nacimiento">
              Fecha de nacimiento <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="fecha_nacimiento"
                placeholder="Ingrese su correo"
                name="fecha_nacimiento"
                type="date"
                defaultValue={data?.persona.fecha_nacimiento || undefined}
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
            <FieldLabel htmlFor="nro_documento">
              Nro documento <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="nro_documento"
                placeholder="Numero de documento"
                name="nro_documento"
                type="number"
                defaultValue={data?.persona.nro_documento || undefined}
              />
            </InputGroup>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="tipo_documento_id">
              Tipo documento <span className="text-destructive">*</span>
            </FieldLabel>

            <Select
              name="tipo_documento_id"
              defaultValue={
                data?.persona?.tipo_documento_id ||
                catalogos?.filter((c) => c.categoria === "TIPO_DOCUMENTO")?.[0]
                  .id
              }
            >
              <SelectTrigger id="tipoDocumento">
                <SelectValue placeholder="Seleccione un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {catalogos
                    ?.filter((c) => c.categoria === "TIPO_DOCUMENTO")
                    .map((valor) => (
                      <SelectItem key={valor.id} value={valor.id}>
                        {valor.nombre}
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
            <FieldLabel htmlFor="sexo_id">
              Sexo <span className="text-destructive">*</span>
            </FieldLabel>
            <Select
              name="sexo_id"
              defaultValue={
                data?.persona?.sexo_id ||
                catalogos?.filter((c) => c.categoria === "SEXO")?.[0].id
              }
            >
              <SelectTrigger id="sexo">
                <SelectValue placeholder="Seleccione un sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {catalogos
                    ?.filter((c) => c.categoria === "SEXO")
                    .map((valor) => (
                      <SelectItem key={valor.id} value={valor.id}>
                        {valor.nombre}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="nro_celular">
              Nro. Celular <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="nro_celular"
                placeholder="Numero de celular"
                name="nro_celular"
                type="number"
                defaultValue={data?.persona.nro_celular || undefined}
              />
            </InputGroup>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="nro_licencia">
              Nro. Licencia <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="nro_licencia"
                placeholder="numero de licencia"
                name="nro_licencia"
                defaultValue={data?.nro_licencia}
                required
              />
            </InputGroup>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
