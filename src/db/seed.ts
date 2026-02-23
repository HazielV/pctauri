import "dotenv/config";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { eq, and } from "drizzle-orm";
import path from "path";

// Localización de la base de datos en Windows (AppData)
const appData = process.env.APPDATA;
const dbPath = path.join(appData!, "com.autov1.app", "proyecto4.db");
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

async function main() {
  console.log("🌱 Iniciando Seed con Drizzle...");

  // 1. Permisos Base
  const permisos = [
    {
      nombre: "LEER",
      valor: 1,
      descripcion: "Puede ver listados y detalles",
      updatedAt: new Date().toISOString(),
      estado: "activo",
    },
    {
      nombre: "CREAR",
      valor: 2,
      descripcion: "Puede registrar nuevos datos",
      updatedAt: new Date().toISOString(),
      estado: "activo",
    },
    {
      nombre: "EDITAR",
      valor: 4,
      descripcion: "Puede modificar datos existentes",
      updatedAt: new Date().toISOString(),
      estado: "activo",
    },
    {
      nombre: "ELIMINAR",
      valor: 8,
      descripcion: "Puede borrar o desactivar registros",
      updatedAt: new Date().toISOString(),
      estado: "activo",
    },
  ] as const;

  for (const p of permisos) {
    await db
      .insert(schema.permiso)
      .values(p)
      .onConflictDoUpdate({
        target: schema.permiso.valor,
        set: {
          nombre: p.nombre,
          descripcion: p.descripcion,
          updatedAt: new Date().toISOString(),
        },
      });
  }
  console.log("✅ Permisos sincronizados");

  // 2. Rol ADMIN
  await db
    .insert(schema.rol)
    .values({
      nombre: "ADMIN",
      descripcion: "Super Administrador del Sistema",
      estado: "activo",
    })
    .onConflictDoUpdate({
      target: schema.rol.nombre,
      set: { descripcion: "Super Administrador del Sistema" },
    });

  const rolAdmin = await db.query.rol.findFirst({
    where: eq(schema.rol.nombre, "ADMIN"),
  });
  console.log("✅ Rol ADMIN listo");

  // 3. Usuario y Persona Admin (Drizzle requiere inserts separados)
  // Primero la Persona
  await db
    .insert(schema.persona)
    .values({
      nroDocumento: 1000001,
      nombres: "Admin",
      primerApellido: "System",
      segundoApellido: "Root",
      email: "admin@mail.com",
      fechaNacimiento: "1990-01-01",
      nroCelular: 1000001,
      sexo: "MASCULINO",
      tipoDocumento: "CEDULA",
      updatedAt: new Date().toISOString(),
      estado: "activo",
    })
    .onConflictDoNothing();

  const personaDb = await db.query.persona.findFirst({
    where: eq(schema.persona.nroDocumento, 1000001),
  });

  // Luego el Usuario vinculado
  await db
    .insert(schema.usuario)
    .values({
      username: "admin",
      password: "$2b$10$KZ5zBLEuo1egjZdyfQKepOXofUzaEJ8WIdsQasyaHt3YPRS4hGWqe", // admin123
      personaId: personaDb!.id,
      updatedAt: new Date().toISOString(),
      estado: "activo",
    })
    .onConflictDoNothing();

  const adminUser = await db.query.usuario.findFirst({
    where: eq(schema.usuario.username, "admin"),
  });

  // 4. Asignar Rol a Usuario
  await db
    .insert(schema.usuariosRoles)
    .values({
      usuarioId: adminUser!.id,
      rolId: rolAdmin!.id,
      estado: "activo",
    })
    .onConflictDoNothing();
  console.log("✅ Usuario Admin vinculado a Rol ADMIN");

  // 5. Recursos y RolesRecursos
  const recursos = [
    {
      nombre: "Gestión de Usuarios",
      ruta: "/api/usuarios",
      updatedAt: new Date().toISOString(),
      estado: "activo",
    },
    {
      nombre: "Gestión de Roles",
      ruta: "/api/roles",
      updatedAt: new Date().toISOString(),
      estado: "activo",
    },
    {
      nombre: "Gestión de Permisos",
      ruta: "/api/permisos",
      updatedAt: new Date().toISOString(),
      estado: "activo",
    },
    {
      nombre: "Gestión de Recursos",
      ruta: "/api/recursos",
      updatedAt: new Date().toISOString(),
      estado: "activo",
    },
    {
      nombre: "Gestión de Menús",
      ruta: "/api/menus",
      updatedAt: new Date().toISOString(),
      estado: "activo",
    },
  ];

  for (const rec of recursos) {
    await db
      .insert(schema.recurso)
      .values({
        ...rec,
        estado: rec.estado as "activo" | "inactivo" | "pendiente", // Fuerza el tipo aquí
      })
      .onConflictDoUpdate({
        target: schema.recurso.ruta,
        set: { nombre: rec.nombre, updatedAt: new Date().toISOString() },
      });

    const recursoDb = await db.query.recurso.findFirst({
      where: eq(schema.recurso.ruta, rec.ruta),
    });

    await db
      .insert(schema.rolesRecursos)
      .values({
        rolId: rolAdmin!.id,
        recursoId: recursoDb!.id,
        permisos: 15,
      })
      .onConflictDoUpdate({
        target: [schema.rolesRecursos.rolId, schema.rolesRecursos.recursoId],
        set: { permisos: 15 },
      });
  }

  console.log("🚀 Seed finalizado con éxito");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Error en el seed:", e);
  process.exit(1);
});
