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
import { asistenciaGeneral, pago } from "@/db/schema";
import { useModalStore } from "@/store/modalState";
import { useActions } from "./useActions";
import { useState } from "react";
export default function FormClase({
  fecha,
  claseId,
  tipoClase,
  inscripcionId,
  data,
}: {
  fecha: string;
  claseId: number;
  tipoClase: string;
  inscripcionId: number;
  data: any;
}) {
  const { formId } = useModalStore();
  const [metodoPago, setMetodoPago] = useState("");
  const { upsertAsistenciaMutation } = useActions();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formdata = Object.fromEntries(
      new FormData(e.currentTarget as HTMLFormElement),
    );

    upsertAsistenciaMutation.mutate({
      id: data?.id,
      values: { ...formdata, inscripcionId, tipoClase, claseId },
    });
  };
  console.log(data?.estadoAsistencia);
  return (
    <form id={formId} onSubmit={handleSubmit}>
      <FieldGroup className="">
        <Field className=" ">
          <FieldLabel
            htmlFor="fechaActual"
            className="max-w-fit whitespace-nowrap"
          >
            Fecha
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              name="fechaActual"
              type="date"
              required
              defaultValue={fecha}
              readOnly
              disabled
            />
          </InputGroup>
        </Field>
        <Field className=" ">
          <FieldLabel
            htmlFor="estadoAsistencia"
            className="max-w-fit whitespace-nowrap"
          >
            Tipo de asistencia <span className="text-destructive ">*</span>
          </FieldLabel>
          <Select
            name="estadoAsistencia"
            defaultValue={data?.estadoAsistencia || "PRESENTE"}
          >
            <SelectTrigger id="estadoAsistencia" className="flex-1 w-full">
              <SelectValue placeholder="Seleccione un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {tipoClase === "P"
                  ? asistenciaGeneral.estadoAsistencia.enumValues.map(
                      (e, ind) => (
                        <SelectItem key={ind} value={e}>
                          {e}
                        </SelectItem>
                      ),
                    )
                  : asistenciaGeneral.estadoAsistencia.enumValues
                      .filter((e) => e != "PROGRAMADA" && e != "REPROGRAMADA")
                      .map((e, ind) => (
                        <SelectItem key={ind} value={e}>
                          {e}
                        </SelectItem>
                      ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field className=" ">
          <FieldLabel
            htmlFor="metodoPago"
            className="max-w-fit whitespace-nowrap"
          >
            Metodo de pago
          </FieldLabel>
          <Select
            value={metodoPago}
            onValueChange={(e) => setMetodoPago(e)}
            name="metodoPago"
            defaultValue="EFECTIVO"
          >
            <SelectTrigger id="metodoPago" className="flex-1 w-full">
              <SelectValue placeholder="Seleccione un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {pago.metodoPago.enumValues.map((e, ind) => (
                  <SelectItem key={ind} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        {metodoPago && (
          <Field className=" ">
            <FieldLabel
              htmlFor="montoPago"
              className="max-w-fit whitespace-nowrap"
            >
              Pago de la clase (bs.){" "}
              <span className="text-destructive ">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                placeholder="Ingrese el pago/cuota"
                name="montoPago"
                required
              />
            </InputGroup>
          </Field>
        )}
      </FieldGroup>
    </form>
  );
}
