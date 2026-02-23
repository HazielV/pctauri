import { Link } from "wouter";
import ItemMenu from "./ItemMenu";
import { House, LogOut } from "lucide-react";
import { db } from "@/db/client";
import { useQuery } from "@tanstack/react-query";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

const menus = [
  {
    id: 1,
    descripcion: "Inicio",
    icono: <House size={20} />,
    url: "/admin",
  },
];
export const toKebabCase = (str: string): IconName => {
  const result = str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

  return result as IconName;
};
export const getMenusData = async () => {
  try {
    const data = await db.query.menu.findMany();

    return {
      data,
    };
  } catch (error) {
    console.error("Error obteniendo menus de SQLite:", error);

    return {
      data: [],
    };
  }
};
export default function Aside() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["menus-aside"], // Si esto cambia, se refetchea
    queryFn: () => getMenusData(),
  });
  if (isLoading) return <div>Cargando...</div>;
  if (isError || !data) return <div>Error o sin datos</div>;

  const { data: menusData } = data;
  return (
    <aside className="mt-6 p-3 pl-4 pr-2 flex flex-col items-center justify-between z-50">
      {/* <RiArrowLeftDoubleFill size={20} /> */}
      {/* <RiHeart2Line size={22} className="text-rose-400" /> */}
      {/* <ChevronsLeft size={18} /> */}
      {/* <ul className="flex flex-col gap-5 ">
        
      </ul> */}
      <ul className="flex flex-col gap-3 ">
        {menus.map((menu) => (
          <Link key={menu.id} href={menu.url}>
            <ItemMenu {...menu} />
          </Link>
        ))}
        {menusData.map((menu) => (
          <Link key={menu.id} href={menu.ruta}>
            <ItemMenu
              descripcion={menu.nombre}
              icono={
                <DynamicIcon
                  name={toKebabCase(menu?.icono || "CircleQuestionMark")}
                  size={20}
                />
              }
              url={menu.ruta}
            />
          </Link>
        ))}
      </ul>
      <ItemMenu
        className="after:bg-red-100/50 text-red-600 dark:text-red-300 dark:after:bg-transparent dark:after:from-red-600/5 dark:after:to-red-600/40 dark:after:bg-linear-to-r dark:after:from-10% "
        descripcion="Cerrar Sesion"
        icono={<LogOut size={20} />}
      />
    </aside>
  );
}
