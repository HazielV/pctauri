import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { v4 as uuidv4 } from "uuid";
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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Trash2 } from "lucide-react";

type NewData =
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
      horarioPlantillas: {
        id: string;
        nombre: string;
        estado_id: string;
        created_at: string;
        updated_at: string;
        curso_id: string;
        dia_semana_id: string;
        tipo_clase_id: string;
        hora_inicio: string;
        hora_fin: string;
        instructor_id: string | null;
        aula_id: string | null;
        diaSemana: {
          id: string;
          nombre: string;
          categoria: string | null;
          descripcion: string | null;
        };
        tipoClase: {
          id: string;
          nombre: string;
          categoria: string | null;
          descripcion: string | null;
        };
      }[];
    }
  | undefined;

type sucursales =
  | {
      id: string;
      nombre: string;
      direccion: string;
      estado_id: string;
      created_at: string;
      updated_at: string;
    }[]
  | undefined;
type gestiones =
  | {
      id: string;
      nombre: string;
      estado_id: string;
      created_at: string;
      updated_at: string;
      fecha_inicio: string;
      fecha_fin: string;
      estado_gestion_id: string;
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
  data,
  sucursales,
  gestiones,
  catalogos,
}: {
  data?: NewData | undefined;
  sucursales: sucursales;
  gestiones: gestiones;
  catalogos: catalogos;
}) {
  const { formId } = useModalStore();
  const { upsertMutation } = useActions();
  // Usamos crypto.randomUUID() o Date.now() para IDs únicos temporales
  const [horariosCurso, setHorariosCurso] = useState(
    data?.horarioPlantillas.map((h) => ({
      tempId: h.id,
      diaSemana: h.diaSemana.id as string,
      tipo: h.tipoClase.id as string,
      horaInicio: h.hora_inicio,
      horaFin: h.hora_fin,
    })) || [
      {
        tempId: uuidv4(),
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
        tempId: uuidv4(),
        diaSemana: "",
        tipo: "",
        horaInicio: "",
        horaFin: "",
      },
    ]);
  };

  const eliminarHorario = (id: string) => {
    // Evitar que se queden sin ningún horario si así lo prefieres
    if (horariosCurso.length === 1) return;
    setHorariosCurso(horariosCurso.filter((h) => h.tempId !== id));
  };

  const actualizarHorario = (id: string, campo: string, valor: string) => {
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
          <FieldLabel htmlFor="nombre_curso">
            Nombre <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="nombre_curso"
              placeholder="Nombre del curso"
              name="nombre_curso"
              defaultValue={data?.nombre_curso}
              required
            />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="precio_base">
            Precio inicial <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="precio_base"
              placeholder="Precio inicial"
              name="precio_base"
              defaultValue={data?.precio_base}
              required
            />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="gestion_id">
            Gestion <span className="text-destructive">*</span>
          </FieldLabel>

          <Select
            name="gestion_id"
            defaultValue={data ? String(data?.gestion_id) : undefined}
          >
            <SelectTrigger id="gestion_id">
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
          <FieldLabel htmlFor="sucursal_id">
            Sucursal <span className="text-destructive">*</span>
          </FieldLabel>

          <Select
            name="sucursal_id"
            defaultValue={data ? String(data?.sucursal_id) : undefined}
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
          <FieldLabel htmlFor="horas_teoricas_req">
            Horas teoricas <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="horas_teoricas_req"
              placeholder="Requisito de horas "
              name="horas_teoricas_req"
              type="number"
              min={0}
              defaultValue={data?.horas_teoricas_req}
              required
            />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="horas_practicas_req">
            Horas Practicas <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="horas_practicas_req"
              placeholder="Requisito de horas "
              name="horas_practicas_req"
              type="number"
              min={1}
              defaultValue={data?.horas_practicas_req}
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
                  {catalogos
                    ?.filter((c) => c.categoria === "DIA_SEMANA")
                    .map((val) => (
                      <SelectItem key={val.id} value={val.id}>
                        {val.nombre}
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
                  {catalogos
                    ?.filter((c) => c.categoria === "TIPO_ACADEMICO")
                    .map((val) => (
                      <SelectItem key={val.id} value={val.id}>
                        {val.nombre}
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
