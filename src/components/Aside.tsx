import {
  RiArrowLeftDoubleFill,
  RiCalendarLine,
  RiContactsBook2Line,
  RiContactsBook3Line,
  RiContactsBookLine,
  RiFileTextFill,
  RiFileTextLine,
  RiGroupLine,
  RiHeart2Fill,
  RiHeart2Line,
  RiHome6Line,
  RiLogoutBoxLine,
  RiServiceFill,
} from "@remixicon/react";
import { Link, useLocation } from "wouter";
import ItemMenu from "./ItemMenu";

const menus = [
  {
    id: 1,
    descripcion: "Inicio",
    icono: <RiHome6Line size={20} />,
    url: "/admin",
  },
  {
    id: 2,
    descripcion: "Citas",
    icono: <RiCalendarLine size={20} />,
    url: "/admin/citas",
  },
  {
    id: 3,
    descripcion: "Pacientes",
    icono: <RiContactsBook3Line size={20} />,
    url: "/admin/pacientes",
  },
  {
    id: 4,
    descripcion: "Usuarios",
    icono: <RiGroupLine size={20} />,
    url: "/admin/usuarios",
  },

  {
    id: 5,
    descripcion: "Reportes",
    icono: <RiFileTextLine size={20} />,
    url: "/admin/reportes",
  },
];
export default function Aside() {
  return (
    <aside className="mt-6 p-3 pl-4 pr-2 flex flex-col items-center justify-between z-50">
      {/* <RiArrowLeftDoubleFill size={20} /> */}
      {/* <RiHeart2Line size={22} className="text-rose-400" /> */}
      {/* <ChevronsLeft size={18} /> */}
      <ul className="flex flex-col gap-5 ">
        {menus.map((menu) => (
          <Link key={menu.id} href={menu.url}>
            <ItemMenu {...menu} />
          </Link>
        ))}
      </ul>
      <ItemMenu
        className="after:bg-red-100/50 text-red-600 dark:text-red-300 dark:after:bg-transparent dark:after:from-red-600/5 dark:after:to-red-600/40 dark:after:bg-linear-to-r dark:after:from-10% "
        descripcion="Cerrar Sesion"
        icono={<RiLogoutBoxLine size={20} />}
      />
    </aside>
  );
}
