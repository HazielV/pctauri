import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";

const appWindow = getCurrentWindow();

export default function CustomTitlebar() {
  return (
    <div
      className="titlebar h-10.5 bg-transparent flex justify-between items-start select-none fixed top-0 left-0 right-0 z-50 "
      // Toda la barra de 40px permite el arrastre
      data-tauri-drag-region
    >
      {/* IZQUIERDA: Logo y Nombre - Alineados al top con 32px de altura */}
      <div
        className="flex items-center gap-2 px-3 h-8 pointer-events-none"
        data-tauri-drag-region
      >
        <img src="/logo.png" className="w-4 h-4" alt="logo" />
        <span className="text-xs font-medium opacity-70">AutoV1</span>
      </div>

      {/* DERECHA: Controles - Contenedor de 32px alineado al top */}
      <div className="flex h-8">
        <button
          onClick={() => appWindow.minimize()}
          className="w-10 h-full inline-flex justify-center items-center hover:bg-muted transition-colors"
          title="Minimizar"
        >
          <Minus size={14} />
        </button>

        <button
          onClick={() => appWindow.toggleMaximize()}
          className="w-10 h-full inline-flex justify-center items-center hover:bg-muted transition-colors"
          title="Maximizar"
        >
          <Square size={12} />
        </button>

        <button
          onClick={() => appWindow.close()}
          className="w-12 h-full inline-flex justify-center items-center hover:bg-red-500 hover:text-white transition-colors"
          title="Cerrar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
