import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";

import { useModalStore } from "@/store/modalState";
import { useActions } from "./useActions";

type NewData =
  | {
      id: number;
      createdAt: string;
      updatedAt: string;
      estado: "activo" | "inactivo" | "pendiente";
      placa: string;
      marca: string;
      estadoOperativo: "DISPONIBLE" | "MANTENIMIENTO" | "AVERIADO";
    }
  | undefined;
export function Form({ data }: { data?: NewData | undefined }) {
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
          <FieldLabel htmlFor="Marca">
            Marca <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="Marca"
              placeholder="Marca del vehiculo"
              name="marca"
              defaultValue={data?.marca}
              required
            />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="Nro placa">
            Nro placa <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="Nro placa"
              placeholder="Nro placa del vehiculo "
              name="placa"
              defaultValue={data?.placa}
              required
            />
          </InputGroup>
        </Field>
      </FieldGroup>
    </form>
  );
}
