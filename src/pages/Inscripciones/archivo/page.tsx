import { useSearchParams, useParams } from "wouter";
import { CarFront, DollarSign, FileArchive, NotebookText } from "lucide-react";
import { Contendor } from "@/components/contenido";
import { useActions } from "./useActions";

export default function Page() {
  const { useGetData } = useActions();

  const [searchParams] = useSearchParams();
  const params = useParams();
  const estudianteId = Number(params.id);
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perpage") || "10");
  const { data, isLoading, isError } = useGetData(page, perPage, estudianteId);

  if (isLoading) return <div>Cargando...</div>;
  if (isError || !data) return <div>Error o sin datos</div>;

  const { data: inscripcion } = data;
  const estudiante = inscripcion?.[0].estudiante;
  return (
    <Contendor>
      <div className="w-full grid grid-cols-2">
        <div className="flex gap-2 items-center">
          <span className="capitalize font-medium text-lg">{`${inscripcion[0].estudiante.persona.nombres} ${inscripcion[0].estudiante.persona.primerApellido} ${inscripcion[0].estudiante.persona.segundoApellido}`}</span>
        </div>
      </div>

      <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-2 border-t border-b py-4 text-sm font-medium ">
        {/* Bloque 1 - Ocupa 2 columnas maestras y usa subgrid para mantener la alineación interna */}
        <div className="col-span-2 grid grid-cols-subgrid items-center">
          <dt className="uppercase text-xs font-medium opacity-50">
            Nro documento
          </dt>
          <dd className="">{estudiante.persona.nroDocumento}</dd>
        </div>

        {/* Bloque 2 */}
        <div className="col-span-2 grid grid-cols-subgrid items-center">
          <dt className="uppercase text-xs font-medium opacity-50">
            Nro celular
          </dt>
          <dd className="">{estudiante.persona.nroCelular}</dd>
        </div>

        {/* Bloque 3 */}
        <div className="col-span-2 grid grid-cols-subgrid items-center">
          <dt className="uppercase text-xs font-medium opacity-50">
            Dirección
          </dt>
          <dd className="">{estudiante.persona.direccion}</dd>
        </div>

        {/* Bloque 4 */}
        <div className="col-span-2 grid grid-cols-subgrid items-center">
          <dt className="uppercase text-xs font-medium opacity-50">Correo</dt>
          <dd className="">{estudiante.persona.email}</dd>
        </div>

        {/* Bloque 5 */}
        <div className="col-span-2 grid grid-cols-subgrid items-center">
          <dt className="uppercase text-xs font-medium opacity-50">
            Fecha nacimiento
          </dt>
          <dd className="">{estudiante.persona.fechaNacimiento}</dd>
        </div>

        {/* Bloque 6 */}
        <div className="col-span-2 grid grid-cols-subgrid items-center">
          <dt className="uppercase text-xs font-medium opacity-50">Sexo</dt>
          <dd className="">{estudiante.persona.sexo}</dd>
        </div>
      </dl>

      {inscripcion.map((ins, index) => (
        <div key={index} className="grid mt-2 ">
          <div className="flex ">
            <div className="flex gap-1 items-center border border-b-0 p-2 w-auto rounded-t-2xl px-4 py-3 text-sm">
              <FileArchive size={20} />
              <span className="font-medium">{ins.curso.nombreCurso}</span>
              {ins.estadoInscripcion === "ACTIVA" && (
                <div className="ml-4 flex items-center bg-green-100/40 border border-green-700/20 py-1 text-xs font-medium capitalize px-2.5 rounded-xl">
                  <div>{ins.estadoInscripcion.toLowerCase()}</div>
                  <div className="size-2 mt-0.5 ml-2 rounded-full bg-green-500"></div>
                </div>
              )}
              {ins.estadoInscripcion === "FINALIZADA" && (
                <div className="size-2 mt-0.5 ml-2 rounded-full bg-blue-500"></div>
              )}
              {ins.estadoInscripcion === "ABANDONADA" && (
                <div className="size-2 mt-0.5 ml-2 rounded-full bg-red-500"></div>
              )}
            </div>
          </div>
          <div className="grid w-full border-t  ">
            <div className="grid  grid-cols-3 py-4 gap-4">
              <div className="rounded-3xl bg-emerald-100/50 flex p-4.5 gap-2 ">
                <div className="rounded-full p-2 shadow-xl bg-background">
                  <CarFront size={24} />
                </div>
                <div className="flex flex-col gap-0 text-xs">
                  <span className="font-medium text-base"> 23/32 </span>
                  <span className="font-medium capitalize opacity-50">
                    clases practicas
                  </span>
                </div>
              </div>
              <div className="rounded-3xl bg-violet-100/50 flex p-4.5 gap-2 ">
                <div className="rounded-full p-2 shadow-xl bg-background">
                  <NotebookText size={24} />
                </div>
                <div className="flex flex-col gap-0 text-xs">
                  <span className="font-medium text-base"> 23/32 </span>
                  <span className="font-medium capitalize opacity-50">
                    clases teoricas
                  </span>
                </div>
              </div>
              <div className="rounded-3xl bg-blue-100/50 flex p-4.5 gap-2 ">
                <div className="rounded-full p-2 shadow-xl bg-background">
                  <DollarSign size={24} />
                </div>
                <div className="flex flex-col gap-0 text-xs">
                  <span className="font-medium text-base"> 23/32 </span>
                  <span className="font-medium capitalize opacity-50">
                    Pago de clases
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </Contendor>
  );
}
