import "dotenv/config";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { eq, and } from "drizzle-orm";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Localización de la base de datos en Windows (AppData)
const appData = process.env.APPDATA;
const dbPath = path.join(appData!, "com.autov1.app", "proyecto_v2.db");
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

// --- UTILS PARA ESTADOS Y CATÁLOGOS ---
async function getOrCreateEstado(nombre: string, categoria: string) {
  const existente = await db.query.estado.findFirst({
    where: and(
      eq(schema.estado.nombre, nombre),
      eq(schema.estado.categoria, categoria),
    ),
  });

  if (existente) return existente;

  const newId = uuidv4();
  await db.insert(schema.estado).values({
    id: newId,
    nombre,
    categoria,
    descripcion: `Estado: ${nombre}`,
  });

  return { id: newId, nombre, categoria };
}

async function getOrCreateCatalogo(nombre: string, categoria: string) {
  const existente = await db.query.catalogo.findFirst({
    where: and(
      eq(schema.catalogo.nombre, nombre),
      eq(schema.catalogo.categoria, categoria),
    ),
  });

  if (existente) return existente;

  const newId = uuidv4();
  await db.insert(schema.catalogo).values({
    id: newId,
    nombre,
    categoria,
    descripcion: `Catálogo: ${nombre}`,
  });

  return { id: newId, nombre, categoria };
}

