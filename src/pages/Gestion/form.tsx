import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";

import { useModalStore } from "@/store/modalState";
import { useActions } from "./useActions";

type NewData =
  | {
      id: string;
      nombre: string;
      estado_id: string;
      created_at: string;
      updated_at: string;
      fecha_inicio: string;
      fecha_fin: string;
      estado_gestion_id: string;
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
              id="nombre gestion"
              placeholder="Nombre del menu"
              name="nombre"
              defaultValue={data?.nombre}
              required
            />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="fecha_inicio">
            Fecha inicio <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="Fecha inicio"
              placeholder="Fecha inicio "
              name="fecha_inicio"
              type="date"
              defaultValue={data?.fecha_inicio}
              required
            />
          </InputGroup>
        </Field>

        <Field className="w-full">
          <FieldLabel htmlFor="fecha_fin">
            Fecha Final <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="Fecha Final"
              placeholder="Url del menu"
              name="fecha_fin"
              type="date"
              defaultValue={data?.fecha_fin}
              required
            />
          </InputGroup>
        </Field>
      </FieldGroup>
    </form>
  );
}
