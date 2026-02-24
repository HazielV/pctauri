import { drizzle } from "drizzle-orm/sqlite-proxy";
import Database from "@tauri-apps/plugin-sql";
import * as schema from "./schema";
import * as relations from "./relations";

let instance: Database | null = null;

async function getDb() {
  if (!instance) {
    const dbName = import.meta.env.VITE_DB_NAME || "proyecto4.db";
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
      if (method === "run") {
        const result = await sqlite.execute(sql, params);
        return { rows: [] };
      }

      const rows = await sqlite.select<any[]>(sql, params);

      if (method === "get") {
        return { rows: rows[0] ? Object.values(rows[0]) : [] };
      }

      return { rows: rows.map((row) => Object.values(row)) };
    } catch (e) {
      console.error("Error en el puente de Rust:", e);
      throw e;
    }
  },
  { schema: { ...schema, ...relations } },
);
