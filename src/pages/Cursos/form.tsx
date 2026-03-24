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
import { horarioPlantilla } from "@/db/schema";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Trash2 } from "lucide-react";

type NewData =
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
      horarioPlantillas: {
        id: number;
        createdAt: string;
        updatedAt: string;
        estado: "activo" | "inactivo" | "pendiente";
        nombre: string;
        cursoId: number;
        diaSemana:
          | "LUNES"
          | "MARTES"
          | "MIERCOLES"
          | "JUEVES"
          | "VIERNES"
          | "SABADO"
          | "DOMINGO";
        horaInicio: string;
        horaFin: string;
        tipo: "TEORICO" | "PRACTICO";
        instructorId: number | null;
        aulaId: number | null;
      }[];
    }
  | undefined;

type sucursales =
  | {
      id: number;
      direccion: string;
      createdAt: string;
      updatedAt: string;
      estado: "activo" | "inactivo" | "pendiente";
      nombre: string;
    }[]
  | undefined;
type gestiones =
  | {
      id: number;
      createdAt: string;
      updatedAt: string;
      estado: "activo" | "inactivo" | "pendiente";
      nombre: string;
      fechaInicio: string;
      fechaFin: string;
      estadoGestion: "ACTIVA" | "CERRADA";
    }[]
  | undefined;

