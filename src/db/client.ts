import { drizzle } from "drizzle-orm/sqlite-proxy";
import Database from "@tauri-apps/plugin-sql";
import * as schema from "./schema";

// 1. Singleton para la base de datos
let instance: Database | null = null;

// src/db/client.ts
async function getDb() {
  if (!instance) {
    const dbName = import.meta.env.VITE_DB_NAME || "proyecto2.db";
    instance = await Database.load(`sqlite:${dbName}`);

    // ASEGURAR TABLAS (MIGRACIÓN MANUAL RÁPIDA)
    // Esto evita el error "no such table"
    /* await instance.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `); */
  }
  return instance;
}
// Helper para detectar si es SELECT
const isSelectQuery = (sql: string) =>
  sql.trim().toLowerCase().startsWith("select");

export const db = drizzle(
  async (sql, params, method) => {
    const sqlite = await getDb();

    try {
      if (isSelectQuery(sql)) {
        const rows = await sqlite.select<any[]>(sql, params);

        // Drizzle Proxy espera que "all" devuelva un array de arrays
        // o un array de objetos dependiendo de la versión,
        // pero lo más seguro con el proxy de SQLite es mapear los valores:
        if (method === "all") {
          return { rows: rows.map((r) => Object.values(r)) };
        }
        // Para "get", devolvemos la primera fila mapeada
        return { rows: rows.length > 0 ? Object.values(rows[0]) : [] };
      } else {
        // Para INSERT, UPDATE, DELETE
        await sqlite.execute(sql, params);
        return { rows: [] };
      }
    } catch (e) {
      console.error("Error en DB Proxy:", e);
      return { rows: [] };
    }
  },
  { schema, logger: true }
);
