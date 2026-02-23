import { LayoutContenido } from "@/components/contenido";
import Header from "@/components/Header";
import { RiContactsBook3Line } from "@remixicon/react";
import Page from "./page";

export default function Recursos() {
  return (
    <LayoutContenido>
      <Header texto="Recursos ">
        <RiContactsBook3Line size={20} className="z-10 relative" />
      </Header>
      <Page />
    </LayoutContenido>
  );
}
