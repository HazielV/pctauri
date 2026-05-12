import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModalStore } from "@/store/modalState";
import { useActions } from "./useActions";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
type catalogos =
  | {
      id: string;
      nombre: string;
      categoria: string | null;
      descripcion: string | null;
    }[]
  | undefined;
type estados =
  | {
      id: string;
      nombre: string;
      categoria: string | null;
      descripcion: string | null;
    }[]
  | undefined;
export default function FormClase({
  cursoId,
  fecha,
  claseId,
  tipoClase,
  inscripcionId,
  data,
  catalogos,
  estados,
}: {
  fecha: string;
  claseId: string;
  tipoClase: string;
  inscripcionId: string;
  data: any;
  cursoId: string;
  catalogos: catalogos;
  estados: estados;
}) {
  const { formId } = useModalStore();
  const { upsertAsistenciaMutation, useModalContextData } = useActions();
  const { data: contexto, isLoading } = useModalContextData({
    inscripcionId,
    cursoId,
    fecha,
    tipoClase,
    claseId,
  });
  const [temasSeleccionados, setTemasSeleccionados] = useState<string[]>([]);

  // Cuando la data cargue, inicializamos los checkboxes que ya estaban guardados
  useEffect(() => {
    if (contexto?.avanzadosHoy) {
      setTemasSeleccionados(contexto.avanzadosHoy);
    }
  }, [contexto]);
  const toggleTema = (temaId: string) => {
    setTemasSeleccionados((prev) =>
      prev.includes(temaId)
        ? prev.filter((id) => id !== temaId)
        : [...prev, temaId],
    );
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formdata = Object.fromEntries(
      new FormData(e.currentTarget as HTMLFormElement),
    );

    upsertAsistenciaMutation.mutate({
      id: data?.id,
      values: {
        ...formdata,
        inscripcionId,
        tipoClase,
        claseId,
        // Agregamos los temas seleccionados y el id del examen si hubo nota
        temasAvanzados: temasSeleccionados,
        examenProgramadoId: contexto?.examen?.id,
      },
    });
  };

  /* const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formdata = Object.fromEntries(
      new FormData(e.currentTarget as HTMLFormElement),
    );

    upsertAsistenciaMutation.mutate({
      id: data?.id,
      values: { ...formdata, inscripcionId, tipoClase, claseId },
    });
  }; */
  console.log(contexto);
  if (isLoading)
    return (
      <div className="p-10 text-center">Cargando datos de la clase...</div>
    );
  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-8"
    >
      <FieldSet className="">
        <FieldLegend variant="label">
          Avance de la Clase (Checklist)
        </FieldLegend>
        <FieldGroup className="p-3 rounded-lg border grid gap-2">
          {contexto?.temas && contexto.temas.length > 0 && (
            <>
              {contexto.temas.map((t: any, index) => (
                <Field orientation="horizontal" key={index}>
                  <Checkbox
                    id={String(t.id + "-" + index)}
                    name={t.id}
                    checked={temasSeleccionados.includes(t.id)}
                    onCheckedChange={(e) => {
                      console.log(e);
                      toggleTema(t.id);
                    }}
                  />
                  <FieldLabel
                    htmlFor={String(t.id + "-" + index)}
                    className="font-normal capitalize"
                  >
                    {t.titulo}
                  </FieldLabel>
                </Field>
              ))}
            </>
          )}
        </FieldGroup>
        <div className=" ">
          <h3 className="font-semibold text-sm mb-3">Pagos del curso</h3>
          <div className="flex gap-4 mb-4 p-3 rounded-lg border border-border  flex-col">
            <div className="flex justify-between border-b pb-4">
              <div className="text-base flex flex-col ">
                <span className="text-center font-medium ">
                  Bs. {contexto?.finanzas.deuda}
                </span>
                <span className="block text-muted-foreground font-medium text-sm">
                  Costo Total:
                </span>
              </div>
              <div className="text-base flex flex-col ">
                <span className="text-center font-medium">
                  Bs. {contexto?.finanzas.pagado}
                </span>
                <span className="block text-muted-foreground font-medium text-sm">
                  Pagado:
                </span>
              </div>
              <div className="text-base flex flex-col ">
                <span className="text-center font-medium">
                  Bs. {contexto?.finanzas.total}
                </span>
                <span className="block text-muted-foreground font-medium text-sm">
                  Deuda Actual:
                </span>
              </div>
            </div>

            <FieldGroup className="flex-row gap-4">
              <Field className="flex-1 ">
                <FieldLabel
                  htmlFor="metodoPago"
                  className="max-w-fit whitespace-nowrap"
                >
                  Metodo de pago
                </FieldLabel>
                <Select
                  disabled={contexto?.finanzas.deuda === 0}
                  name="metodoPago"
                  defaultValue={
                    data?.estadoAcademico?.id ||
                    catalogos
                      ?.filter((c) => c.categoria === "METODO_PAGO")
                      .find((c) => c.nombre === "EFECTIVO")?.id
                  }
                >
                  <SelectTrigger id="metodoPago" className="flex-1 w-full">
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {catalogos
                        ?.filter((c) => c.categoria === "METODO_PAGO")
                        .map((valor) => (
                          <SelectItem key={valor.id} value={valor.id}>
                            {valor.nombre}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field className="w-2/6 ">
                <FieldLabel
                  htmlFor="montoPago"
                  className="max-w-fit whitespace-nowrap"
                >
                  Monto (bs.)
                  <span className="text-destructive ">*</span>
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    className="disabled:cursor-not-allowed"
                    placeholder="pago/cuota"
                    name="montoPago"
                    type="number"
                    autoComplete={"off"}
                    disabled={contexto?.finanzas.deuda === 0}
                    max={contexto?.finanzas.deuda}
                  />
                </InputGroup>
              </Field>
            </FieldGroup>
          </div>
        </div>
      </FieldSet>
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
            required
            name="estadoAsistencia"
            defaultValue={data?.estadoAcademico?.id}
          >
            <SelectTrigger id="estadoAsistencia" className="flex-1 w-full">
              <SelectValue placeholder="Seleccione un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {estados
                  ?.filter((e) => e.categoria === "ESTADO_ACADEMICO")
                  .map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nombre}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <div className="">
          <h3 className="font-semibold text-sm mb-2 ">Examenes:</h3>
          {contexto?.examen ? (
            <Field className="flex gap-2 items-center">
              <FieldLabel className="whitespace-nowrap">
                Nota obtenida:
              </FieldLabel>
              <InputGroup className="w-24">
                <InputGroupInput
                  type="number"
                  required
                  min={0}
                  max={100}
                  name="notaExamen"
                  defaultValue={
                    contexto.examen.evaluacionesEstudiantes[0]?.nota || ""
                  }
                  placeholder="/ 100"
                />
              </InputGroup>
            </Field>
          ) : (
            <div className="p-3 text-sm border rounded-lg">
              no tiene ningun examen programado en esta fecha
            </div>
          )}
        </div>
      </FieldGroup>
    </form>
  );
}
