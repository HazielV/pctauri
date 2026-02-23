import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { menu } from "../../db/schema";
import { InferSelectModel } from "drizzle-orm";
import { useModalStore } from "@/store/modalState";
import { icons } from "lucide-react";
import { useActions } from "./useActions";
import IconPicker from "@/components/iconSelect";

type NewData = InferSelectModel<typeof menu>;

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
          <FieldLabel htmlFor="orden">
            Orden <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="orden"
              placeholder="Orden en la interfaz"
              name="orden"
              type="number"
              defaultValue={data?.orden}
              required
            />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="username">
            Icono <span className="text-destructive">*</span>
          </FieldLabel>
          <IconPicker iconoDefault={data?.icono as keyof typeof icons} />
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="ruta">
            Ruta <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="ruta"
              placeholder="Url del menu"
              name="ruta"
              defaultValue={data?.ruta}
              required
            />
          </InputGroup>
        </Field>
      </FieldGroup>

      <FieldSeparator />
    </form>
  );
}
