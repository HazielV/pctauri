import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Calendar } from "@/components/ui/calendar";
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
import { horarioPlantilla, inscripcion, persona } from "@/db/schema";
import { useState } from "react";
import { BookOpen, User } from "lucide-react";

type dataInscripcion =
  | {
      id: number;
      createdAt: string;
      updatedAt: string;
      estado: "activo" | "inactivo" | "pendiente";
      fechaInicio: string;
      fechaFin: string;
      gestionId: number;
      estudianteId: number;
      cursoId: number;
      precioPactado: number;
      fechaInscripcion: string;
      estadoInscripcion: "ACTIVA" | "FINALIZADA" | "ABANDONADA";
      curso: {
        id: number;
        nombreCurso: string;
      };
      estudiante: {
        id: number;
        codigoInterno: string | null;
        persona: {
          nombres: string;
          primerApellido: string;
          segundoApellido: string | null;
        };
      };
    }
  | undefined;

export function FormAsistencia({
  fechaActual,
  dataInscripcion,
}: {
  fechaActual: string;
  dataInscripcion: dataInscripcion;
}) {
  const { formId, isLoading } = useModalStore();
  const { upsertMutation } = useActions();
  const [date, setDate] = useState<Date | undefined>(new Date(fechaActual));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formdata = Object.fromEntries(
      new FormData(e.currentTarget as HTMLFormElement),
    );
    console.log(formdata);
    /* console.log("id", data?.id); */
    upsertMutation.mutate({ values: formdata });
  };

  return (
    <>
      <form id={formId} onSubmit={handleSubmit} className="grid gap-5">
        <div className="flex items-center capitalize rounded-md  gap-4 border overflow-hidden">
          <div className="bg-secondary p-1.5">
            <User size={20} />
          </div>
          <span>
            {`${dataInscripcion?.estudiante?.persona?.nombres} ${dataInscripcion?.estudiante?.persona?.primerApellido} ${dataInscripcion?.estudiante?.persona?.segundoApellido}`}
          </span>
        </div>
        <div className="flex items-center capitalize rounded-md  gap-4 border overflow-hidden">
          <div className="bg-secondary p-1.5">
            <BookOpen size={20} />
          </div>
          <span>{dataInscripcion?.curso.nombreCurso}</span>
        </div>

        <FieldSet>
          <FieldGroup className="grid  ">
            <div className="grid   gap-5 col-span-2 lg:col-span-3 ">
              <Field className="w-full ">
                <FieldLabel
                  htmlFor="fechaActual"
                  className="max-w-fit whitespace-nowrap"
                >
                  Fecha de la clase <span className="text-destructive">*</span>
                </FieldLabel>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-lg border w-full p-1 text-xs "
                  captionLayout="dropdown"
                />
              </Field>
              <Field className="w-full" orientation={"horizontal"}>
                <FieldLabel htmlFor="tipoClase" className="max-w-fit">
                  Formato de clase <span className="text-destructive">*</span>
                </FieldLabel>

                <Select name="tipoClase" defaultValue="PRACTICO">
                  <SelectTrigger id="tipoClase" className="flex-1 w-full">
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {horarioPlantilla.tipo.enumValues.map((valor, index) => (
                        <SelectItem key={index} value={valor}>
                          {valor}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FieldGroup>
        </FieldSet>
      </form>
    </>
  );
}
