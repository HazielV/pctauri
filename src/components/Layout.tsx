import { Link, useLocation } from "wouter";
import Aside from "./Aside";
import { RiSettings4Fill } from "@remixicon/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className=" bg-[#F8F8FA] dark:bg-[#1F1F21] w-screen h-screen flex pt-6 ">
      <Aside />
      {/* CONTENIDO DERECHA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* PÁGINA DINÁMICA */}
        <main className="flex-1 flex flex-col pl-2 bg-white dark:bg-[#101012] m-2 my-4 mr-4 rounded-2xl shadow overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