async function main() {
  console.log("🌱 Iniciando Seed Definitivo (Estados y Catálogos)...");

  try {
    // ============================================================================
    // 1. SEMBRAR CATÁLOGOS Y ESTADOS
    // ============================================================================
    console.log("⏳ Poblando Catálogos (Tipos estáticos)...");

    // Catálogos: Persona
    const sexoMasculino = await getOrCreateCatalogo("MASCULINO", "SEXO");
    await getOrCreateCatalogo("FEMENINO", "SEXO");
    await getOrCreateCatalogo("OTRO", "SEXO");

    const docCedula = await getOrCreateCatalogo("CEDULA", "TIPO_DOCUMENTO");
    await getOrCreateCatalogo("PASAPORTE", "TIPO_DOCUMENTO");
    await getOrCreateCatalogo("EXTRANJERO", "TIPO_DOCUMENTO");

    // Catálogos: Pagos y Clases
    await getOrCreateCatalogo("EFECTIVO", "METODO_PAGO");
    await getOrCreateCatalogo("TARJETA", "METODO_PAGO");
    await getOrCreateCatalogo("TRANSFERENCIA", "METODO_PAGO");

    const dias = [
      "LUNES",
      "MARTES",
      "MIERCOLES",
      "JUEVES",
      "VIERNES",
      "SABADO",
      "DOMINGO",
    ];
    for (const dia of dias) await getOrCreateCatalogo(dia, "DIA_SEMANA");

    await getOrCreateCatalogo("TEORICO", "TIPO_ACADEMICO");
    await getOrCreateCatalogo("PRACTICO", "TIPO_ACADEMICO");

    console.log("⏳ Poblando Estados (Ciclo de vida)...");

    // Estados: Sistema y Gestión
    const estadoActivo = await getOrCreateEstado("ACTIVO", "SISTEMA");
    await getOrCreateEstado("INACTIVO", "SISTEMA");
    await getOrCreateEstado("PENDIENTE", "SISTEMA");
    await getOrCreateEstado("FINALIZADO", "SISTEMA");
    await getOrCreateEstado("EN CURSO", "SISTEMA");
    await getOrCreateEstado("PROGRAMADO", "SISTEMA");
    await getOrCreateEstado("ABANDONADA", "SISTEMA");

    await getOrCreateEstado("ACTIVA", "ESTADO_GESTION");
    await getOrCreateEstado("CERRADA", "ESTADO_GESTION");

    // Estados: Operativos Vehículos
    await getOrCreateEstado("DISPONIBLE", "ESTADO_OPERATIVO");
    await getOrCreateEstado("MANTENIMIENTO", "ESTADO_OPERATIVO");
    await getOrCreateEstado("AVERIADO", "ESTADO_OPERATIVO");

    // Estados: Inscripciones
    await getOrCreateEstado("PENDIENTE", "ESTADO_INSCRIPCION");
    await getOrCreateEstado("APROBADO", "ESTADO_INSCRIPCION");
    await getOrCreateEstado("REPROBADO", "ESTADO_INSCRIPCION");

    // Estados: Académicos UNIFICADOS (Clases, Asistencia, Exámenes)
    const estadosAcademicos = [
      "PROGRAMADA",
      "DICTADA",
      "COMPLETADA",
      "CANCELADA",
      "PRESENTE",
      "FALTA",
      "REPROGRAMADA",
    ];
    for (const estado of estadosAcademicos) {
      await getOrCreateEstado(estado, "ESTADO_ACADEMICO");
    }

    // ============================================================================
    // 2. PERMISOS
    // ============================================================================
    console.log("⏳ Sincronizando permisos...");
    const permisos = [
      {
        nombre: "LEER",
        valor: 1,
        descripcion: "Puede ver listados y detalles",
      },
      {
        nombre: "CREAR",
        valor: 2,
        descripcion: "Puede registrar nuevos datos",
      },
      {
        nombre: "EDITAR",
        valor: 4,
        descripcion: "Puede modificar datos existentes",
      },
      {
        nombre: "ELIMINAR",
        valor: 8,
        descripcion: "Puede borrar o desactivar registros",
      },
    ];

    for (const p of permisos) {
      await db
        .insert(schema.permiso)
        .values({
          id: uuidv4(),
          nombre: p.nombre,
          valor: p.valor,
          descripcion: p.descripcion,
          estado_id: estadoActivo.id,
          updated_at: new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: schema.permiso.valor,
          set: {
            nombre: p.nombre,
            descripcion: p.descripcion,
            updated_at: new Date().toISOString(),
          },
        });
    }

    // ============================================================================
    // 3. ROL ADMINISTRADOR
    // ============================================================================
    console.log("⏳ Configurando Rol ADMIN...");
    await db
      .insert(schema.rol)
      .values({
        id: uuidv4(),
        nombre: "ADMIN",
        descripcion: "Super Administrador del Sistema",
        estado_id: estadoActivo.id,
      })
      .onConflictDoUpdate({
        target: schema.rol.nombre,
        set: { descripcion: "Super Administrador del Sistema" },
      });

    const rolAdmin = await db.query.rol.findFirst({
      where: eq(schema.rol.nombre, "ADMIN"),
    });

    if (!rolAdmin) throw new Error("No se pudo obtener el rol ADMIN");

    // ============================================================================
    // 4. PERSONA Y USUARIO ROOT
    // ============================================================================
    console.log("⏳ Configurando Usuario y Persona root...");

    let personaAdmin = await db.query.persona.findFirst({
      where: eq(schema.persona.nro_documento, 1000001),
    });

    if (!personaAdmin) {
      const pId = uuidv4();
      await db.insert(schema.persona).values({
        id: pId,
        nro_documento: 1000001,
        nombres: "Admin",
        primer_apellido: "System",
        segundo_apellido: "Root",
        email: "admin@mail.com",
        fecha_nacimiento: "1990-01-01",
        nro_celular: 1000001,
        sexo_id: sexoMasculino.id, // Viniendo del helper de Catálogo
        tipo_documento_id: docCedula.id, // Viniendo del helper de Catálogo
        estado_id: estadoActivo.id,
      });
      personaAdmin = await db.query.persona.findFirst({
        where: eq(schema.persona.nro_documento, 1000001),
      });
    }

    let userAdmin = await db.query.usuario.findFirst({
      where: eq(schema.usuario.username, "admin"),
    });

    if (!userAdmin && personaAdmin) {
      const uId = uuidv4();
      await db.insert(schema.usuario).values({
        id: uId,
        username: "admin",
        password:
          "$2b$10$KZ5zBLEuo1egjZdyfQKepOXofUzaEJ8WIdsQasyaHt3YPRS4hGWqe", // admin123
        persona_id: personaAdmin.id,
        estado_id: estadoActivo.id,
      });
      userAdmin = await db.query.usuario.findFirst({
        where: eq(schema.usuario.username, "admin"),
      });
    }

    if (userAdmin && rolAdmin) {
      await db
        .insert(schema.usuariosRoles)
        .values({
          id: uuidv4(),
          usuario_id: userAdmin.id,
          rol_id: rolAdmin.id,
          estado_id: estadoActivo.id,
        })
        .onConflictDoNothing();
    }

    // ============================================================================
    // 5. RECURSOS Y MENÚS DEL SISTEMA
    // ============================================================================
    console.log("⏳ Sincronizando Recursos y Menús...");
    const baseMenusRecursos = [
      {
        rec: "Gestión de Usuarios",
        ruta: "/admin/usuarios",
        menu: "Usuarios",
        icono: "Users",
        orden: 1,
      },
      {
        rec: "Gestión de Roles",
        ruta: "/admin/roles",
        menu: "Roles",
        icono: "Shield",
        orden: 3,
      },
      {
        rec: "Gestión de Permisos",
        ruta: "/admin/permisos",
        menu: "Permisos",
        icono: "CircleCheckBig",
        orden: 4,
      },
      {
        rec: "Gestión de Recursos",
        ruta: "/admin/recursos",
        menu: "Recursos",
        icono: "Blocks",
        orden: 10,
      },
      {
        rec: "Gestión de Menús",
        ruta: "/admin/menus",
        menu: "Menus",
        icono: "ListTree",
        orden: 2,
      },
      {
        rec: "Gestion de inscripciones",
        ruta: "/admin/inscripciones",
        menu: "Inscripciones",
        icono: "FolderOpen",
        orden: 23,
      },
      {
        rec: "Gestion de asistencia",
        ruta: "/admin/asistencia",
        menu: "Asistencia",
        icono: "Clock4",
        orden: 21,
      },
      {
        rec: "Gestion de cursos",
        ruta: "/admin/cursos",
        menu: "Cursos",
        icono: "BookOpen",
        orden: 19,
      },
      {
        rec: "Catalogo vehiculos",
        ruta: "/admin/vehiculos",
        menu: "Vehiculos",
        icono: "Car",
        orden: 15,
      },
      {
        rec: "Catalogo instructores",
        ruta: "/admin/instructores",
        menu: "Instructores",
        icono: "Presentation",
        orden: 17,
      },
      {
        rec: "Catalogo gestion academica",
        ruta: "/admin/gestion",
        menu: "Gestion academica",
        icono: "AlarmClock",
        orden: 13,
      },
      {
        rec: "Catalogo sucursales",
        ruta: "/admin/sucursales",
        menu: "Sucursales",
        icono: "Building",
        orden: 15,
      },
    ];

    for (const item of baseMenusRecursos) {
      await db
        .insert(schema.recurso)
        .values({
          id: uuidv4(),
          nombre: item.rec,
          ruta: item.ruta,
          estado_id: estadoActivo.id,
        })
        .onConflictDoUpdate({
          target: schema.recurso.ruta,
          set: { nombre: item.rec, updated_at: new Date().toISOString() },
        });

      const dbRecurso = await db.query.recurso.findFirst({
        where: eq(schema.recurso.ruta, item.ruta),
      });

      if (!dbRecurso) continue;

      await db
        .insert(schema.menu)
        .values({
          id: uuidv4(),
          nombre: item.menu,
          ruta: item.ruta,
          icono: item.icono,
          orden: item.orden,
          recurso_id: dbRecurso.id,
          estado_id: estadoActivo.id,
          padre_id: null,
        })
        .onConflictDoUpdate({
          target: schema.menu.ruta,
          set: { nombre: item.menu, icono: item.icono, orden: item.orden },
        });

      const dbMenu = await db.query.menu.findFirst({
        where: eq(schema.menu.ruta, item.ruta),
      });

      if (dbMenu) {
        await db
          .insert(schema.rolesRecursos)
          .values({
            id: uuidv4(),
            rol_id: rolAdmin.id,
            recurso_id: dbRecurso.id,
            estado_id: estadoActivo.id,
            permisos: 15,
          })
          .onConflictDoUpdate({
            target: [
              schema.rolesRecursos.recurso_id,
              schema.rolesRecursos.rol_id,
            ],
            set: { permisos: 15 },
          });

        await db
          .insert(schema.rolesMenus)
          .values({
            id: uuidv4(),
            rol_id: rolAdmin.id,
            menu_id: dbMenu.id,
            permisos: 15,
            estado_id: estadoActivo.id,
          })
          .onConflictDoUpdate({
            target: [schema.rolesMenus.rol_id, schema.rolesMenus.menu_id],
            set: { permisos: 15 },
          });
      }
    }

    console.log(
      "✅ ¡Seed finalizado con éxito! El sistema está listo para usarse.",
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error grave en el seed:", error);
    process.exit(1);
  }
}

main();
