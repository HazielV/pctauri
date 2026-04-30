import "dotenv/config";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { eq, and } from "drizzle-orm";
import path from "path";
import { v4 as uuidv4 } from "uuid";
// Localización de la base de datos en Windows (AppData)
const appData = process.env.APPDATA;
const dbPath = path.join(appData!, "com.autov1.app", "proyecto5.db");
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

type EstadoType = "activo" | "inactivo" | "pendiente";
// Helper para mantener la consistencia entre IDs de Recurso y Menú
// Esto mapea el ID viejo (numérico) a uno nuevo (UUID)
const recursoMap: Record<number, string> = {};
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach((id) => {
  recursoMap[id] = uuidv4();
});

async function main() {
  console.log("🚀 Iniciando Seed de Administración...");

  try {
    // 1. SEMBRAR RECURSOS
    const recursosData = [
      {
        id: recursoMap[1],
        nombre: "Gestión de Usuarios",
        ruta: "/admin/usuarios",
      },
      { id: recursoMap[2], nombre: "Gestión de Roles", ruta: "/admin/roles" },
      {
        id: recursoMap[3],
        nombre: "Gestión de Permisos",
        ruta: "/admin/permisos",
      },
      {
        id: recursoMap[4],
        nombre: "Gestión de Recursos",
        ruta: "/admin/recursos",
      },
      { id: recursoMap[5], nombre: "Gestión de Menús", ruta: "/admin/menus" },
      {
        id: recursoMap[6],
        nombre: "Gestion de inscripciones",
        ruta: "/admin/inscripciones",
      },
      {
        id: recursoMap[7],
        nombre: "Gestion de asistencia",
        ruta: "/admin/asistencia",
      },
      { id: recursoMap[8], nombre: "Gestion de cursos", ruta: "/admin/cursos" },
      {
        id: recursoMap[9],
        nombre: "Catalogo vehiculos",
        ruta: "/admin/vehiculos",
      },
      {
        id: recursoMap[10],
        nombre: "Catalogo instructores",
        ruta: "/admin/instructores",
      },
      {
        id: recursoMap[11],
        nombre: "Catalogo gestion academica",
        ruta: "/admin/gestion",
      },
      {
        id: recursoMap[12],
        nombre: "Catalogo sucursales",
        ruta: "/admin/sucursales",
      },
    ].map((r) => ({ ...r, estado: "activo" as EstadoType }));

    await db.insert(schema.recurso).values(recursosData);
    console.log("✅ Recursos insertados.");

    // 3. SEMBRAR MENÚS
    const menusData = [
      {
        nombre: "Usuarios",
        ruta: "/admin/usuarios",
        icono: "Users",
        orden: 1,
        recursoId: recursoMap[1],
      },
      {
        nombre: "Menus",
        ruta: "/admin/menus",
        icono: "ListTree",
        orden: 2,
        recursoId: recursoMap[5],
      },
      {
        nombre: "Roles",
        ruta: "/admin/roles",
        icono: "Shield",
        orden: 3,
        recursoId: recursoMap[2],
      },
      {
        nombre: "Permisos",
        ruta: "/admin/permisos",
        icono: "CircleCheckBig",
        orden: 4,
        recursoId: recursoMap[3],
      },
      {
        nombre: "Recurso",
        ruta: "/admin/recursos",
        icono: "Blocks",
        orden: 10,
        recursoId: recursoMap[4],
      },
      {
        nombre: "Gestion academica",
        ruta: "/admin/gestion",
        icono: "AlarmClock",
        orden: 13,
        recursoId: recursoMap[11],
      },
      {
        nombre: "Sucursal",
        ruta: "/admin/sucursales",
        icono: "Building",
        orden: 15,
        recursoId: recursoMap[12],
      },
      {
        nombre: "Vehiculos",
        ruta: "/admin/vehiculos",
        icono: "Car",
        orden: 15,
        recursoId: recursoMap[9],
      },
      {
        nombre: "Instructores",
        ruta: "/admin/instructores",
        icono: "Presentation",
        orden: 17,
        recursoId: recursoMap[10],
      },
      {
        nombre: "Cursos",
        ruta: "/admin/cursos",
        icono: "BookOpen",
        orden: 19,
        recursoId: recursoMap[8],
      },
      {
        nombre: "Asistencia",
        ruta: "/admin/asistencia",
        icono: "Clock4",
        orden: 21,
        recursoId: recursoMap[7],
      },
      {
        nombre: "Inscripciones",
        ruta: "/admin/inscripciones",
        icono: "FolderOpen",
        orden: 23,
        recursoId: recursoMap[6],
      },
    ].map((m) => ({
      id: uuidv4(),
      ...m,
      estado: "activo" as EstadoType,
      padreId: null,
    }));

    await db.insert(schema.menu).values(menusData);
    console.log("✅ Menús insertados.");

    console.log("⭐ Seed finalizado con éxito.");
  } catch (error) {
    console.error("❌ Error en el seed:", error);
  }
}

main();
