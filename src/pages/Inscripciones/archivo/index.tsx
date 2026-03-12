import { LayoutContenido } from "@/components/contenido";
import Header from "@/components/Header";
import {} from "@remixicon/react";
import Page from "./page";
import { FolderOpen } from "lucide-react";

export default function Archivo() {
  return (
    <LayoutContenido>
      <Header texto="Lista de inscripciones ">
        <FolderOpen className="z-10 relative" />
      </Header>
      <Page />
    </LayoutContenido>
  );
}
