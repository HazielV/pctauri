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
import { persona } from "@/db/schema";
import { useState } from "react";

type cursos =
  | {
      id: number;
      createdAt: string;
      updatedAt: string;
      estado: "activo" | "inactivo" | "pendiente";
      nombreCurso: string;
      precioBase: number;
      horasTeoricasReq: number;
      horasPracticasReq: number;
      gestionId: number;
      sucursalId: number;
    }[]
  | undefined;

export function Form({ cursos }: { cursos: cursos }) {
  const [nroDocu, setNroDocu] = useState<string>("");
  const [curso, setCurso] = useState<
    | {
        id: number;
        createdAt: string;
        updatedAt: string;
        estado: "activo" | "inactivo" | "pendiente";
        nombreCurso: string;
        precioBase: number;
        horasTeoricasReq: number;
        horasPracticasReq: number;
        gestionId: number;
        sucursalId: number;
      }
    | undefined
  >();
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
  const { formId } = useModalStore();
  const { upsertMutation, searchMutation } = useActions();

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
    upsertMutation.mutate({ values: formdata, nroDocumento: Number(nroDocu) });
  };

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
          <FieldLabel htmlFor="cursoId">
            Curso <span className="text-destructive">*</span>
          </FieldLabel>

          <Select
            name="cursoId"
            onValueChange={(e) =>
              setCurso(cursos?.find((c) => c.id === Number(e)))
            }
          >
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
          <FieldLabel htmlFor="precioPactado">
            Precio con descuento <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="precioPactado"
              placeholder="Precio con descuento"
              name="precioPactado"
              defaultValue={curso?.precioBase}
              required
            />
          </InputGroup>
        </Field>
        <input
          hidden
          type="text"
          name="gestionId"
          defaultValue={curso?.gestionId}
        />
      </FieldGroup>
    </form>
  );
}
