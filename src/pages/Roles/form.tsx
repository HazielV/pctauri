import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { rol } from "../../db/schema";
import { InferInsertModel } from "drizzle-orm";
import { useModalStore } from "@/store/modalState";

import { useActions } from "./useActions";
export type NewRol = InferInsertModel<typeof rol>;
export function Form({ data }: { data?: NewRol | undefined }) {
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
      </FieldGroup>
    </form>
  );
}