export function Form({
  data,
  sucursales,
  gestiones,
}: {
  data?: NewData | undefined;
  sucursales: sucursales;
  gestiones: gestiones;
}) {
  const { formId } = useModalStore();
  const { upsertMutation } = useActions();
  // Usamos crypto.randomUUID() o Date.now() para IDs únicos temporales
  const [horariosCurso, setHorariosCurso] = useState(
    data?.horarioPlantillas.map((h) => ({
      tempId: h.id,
      diaSemana: h.diaSemana as string,
      tipo: h.tipo as string,
      horaInicio: h.horaInicio,
      horaFin: h.horaFin,
    })) || [
      {
        tempId: Date.now(),
        diaSemana: "",
        tipo: "",
        horaInicio: "",
        horaFin: "",
      },
    ],
  );

  const agregarHorario = () => {
    setHorariosCurso([
      ...horariosCurso,
      {
        tempId: Date.now(),
        diaSemana: "",
        tipo: "",
        horaInicio: "",
        horaFin: "",
      },
    ]);
  };

  const eliminarHorario = (id: number) => {
    // Evitar que se queden sin ningún horario si así lo prefieres
    if (horariosCurso.length === 1) return;
    setHorariosCurso(horariosCurso.filter((h) => h.tempId !== id));
  };

  const actualizarHorario = (id: number, campo: string, valor: string) => {
    let valorFinal = valor;

    if ((campo === "horaInicio" || campo === "horaFin") && valor) {
      const [h] = valor.split(":");

      const horarioPrevio = horariosCurso.find((h) => h.tempId === id);
      const valorAnterior = horarioPrevio
        ? (horarioPrevio[campo as keyof typeof horarioPrevio] as string)
        : "";

      // LÓGICA: Si antes estaba vacío, forzamos el inicio en :00 para comodidad
      if (!valorAnterior || valorAnterior === "") {
        valorFinal = `${h}:00`;
      }
      // Si ya tenía valor, dejamos que el usuario elija el minuto libremente
      else {
        valorFinal = valor;
      }
    }

    setHorariosCurso(
      horariosCurso.map((h) =>
        h.tempId === id ? { ...h, [campo]: valorFinal } : h,
      ),
    );
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formdata = Object.fromEntries(
      new FormData(e.currentTarget as HTMLFormElement),
    );
    const horariosParaEnviar = horariosCurso.map(
      ({ tempId, ...resto }) => resto,
    );
    upsertMutation.mutate({
      id: data?.id,
      values: {
        ...formdata,
        horarios: horariosParaEnviar,
      },
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="grid gap-5">
      <FieldGroup className="grid grid-cols-2 lg:grid-cols-3">
        <Field className="w-full col-span-2">
          <FieldLabel htmlFor="nombreCurso">
            Nombre <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="nombreCurso"
              placeholder="Nombre del curso"
              name="nombreCurso"
              defaultValue={data?.nombreCurso}
              required
            />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="precioBase">
            Precio inicial <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="precioBase"
              placeholder="Precio inicial"
              name="precioBase"
              defaultValue={data?.precioBase}
              required
            />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="gestionId">
            Gestion <span className="text-destructive">*</span>
          </FieldLabel>

          <Select
            name="gestionId"
            defaultValue={data ? String(data?.gestionId) : undefined}
          >
            <SelectTrigger id="gestionId">
              <SelectValue placeholder="Seleccione una gestion" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {gestiones?.map((valor, index) => (
                  <SelectItem key={index} value={String(valor.id)}>
                    {valor.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="sucursalId">
            Sucursal <span className="text-destructive">*</span>
          </FieldLabel>

          <Select
            name="sucursalId"
            defaultValue={data ? String(data?.sucursalId) : undefined}
          >
            <SelectTrigger id="sucursalId">
              <SelectValue placeholder="Seleccione una sucursal" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {sucursales?.map((valor, index) => (
                  <SelectItem key={index} value={String(valor.id)}>
                    {valor.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="horasTeoricasReq">
            Horas teoricas <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="horasTeoricasReq"
              placeholder="Requisito de horas "
              name="horasTeoricasReq"
              type="number"
              min={0}
              defaultValue={data?.horasTeoricasReq}
              required
            />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="horasPracticasReq">
            Horas Practicas <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="horasPracticasReq"
              placeholder="Requisito de horas "
              name="horasPracticasReq"
              type="number"
              min={1}
              defaultValue={data?.horasPracticasReq}
              required
            />
          </InputGroup>
        </Field>
      </FieldGroup>
      <FieldSeparator />
      <FieldSet>
        <FieldLegend className="w-full relative pb-3">
          <span>Horario</span>
          <Button
            type="button"
            onClick={agregarHorario}
            size={"sm"}
            variant={"outline"}
            className="absolute right-0 text-xs"
          >
            <CalendarPlus size={20} />
            Nuevo horario
          </Button>
        </FieldLegend>
        {horariosCurso.map((horario) => (
          <FieldGroup
            key={horario.tempId}
            className="grid grid-cols-9 relative "
          >
            {/* DIA SEMANA */}
            <Field className="w-full col-span-4 md:col-span-2">
              <FieldLabel>
                Día <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                value={horario.diaSemana}
                onValueChange={(val) =>
                  actualizarHorario(horario.tempId, "diaSemana", val)
                }
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

            {/* TIPO */}
            <Field className="w-full col-span-4 md:col-span-2">
              <FieldLabel>
                Tipo <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                value={horario.tipo}
                onValueChange={(val) =>
                  actualizarHorario(horario.tempId, "tipo", val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Teórico/Práctico" />
                </SelectTrigger>
                <SelectContent>
                  {horarioPlantilla.tipo.enumValues.map((val) => (
                    <SelectItem key={val} value={val}>
                      {val}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* HORA INICIO */}
            <Field className="w-full col-span-4 md:col-span-2">
              <FieldLabel>Hora inicio</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  type="time"
                  value={horario.horaInicio}
                  onChange={(e) =>
                    actualizarHorario(
                      horario.tempId,
                      "horaInicio",
                      e.target.value,
                    )
                  }
                  required
                />
              </InputGroup>
            </Field>

            {/* HORA FIN */}
            <Field className="w-full col-span-4 md:col-span-2">
              <FieldLabel>Hora fin</FieldLabel>

              <InputGroup>
                <InputGroupInput
                  type="time"
                  value={horario.horaFin}
                  onChange={(e) =>
                    actualizarHorario(horario.tempId, "horaFin", e.target.value)
                  }
                  required
                />
              </InputGroup>

              {/* Botón Eliminar (solo si hay más de 1) */}
            </Field>
            {horariosCurso.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive mt-1 relative self-end "
                onClick={() => eliminarHorario(horario.tempId)}
              >
                <Trash2 size={18} />
              </Button>
            )}
          </FieldGroup>
        ))}
      </FieldSet>
    </form>
  );
}
