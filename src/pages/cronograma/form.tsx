import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActions } from "./useActions";
import { useModalStore } from "@/store/modalState";

export default function Form({ data, fechaSeleccionada, cursosActivos }: any) {
  const { upsertMutation } = useActions();
  const { formId } = useModalStore();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formdata = Object.fromEntries(
      new FormData(e.currentTarget as HTMLFormElement),
    );
    upsertMutation.mutate({ id: data?.id, values: formdata });
  };
  return (
    <form id={formId} onSubmit={handleSubmit}>
      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* TÍTULO DEL EVENTO (Ocupa toda la fila arriba) */}
        <Field className="w-full md:col-span-2 lg:col-span-3">
          <FieldLabel htmlFor="titulo">
            Título del Examen / Evento{" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="titulo"
              placeholder="Ej. Examen Final de Normativa de Tránsito"
              name="titulo"
              defaultValue={data?.titulo}
              required
            />
          </InputGroup>
        </Field>

        {/* FECHA EXACTA */}
        <Field className="w-full">
          <FieldLabel htmlFor="fechaExacta">
            Fecha <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="fechaExacta"
              type="date"
              name="fechaExacta"
              // Si vienes del calendario, le pasas el día clickeado, si no, usa el de la BD
              defaultValue={data?.fechaExacta || fechaSeleccionada}
              required
            />
          </InputGroup>
        </Field>

        {/* TIPO DE EXAMEN */}
        <Field className="w-full">
          <FieldLabel htmlFor="tipoExamen">
            Tipo de Evaluación <span className="text-destructive">*</span>
          </FieldLabel>
          <Select
            name="tipoExamen"
            defaultValue={data?.tipoExamen || "TEORICO"}
          >
            <SelectTrigger id="tipoExamen" className="w-full">
              <SelectValue placeholder="Seleccione el tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="TEORICO">Examen Teórico</SelectItem>
                <SelectItem value="PRACTICO">Examen Práctico</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {/* SELECCIÓN DE CURSO */}
        <Field className="w-full">
          <FieldLabel htmlFor="cursoId">
            Curso Asociado <span className="text-destructive">*</span>
          </FieldLabel>
          <Select
            name="cursoId"
            defaultValue={data?.cursoId ? String(data.cursoId) : ""}
          >
            <SelectTrigger id="cursoId" className="w-full">
              <SelectValue placeholder="Seleccione el curso" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {/* Iteramos sobre los cursos que le pases como prop para llenar el select */}
                {cursosActivos?.map((curso: any) => (
                  <SelectItem key={curso.id} value={String(curso.id)}>
                    {curso.nombreCurso}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </form>
  );
}
