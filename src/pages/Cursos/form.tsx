import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
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
      id: number;
      createdAt: string;
      updatedAt: string;
      estado: "activo" | "inactivo" | "pendiente";
      nombreCurso: string;
      precioBase: number;
      horasTeoricasReq: number;
      horasPracticasReq: number;
      gestionId: number;
      sucursalId: number;
    }
  | undefined;
type sucursales =
  | {
      id: number;
      direccion: string;
      createdAt: string;
      updatedAt: string;
      estado: "activo" | "inactivo" | "pendiente";
      nombre: string;
    }[]
  | undefined;

export function Form({
  data,
  sucursales,
}: {
  data?: NewData | undefined;
  sucursales: sucursales;
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
      <FieldGroup className="grid grid-cols-2 lg:grid-cols-3">
        <Field className="w-full">
          <FieldLabel htmlFor="nombreCurso">
            Nombre <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="nombreCurso"
              placeholder="Nombre del curso"
              name="nombreCurso"
              defaultValue={data?.nombreCurso}
              required
            />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="precioBase">
            Precio inicial <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="precioBase"
              placeholder="Precio inicial"
              name="precioBase"
              defaultValue={data?.precioBase}
              required
            />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="Menu">
            Sucursal <span className="text-destructive">*</span>
          </FieldLabel>

          <Select
            name="Menu"
            defaultValue={data ? String(data?.sucursalId) : undefined}
          >
            <SelectTrigger id="Menu">
              <SelectValue placeholder="Seleccione un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {sucursales?.map((valor, index) => (
                  <SelectItem key={index} value={String(valor.id)}>
                    {valor.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="horasTeoricasReq">
            Horas teoricas <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="horasTeoricasReq"
              placeholder="Requisito de horas "
              name="horasTeoricasReq"
              type="number"
              min={0}
              defaultValue={data?.horasTeoricasReq}
              required
            />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="horasPracticasReq">
            Horas Practicas <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="horasPracticasReq"
              placeholder="Requisito de horas "
              name="horasPracticasReq"
              type="number"
              min={1}
              defaultValue={data?.horasPracticasReq}
              required
            />
          </InputGroup>
        </Field>
      </FieldGroup>
    </form>
  );
}
