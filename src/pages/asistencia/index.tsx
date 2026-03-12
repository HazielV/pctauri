import { LayoutContenido } from "@/components/contenido";
import Header from "@/components/Header";
import Page from "./page";
import { Clock4 } from "lucide-react";

export default function Asistencia() {
  return (
    <LayoutContenido>
      <Header texto="Asistencia ">
        <Clock4 className="relative z-10" />
      </Header>
      <Page />
    </LayoutContenido>
  );
}
