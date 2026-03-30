import { LayoutContenido } from "@/components/contenido";
import Header from "@/components/Header";
import { RiContactsBook3Line } from "@remixicon/react";
import Page from "./page";
import { useAuthStore } from "@/store/authStore";
import { useLocation } from "wouter";
export default function Usuarios() {
  const [location] = useLocation();

  const getPermisos = useAuthStore((state) => state.getPermisosParaRuta);
  const permisos = getPermisos(location);

  console.log("permisos: ", permisos, "location", location);
  return (
    <LayoutContenido>
      <Header texto="Usuarios ">
        <RiContactsBook3Line size={20} className="z-10 relative" />
      </Header>
      {permisos.includes("LEER") ? (
        <Page permisos={permisos} />
      ) : (
        <div className="p-5">no tiene permisos necesarios</div>
      )}
    </LayoutContenido>
  );
}
