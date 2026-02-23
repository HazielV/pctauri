import { drizzle } from "drizzle-orm/sqlite-proxy";
import Database from "@tauri-apps/plugin-sql";
import * as schema from "./schema";
import * as relations from "./relations";

let instance: Database | null = null;

async function getDb() {
  if (!instance) {
    const dbName = import.meta.env.VITE_DB_NAME || "proyecto3.db";
    instance = await Database.load(`sqlite:${dbName}`);
  }
  return instance;
}

/* export const db = drizzle(
  async (sql, params, method) => {
    const sqlite = await getDb();
    try {
      const rows = await sqlite.select<any[]>(sql, params);
      if (method === "get") {
        const firstRow = rows[0];
        return {
          rows: firstRow ? Object.values(firstRow) : [],
        };
      } else {
        const valuesArray = rows.map((row) => Object.values(row));
        return { rows: valuesArray };
      }
    } catch (e) {
      console.error("Error en el puente de Rust:", e);
      try {
        await sqlite.execute(sql, params);
        return { rows: [] };
      } catch (execError) {
        throw execError;
      }
    }
  },
  { schema: { ...schema, ...relations } },
);
 */
export const db = drizzle(
  async (sql, params, method) => {
    const sqlite = await getDb();
    try {
      // 1. Decidimos qué método del plugin de Tauri usar
      // 'run' suele ser para INSERT/UPDATE/DELETE (execute)
      // 'all', 'values', 'get' suelen ser para SELECT

      if (method === "run") {
        const result = await sqlite.execute(sql, params);
        // Drizzle espera { rows: [] } para ejecuciones que no devuelven datos
        return { rows: [] };
      }

      const rows = await sqlite.select<any[]>(sql, params);

      if (method === "get") {
        // Retorna la primera fila como un array de valores
        return { rows: rows[0] ? Object.values(rows[0]) : [] };
      }

      // Retorna todas las filas como un array de arrays de valores
      return { rows: rows.map((row) => Object.values(row)) };
    } catch (e) {
      // IMPORTANTE: Lanza el error para que llegue a la mutación
      console.error("Error en el puente de Rust:", e);
      throw e;
    }
  },
  { schema: { ...schema, ...relations } },
);
