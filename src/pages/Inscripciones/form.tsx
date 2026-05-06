import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";

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
import { horarioPlantilla, persona, vehiculo } from "@/db/schema";
import { useState } from "react";
import { Fieldset } from "@base-ui/react";

type cursos =
  | {
      id: string;
      estado_id: string;
      created_at: string;
      updated_at: string;
      nombre_curso: string;
      precio_base: number;
      horas_teoricas_req: number;
      horas_practicas_req: number;
      gestion_id: string;
      sucursal_id: string;
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
type catalogos =
  | {
      id: string;
      nombre: string;
      categoria: string | null;
      descripcion: string | null;
    }[]
  | undefined;
export function Form({
  vehiculos,
  instructores,
  cursos,
  catalogos,
}: {
  cursos: cursos;
  instructores: instructores;
  vehiculos: vehiculos;
  catalogos: catalogos;
}) {
  const [horarioPractico, setHorarioPractico] = useState({
    tempId: Date.now(),
    diaSemana: "",
    horaInicio: "",
    horaFin: "",
  });

  const [nroDocu, setNroDocu] = useState<string>("");
  const [cursoId, setCursoId] = useState("");
  const [findpersona, setFindPersona] = useState<
    | {
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
      }
    | undefined
  >();
  const handleHorario = (clave: string, valor: string) => {
    setHorarioPractico((prev) => ({ ...prev, [clave]: valor }));
  };
  const { formId } = useModalStore();
  const { upsertMutation, searchMutation, useGetHorariosCurso } = useActions();

  const buscarPersonaXci = async () => {
    const ci = nroDocu;
    if (ci && ci.length > 3) {
      const encontrado = await searchMutation.mutateAsync(ci);
      console.log("encontrado", encontrado);

      setFindPersona(encontrado);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formdata = Object.fromEntries(
      new FormData(e.currentTarget as HTMLFormElement),
    );
    console.log(formdata);
    /* console.log("id", data?.id); */
    upsertMutation.mutate({
      values: formdata,
      nroDocumento: findpersona ? Number(findpersona.nro_documento) : undefined,
    });
  };
  const { data: horariosDisponibles } = useGetHorariosCurso(cursoId);
  return (
    <form id={formId} onSubmit={handleSubmit} className="grid gap-5">
      <FieldSet>
        <FieldLegend>Datos de persona</FieldLegend>
        <FieldGroup className="grid grid-cols-2 lg:grid-cols-3">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 col-span-2 lg:col-span-3 ">
            <Field className="w-full">
              <FieldLabel htmlFor="tipo_documento_id">
                Tipo documento <span className="text-destructive">*</span>
              </FieldLabel>

              <Select
                name="tipo_documento_id"
                defaultValue={
                  catalogos?.filter(
                    (c) => c.categoria === "TIPO_DOCUMENTO",
                  )?.[0].id
                }
              >
                <SelectTrigger id="tipo_documento_id">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {catalogos
                      ?.filter((c) => c.categoria === "TIPO_DOCUMENTO")
                      .map((valor) => (
                        <SelectItem key={valor.id} value={valor.id}>
                          {valor.nombre}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field className="w-full">
              <FieldLabel htmlFor="nro_documento">
                Nro documento <span className="text-destructive">*</span>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="nro_documento"
                  placeholder="Numero de documento"
                  name="nro_documento"
                  type="number"
                  defaultValue={findpersona?.nro_documento || undefined}
                  value={nroDocu}
                  onChange={(e) => setNroDocu(e.target.value)}
                  onBlur={buscarPersonaXci}
                />
              </InputGroup>
            </Field>
          </div>
          <Field className="w-full">
            <FieldLabel htmlFor="nombres">
              Nombres <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="nombres"
                placeholder="Ingrese su nombre"
                name="nombres"
                defaultValue={findpersona?.nombres}
                disabled={!!findpersona}
              />
            </InputGroup>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="primer_apellido">
              Primer apelldio <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="primer_apellido"
                placeholder="Ingrese su primer apellido"
                name="primer_apellido"
                defaultValue={findpersona?.primer_apellido}
                disabled={!!findpersona}
              />
            </InputGroup>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="segundo_apellido">Segundo apelldio</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="segundo_apellido"
                placeholder="Ingrese su segundo apellido"
                name="segundo_apellido"
                defaultValue={findpersona?.segundo_apellido || undefined}
                disabled={!!findpersona}
              />
            </InputGroup>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="fecha_nacimiento">
              Fecha de nacimiento <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="fecha_nacimiento"
                placeholder="Ingrese su correo"
                name="fecha_nacimiento"
                type="date"
                defaultValue={findpersona?.fecha_nacimiento || undefined}
                disabled={!!findpersona}
              />
            </InputGroup>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="email">
              Correo <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="email"
                placeholder="Ingrese su correo"
                name="email"
                type="email"
                defaultValue={findpersona?.email || undefined}
                disabled={!!findpersona}
              />
            </InputGroup>
          </Field>

          <Field className="w-full">
            <FieldLabel htmlFor="direccion">Direccion</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="direccion"
                placeholder="Ingrese su direccion"
                name="direccion"
                defaultValue={findpersona?.direccion || undefined}
                disabled={!!findpersona}
              />
            </InputGroup>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="sexo">
              Sexo <span className="text-destructive">*</span>
            </FieldLabel>
            <Select
              disabled={!!findpersona}
              name="sexo_id"
              defaultValue={
                findpersona?.sexo_id ||
                catalogos?.filter((c) => c.categoria === "SEXO")?.[0].id
              }
            >
              <SelectTrigger id="sexo">
                <SelectValue placeholder="Seleccione un sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {catalogos
                    ?.filter((c) => c.categoria === "SEXO")
                    .map((valor) => (
                      <SelectItem key={valor.id} value={valor.id}>
                        {valor.nombre}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="nro_celular">
              Nro. Celular <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="nro_celular"
                placeholder="Numero de celular"
                name="nro_celular"
                type="number"
                defaultValue={findpersona?.nro_celular || undefined}
                disabled={!!findpersona}
              />
            </InputGroup>
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSeparator />
      <FieldGroup className="grid grid-cols-2 lg:grid-cols-3">
        <Field className="w-full">
          <FieldLabel htmlFor="fechaInicio">
            Fecha Inicio <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput id="fechaInicio" name="fechaInicio" type="date" />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="fechaFin">
            Fecha Fin <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput id="fechaFin" name="fechaFin" type="date" />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="cursoId">
            Curso <span className="text-destructive">*</span>
          </FieldLabel>

          <Select name="cursoId" onValueChange={setCursoId}>
            <SelectTrigger id="cursoId">
              <SelectValue placeholder="Seleccione una gestion" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {cursos?.map((valor, index) => (
                  <SelectItem key={index} value={String(valor.id)}>
                    {valor.nombre_curso}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="horarioPlantillaId">
            Horarios <span className="text-destructive">*</span>
          </FieldLabel>

          <Select name="horarioPlantillaId">
            <SelectTrigger id="horarioPlantillaId">
              <SelectValue placeholder="Seleccione un horario" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {horariosDisponibles?.map((valor, index) => (
                  <SelectItem key={index} value={String(valor.id)}>
                    {`${valor.diaSemana.nombre} ${valor.hora_inicio}-${valor.hora_fin}`}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="precioPactado">
            Precio con descuento <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="precioPactado"
              placeholder="Precio con descuento"
              name="precioPactado"
              defaultValue={
                cursos?.find((c) => c.id === cursoId)?.precio_base || ""
              }
              required
            />
          </InputGroup>
        </Field>
        <input
          hidden
          type="text"
          name="gestion_id"
          defaultValue={cursos?.find((c) => c.id === cursoId)?.gestion_id || ""}
        />
      </FieldGroup>
      <FieldSeparator />
      <FieldSet>
        <FieldLegend>Horario practico</FieldLegend>
        <FieldGroup className="grid grid-cols-3 relative pb-2">
          {/* DIA SEMANA */}
          <Field className="w-full col-span-3 md:col-span-1">
            <FieldLabel>
              Día <span className="text-destructive">*</span>
            </FieldLabel>
            <Select
              name="diaSemanaPractico"
              onValueChange={(e) => handleHorario("diaSemana", e)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un día" />
              </SelectTrigger>
              <SelectContent>
                {catalogos
                  ?.filter((c) => c.categoria === "DIA_SEMANA")
                  .map((valor) => (
                    <SelectItem key={valor.id} value={valor.id}>
                      {valor.nombre}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>

          {/* HORA INICIO */}
          <Field className="w-full col-span-3 md:col-span-1">
            <FieldLabel>Hora inicio</FieldLabel>
            <InputGroup>
              <InputGroupInput
                type="time"
                required
                name="horaPracticaInicio"
                onChange={(e) => handleHorario(e.target.name, e.target.value)}
              />
            </InputGroup>
          </Field>

          {/* HORA FIN */}
          <Field className="w-full col-span-3 md:col-span-1">
            <FieldLabel>Hora fin</FieldLabel>

            <InputGroup>
              <InputGroupInput
                type="time"
                required
                name="horaPracticaFin"
                onChange={(e) => handleHorario(e.target.name, e.target.value)}
              />
            </InputGroup>
          </Field>
          <Field className="w-full col-span-3 md:col-span-1">
            <FieldLabel>
              Instructor <span className="text-destructive">*</span>
            </FieldLabel>
            <Select name="instructorId">
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un día" />
              </SelectTrigger>
              <SelectContent>
                {instructores?.map((val) => (
                  <SelectItem
                    key={val.id}
                    value={String(val.id)}
                    className="capitalize"
                  >
                    {`${val.persona.nombres} ${val.persona.primer_apellido} ${val.persona.segundo_apellido}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field className="w-full col-span-3 md:col-span-1">
            <FieldLabel>
              Vehiculo <span className="text-destructive">*</span>
            </FieldLabel>
            <Select name="vehiculoId">
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un día" />
              </SelectTrigger>
              <SelectContent>
                {vehiculos?.map((val) => (
                  <SelectItem
                    key={val.id}
                    value={String(val.id)}
                    className="capitalize"
                  >
                    {`${val.marca}-${val.placa}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
