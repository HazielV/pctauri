import { drizzle } from "drizzle-orm/sqlite-proxy";
import Database from "@tauri-apps/plugin-sql";
import * as schema from "./schema";
import * as relations from "./relations";
import { v4 as uuidv4 } from "uuid";
import { pushData } from "@/store/yjsManager";

let instance: Database | null = null;

// Exportamos esta función para poder usar la misma instancia en YjsManager
export async function getDb() {
  if (!instance) {
    const dbName = import.meta.env.VITE_DB_NAME || "proyecto5.db";
    instance = await Database.load(`sqlite:${dbName}`);
    await instance.execute("PRAGMA busy_timeout = 5000;");
    await instance.execute("PRAGMA journal_mode = WAL;");
  }
  return instance;
}

export let isSyncingFromServer = false;
export const setSyncingFromServer = (value: boolean) => {
  isSyncingFromServer = value;
};

// Utilidad para intentar extraer el ID de la consulta (especialmente útil en UPDATE)
function extractIdFromQuery(sql: string, params: any[]): string | null {
  // Busca un patron tipo WHERE id = ? o WHERE "id" = 'uuid-123'
  const match = sql.match(
    /WHERE\s+["`]?id["`]?\s*=\s*(\?|['"]?[a-zA-Z0-9\-]+['"]?)/i,
  );
  if (match) {
    if (match[1] === "?") {
      // Si es un parámetro '?', asumimos que es el último en el array (muy común en Drizzle UPDATEs)
      return params[params.length - 1];
    }
    return match[1].replace(/['"]/g, ""); // Limpiar comillas si el ID viene quemado en el SQL
  }
  return null;
}

export const db = drizzle(
  async (sql, params, method) => {
    const sqlite = await getDb();
    const safeParams = params ?? [];
    console.log("metodo", method);
    try {
      const sqlClean = sql.trim();
      const queryNormalizada = sql.trim().toUpperCase();

      if (
        queryNormalizada === "BEGIN" ||
        queryNormalizada === "COMMIT" ||
        queryNormalizada === "ROLLBACK"
      ) {
        return { rows: [] };
      }

      const esMutacion = /^(INSERT|UPDATE|DELETE|REPLACE)/.test(
        queryNormalizada,
      );

      if (method === "run" || esMutacion) {
        const isInsert = /INSERT/i.test(sqlClean);
        const isUpdate = /UPDATE/i.test(sqlClean);
        let mappedData: Record<string, any> = {};

        // --- BLOQUE DE MAPEADO ÚNICO ---
        if (isInsert) {
          const match = sqlClean.match(/\(([^)]+)\)\s*VALUES\s*\((.+)\)/i);
          if (match) {
            const columns = match[1]
              .split(",")
              .map((c) => c.trim().replace(/["`]/g, ""));
            const values = match[2].split(",").map((v) => v.trim());
            let paramIdx = 0;
            columns.forEach((col, i) => {
              const val = values[i];
              if (val === "?") {
                mappedData[col] = safeParams[paramIdx++];
              } else if (val.includes("CURRENT_TIMESTAMP")) {
                mappedData[col] = new Date().toISOString();
              } else {
                mappedData[col] = val.replace(/^['"]|['"]$/g, "");
              }
            });
          }
        } else if (isUpdate) {
          const updateMatches = Array.from(
            sqlClean.matchAll(
              /(?:["`]?(\w+)["`]?)\s*=\s*(\?|\(CURRENT_TIMESTAMP\)|CURRENT_TIMESTAMP)/gi,
            ),
          );
          let paramIdx = 0;
          updateMatches.forEach((match) => {
            const col = match[1];
            if (match[2] === "?") {
              mappedData[col] = safeParams[paramIdx++];
            } else if (match[2].includes("CURRENT_TIMESTAMP")) {
              mappedData[col] = new Date().toISOString();
            }
          });
        }

        // --- EJECUCIÓN EN SQLITE ---
        let result;
        if (method === "run") {
          await sqlite.execute(sql, safeParams);
          result = { rows: [] };
        } else {
          const rows = await sqlite.select<any[]>(sql, safeParams);
          result = {
            rows:
              method === "get"
                ? rows[0]
                  ? Object.values(rows[0])
                  : []
                : rows.map((r) => Object.values(r)),
          };
        }

        // --- LÓGICA YJS ---
        try {
          const tableMatch = sqlClean.match(
            /(?:INTO|UPDATE|FROM)\s+["`]?(\w+)["`]?/i,
          );
          // Limpiamos el nombre de la tabla de comillas para Yjs
          // En tu proxy, antes de pushData:
          const tableName = tableMatch
            ? tableMatch[1].toLowerCase().replace(/["`]/g, "")
            : "unknown";
          const esTablaSync = tableName.toUpperCase() === "YJS_DOCS";

          if (!esTablaSync && !isSyncingFromServer) {
            const docId =
              mappedData.id ||
              extractIdFromQuery(sqlClean, safeParams) ||
              uuidv4();
            const actionMethod = isInsert ? "INSERT" : "UPDATE";

            await pushData(docId, tableName, actionMethod, mappedData);
            window.dispatchEvent(new CustomEvent("onLocalDbChange"));
          }
        } catch (syncError) {
          console.error("⚠️ Error guardando doc en Yjs:", syncError);
        }

        return result;
      }

      // LÓGICA PARA SELECTS
      const rows = await sqlite.select<any[]>(sql, safeParams);

      if (method === "get") {
        // Engañamos a TypeScript usando 'as any' para el undefined,
        // pero mantenemos el comportamiento que arregló tu bug.
        return {
          rows: rows[0] ? Object.values(rows[0]) : (undefined as any),
        };
      }
      return { rows: rows.map((row) => Object.values(row)) };
    } catch (e) {
      console.error("Error en el puente de Rust:", e);
      try {
        await sqlite.execute(sql, safeParams);
        return { rows: [] };
      } catch (execError) {
        throw execError;
      }
    }
  },
  { schema: { ...schema, ...relations } },
);
