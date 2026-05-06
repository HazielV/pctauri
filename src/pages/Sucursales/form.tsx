import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";

import { useModalStore } from "@/store/modalState";
import { useActions } from "./useActions";

type NewData =
  | {
      id: string;
      nombre: string;
      direccion: string;
      estado_id: string;
      created_at: string;
      updated_at: string;
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
          <FieldLabel htmlFor="nombre">
            Nombre <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="nombre"
              placeholder="Nombre del menu"
              name="nombre"
              defaultValue={data?.nombre}
              required
            />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="Direccion">
            Direccion <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="Direccion"
              placeholder="Direccion de la sucursal "
              name="direccion"
              defaultValue={data?.direccion}
              required
            />
          </InputGroup>
        </Field>
      </FieldGroup>
    </form>
  );
}
