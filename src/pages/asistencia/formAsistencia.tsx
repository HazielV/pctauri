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
import { addDays, parseISO, startOfDay } from "date-fns";

type dataInscripcion =
  | {
      id: string;
      estado_id: string;
      created_at: string;
      updated_at: string;
      fecha_inicio: string;
      fecha_fin: string;
      gestion_id: string;
      estudiante_id: string;
      curso_id: string;
      precio_pactado: number;
      horario_plantilla_id: string;
      fecha_inscripcion: string;
      estado_inscripcion_id: string;
      curso: {
        id: string;
        nombre_curso: string;
      };
      estudiante: {
        id: string;
        codigo_interno: string | null;
        persona: {
          nombres: string;
          primer_apellido: string;
          segundo_apellido: string | null;
        };
      };
    }
  | undefined;
type instructores =
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
    }[]
  | undefined;
type vehiculos =
  | {
      id: string;
      estado_id: string;
      created_at: string;
      updated_at: string;
      placa: string;
      marca: string;
      estado_operativo_id: string;
    }[]
  | undefined;
export function FormAsistencia({
  fechaActual,
  dataInscripcion,
  vehiculos,
  instructores,
}: {
  fechaActual: string;
  dataInscripcion: dataInscripcion;
  vehiculos: vehiculos;
  instructores: instructores;
}) {
  const { formId, isLoading } = useModalStore();
  const { upsertMutation } = useActions();
  const [date, setDate] = useState<Date>(
    fechaActual ? parseISO(fechaActual) : addDays(new Date(), 1),
  );
  const mañana = startOfDay(addDays(new Date(), 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formdata = Object.fromEntries(
      new FormData(e.currentTarget as HTMLFormElement),
    );
    console.log(formdata);
    /* console.log("id", data?.id); */
    upsertMutation.mutate({ values: formdata, fecha: date });
  };

  return (
    <>
      <form id={formId} onSubmit={handleSubmit} className="grid gap-4 pb-2">
        <input
          type="hidden"
          name="inscripcionId"
          defaultValue={dataInscripcion?.id}
          readOnly
        />
        <div className="grid grid-cols-4  text-sm font-medium gap-2 gap-y-1 border rounded-md p-3">
          <div className="text-primary/60 ">Estudiante:</div>
          <div className="text-primary/60">Curso:</div>
          <div className="text-primary/60">fecha inicio:</div>
          <div className="text-primary/60">fecha fin:</div>
          <div className="capitalize ">
            {`${dataInscripcion?.estudiante?.persona?.nombres} ${dataInscripcion?.estudiante?.persona?.primer_apellido} ${dataInscripcion?.estudiante?.persona?.segundo_apellido}`}
          </div>

          <div className="capitalize  ">
            {dataInscripcion?.curso.nombre_curso}
          </div>
          <div className="capitalize  ">{dataInscripcion?.fecha_inicio}</div>
          <div className="capitalize  ">{dataInscripcion?.fecha_fin}</div>
        </div>
        <div className="flex gap-5 p-0.5">
          <FieldGroup className="w-[85%]">
            <div className="">
              <Field className=" ">
                <FieldLabel
                  htmlFor="fechaActual"
                  className="max-w-fit whitespace-nowrap"
                >
                  Fecha de la clase <span className="text-destructive ">*</span>
                </FieldLabel>

                <Calendar
                  mode="single"
                  selected={date}
                  required
                  onSelect={setDate}
                  className="rounded-lg border [--cell-size:1.75rem] relative p-1 "
                  captionLayout="dropdown"
                  disabled={(date) => date < mañana}
                  classNames={{
                    // Forzamos que los botones de navegación no estiren el header
                    nav: "flex px-0! items-center justify-between absolute w-full z-10",
                  }}
                />
              </Field>
            </div>
          </FieldGroup>
          <div className="flex flex-col  w-full">
            <FieldSet>
              <FieldLabel>Datos de la clase</FieldLabel>
              <FieldGroup className="grid grid-cols-2">
                <Field className="w-full">
                  <FieldLabel htmlFor="vehiculoId" className="max-w-fit">
                    Hora inicio <span className="text-destructive">*</span>
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      placeholder="Ingrese el pago/cuota"
                      type="time"
                      name="horaIni"
                      required
                    />
                  </InputGroup>
                </Field>
                <Field className="w-full">
                  <FieldLabel htmlFor="vehiculoId" className="max-w-fit">
                    Hora fin <span className="text-destructive">*</span>
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      placeholder="Ingrese el pago/cuota"
                      type="time"
                      name="horaFin"
                      required
                    />
                  </InputGroup>
                </Field>
              </FieldGroup>
              <FieldGroup className=" ">
                <Field className="w-full">
                  <FieldLabel htmlFor="vehiculoId" className="max-w-fit">
                    Vehiculos disponibles
                  </FieldLabel>

                  <Select name="vehiculoId" defaultValue="PRACTICO">
                    <SelectTrigger id="vehiculoId" className="flex-1 w-full">
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {vehiculos?.map((valor, index) => (
                          <SelectItem key={index} value={String(valor.id)}>
                            {`${valor.marca} ${valor.placa}`}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field className="w-full">
                  <FieldLabel htmlFor="instructorId" className="max-w-fit">
                    Instructores disponibles
                    <span className="text-destructive">*</span>
                  </FieldLabel>

                  <Select name="instructorId" defaultValue="PRACTICO">
                    <SelectTrigger id="instructorId" className="flex-1 w-full">
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {instructores?.map((valor, index) => (
                          <SelectItem key={index} value={String(valor.id)}>
                            {`${valor.persona.nombres} ${valor.persona.primer_apellido} ${valor.persona.segundo_apellido}`}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </FieldSet>
          </div>
        </div>
      </form>
    </>
  );
}
