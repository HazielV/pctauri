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
      id: number;
      createdAt: string;
      updatedAt: string;
      estado: "activo" | "inactivo" | "finalizado" | "en curso" | "programado";
      nombreCurso: string;
      precioBase: number;
      horasTeoricasReq: number;
      horasPracticasReq: number;
      gestionId: number;
      sucursalId: number;
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
export function Form({
  vehiculos,
  instructores,
  cursos,
}: {
  cursos: cursos;
  instructores: instructores;
  vehiculos: vehiculos;
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
      nroDocumento: findpersona ? Number(findpersona.nroDocumento) : undefined,
    });
  };
  const { data: horariosDisponibles } = useGetHorariosCurso(
    Number(cursoId || 0),
  );
  return (
    <form id={formId} onSubmit={handleSubmit} className="grid gap-5">
      <FieldSet>
        <FieldLegend>Datos de persona</FieldLegend>
        <FieldGroup className="grid grid-cols-2 lg:grid-cols-3">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 col-span-2 lg:col-span-3 ">
            <Field className="w-full">
              <FieldLabel htmlFor="tipoDocumento">
                Tipo documento <span className="text-destructive">*</span>
              </FieldLabel>

              <Select
                name="tipoDocumento"
                defaultValue={
                  findpersona?.tipoDocumento ||
                  persona.tipoDocumento.enumValues[0]
                }
              >
                <SelectTrigger id="tipoDocumento">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {persona.tipoDocumento.enumValues.map((valor, index) => (
                      <SelectItem key={index} value={valor}>
                        {valor}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field className="w-full">
              <FieldLabel htmlFor="nroDocumento">
                Nro documento <span className="text-destructive">*</span>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="nroDocumento"
                  placeholder="Numero de documento"
                  name="nroDocumento"
                  type="number"
                  defaultValue={findpersona?.nroDocumento || undefined}
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
            <FieldLabel htmlFor="primerApellido">
              Primer apelldio <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="primerApellido"
                placeholder="Ingrese su primer apellido"
                name="primerApellido"
                defaultValue={findpersona?.primerApellido}
                disabled={!!findpersona}
              />
            </InputGroup>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="segundoApellido">Segundo apelldio</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="segundoApellido"
                placeholder="Ingrese su segundo apellido"
                name="segundoApellido"
                defaultValue={findpersona?.segundoApellido || undefined}
                disabled={!!findpersona}
              />
            </InputGroup>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="fechaNacimiento">
              Fecha de nacimiento <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="fechaNacimiento"
                placeholder="Ingrese su correo"
                name="fechaNacimiento"
                type="date"
                defaultValue={findpersona?.fechaNacimiento || undefined}
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
              name="sexo"
              defaultValue={findpersona?.sexo || persona.sexo.enumValues[0]}
            >
              <SelectTrigger id="sexo">
                <SelectValue placeholder="Seleccione un sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {persona.sexo.enumValues.map((valor, index) => (
                    <SelectItem key={index} value={valor}>
                      {valor}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="nroCelular">
              Nro. Celular <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="nroCelular"
                placeholder="Numero de celular"
                name="nroCelular"
                type="number"
                defaultValue={findpersona?.nroCelular || undefined}
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
                    {valor.nombreCurso}
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
                    {`${valor.diaSemana} ${valor.horaInicio}-${valor.horaFin}`}
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
                cursos?.find((c) => c.id === Number(cursoId || 0))
                  ?.precioBase || ""
              }
              required
            />
          </InputGroup>
        </Field>
        <input
          hidden
          type="text"
          name="gestionId"
          defaultValue={
            cursos?.find((c) => c.id === Number(cursoId || 0))?.gestionId || ""
          }
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
                {horarioPlantilla.diaSemana.enumValues.map((val) => (
                  <SelectItem key={val} value={val}>
                    {val}
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
                    {`${val.persona.nombres} ${val.persona.primerApellido} ${val.persona.segundoApellido}`}
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
