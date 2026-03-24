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
      id: number;
      createdAt: string;
      updatedAt: string;
      estado: "activo" | "inactivo" | "pendiente" | "finalizada" | "abandonada";
      fechaInicio: string;
      fechaFin: string;
      gestionId: number;
      estudianteId: number;
      cursoId: number;
      precioPactado: number;
      horarioPlantillaId: number;
      fechaInscripcion: string;
      estadoInscripcion: "pendiente" | "reprobado" | "aprobado";
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
type instructores =
  | {
      id: number;
      createdAt: string;
      updatedAt: string;
      estado: "activo" | "inactivo" | "pendiente";
      personaId: number;
      nroLicencia: string;
      disponibilidadActiva: boolean;
      persona: {
        id: number;
        nombres: string;
        primerApellido: string;
        segundoApellido: string | null;
        nroDocumento: number;
        nroCelular: number;
        email: string;
        sexo: "MASCULINO" | "FEMENINO" | "OTRO";
        fechaNacimiento: string;
        direccion: string | null;
        createdAt: string;
        updatedAt: string;
        tipoDocumento: "CEDULA" | "PASAPORTE" | "EXTRANJERO";
        estado: "activo" | "inactivo" | "pendiente";
      };
    }[]
  | undefined;
type vehiculos =
  | {
      id: number;
      createdAt: string;
      updatedAt: string;
      estado: "activo" | "inactivo" | "pendiente";
      placa: string;
      marca: string;
      estadoOperativo: "DISPONIBLE" | "MANTENIMIENTO" | "AVERIADO";
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
            {`${dataInscripcion?.estudiante?.persona?.nombres} ${dataInscripcion?.estudiante?.persona?.primerApellido} ${dataInscripcion?.estudiante?.persona?.segundoApellido}`}
          </div>

          <div className="capitalize  ">
            {dataInscripcion?.curso.nombreCurso}
          </div>
          <div className="capitalize  ">{dataInscripcion?.fechaInicio}</div>
          <div className="capitalize  ">{dataInscripcion?.fechaFin}</div>
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
                            {`${valor.persona.nombres} ${valor.persona.primerApellido}`}
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
