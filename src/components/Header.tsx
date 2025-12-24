import { RiSettings4Fill } from "@remixicon/react";
import React from "react";
import { ModeToggle } from "./themeToggle";

export default function Header({
  children,
  texto,
}: {
  children: React.ReactNode;
  texto: string;
}) {
  return (
    <div className="sticky top-0 p-5 pb-2 bg-white dark:bg-[#101012]  w-full z-10">
      <header className=" flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-600  z-10 ">
        <div className="flex gap-4 items-center text-[#191A30] dark:text-gray-200  ">
          <div className="text-blue-600 relative after:absolute after:-inset-1.5 after:bg-blue-50/70 after:text-blue-600 dark:after:bg-blue-700/80 dark:text-blue-100  after:rounded-lg">
            {children}
          </div>
          <span className="text-xl  font-medium">{texto}</span>
        </div>
        <div className="text-sm flex justify-center items-center gap-2">
          <ModeToggle></ModeToggle>
          <button className="text-blue-600 p-1.5 bg-blue-50/70 rounded-lg  after:text-blue-600 cursor-pointer flex font-medium items-center  group transition dark:text-blue-100 dark:bg-blue-600/80">
            <RiSettings4Fill className="z-10 relative transform group-hover:rotate-180 transition-all duration-300" />
            <span className="w-0 group-hover:w-27.5 text-center overflow-hidden transition-all">
              Configuraciones
            </span>
          </button>

          <div className=" rounded-full font-medium text-blue-600 border p-1.5">
            <span>HE</span>
          </div>
        </div>
      </header>
    </div>
  );
}
