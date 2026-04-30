import * as Y from "yjs";

import { decodeTextToState, encodeStateToText } from "./yjsManager";
import { getDb, setSyncingFromServer } from "@/db/client";

/**
 * ⬆️ 1. Extraer cambios sucios para enviarlos al Servidor / Web
 * Esto lo llamarías y lo mandarías por API a tu backend.
 */
export async function getLocalDirtyDocs() {
  const sqlite = await getDb();
  // Asumimos que dirty es guardado como INTEGER (1 o 0) en SQLite
  const docs = await sqlite.select<any[]>(
    "SELECT doc_id, table_name, state FROM yjsDocs WHERE dirty = 1",
  );
  return docs; // Devuelve un array con { doc_id, table_name, state (Base64) }
}
/**
 * 🗄️ Obtener todos los documentos locales para calcular el Vector de Estado
 */
export async function getAllLocalDocs() {
  const sqlite = await getDb();
  // Solo necesitamos doc_id, table_name y el state para calcular el vector
  const docs = await sqlite.select<any[]>(
    "SELECT doc_id, table_name, state FROM yjsDocs",
  );
  return docs;
}
/**
 * 🧼 Después de enviarlos a la web exitosamente, limpiamos el estado "dirty"
 */
export async function markDocsAsSynced(docIds: string[]) {
  if (docIds.length === 0) return;
  try {
    const sqlite = await getDb();
    setSyncingFromServer(true);

    // Convertir arreglo a parámetros para query: "?, ?, ?"
    const placeholders = docIds.map(() => "?").join(",");
    await sqlite.execute(
      `UPDATE yjsDocs SET dirty = 0 WHERE doc_id IN (${placeholders})`,
      docIds,
    );
  } catch (e) {
    console.log(e);
  } finally {
    setSyncingFromServer(false); // Siempre liberamos, pase lo que pase[cite: 2]
  }
}

/**
 * ⬇️ 2. Sincronizar cambios recibidos desde la Web hacia SQLite Local.
 * @param remoteDocs Documentos que llegan de la red {doc_id, table_name, state}
 */
export async function applyRemoteSync(
  remoteDocs: Array<{ doc_id: string; table_name: string; state: string }>,
) {
  const sqlite = await getDb();
  setSyncingFromServer(true);

  try {
    // 1. Iniciamos el script con la limpieza y configuración de seguridad
    let sqlScript = `
      -- 🛡️ Limpieza preventiva
      ROLLBACK; 
      PRAGMA foreign_keys = OFF;
      BEGIN IMMEDIATE TRANSACTION;
    `;

    const params: any[] = [];
    let paramIndex = 1;

    for (const row of remoteDocs) {
      const doc = new Y.Doc();

      // Consultamos el estado local (esta es la única lectura necesaria)
      const localCheck = await sqlite.select<any[]>(
        "SELECT state FROM yjsDocs WHERE doc_id = ?",
        [row.doc_id],
      );

      const oldStateText = localCheck.length > 0 ? localCheck[0].state : null;
      if (oldStateText) {
        Y.applyUpdate(doc, decodeTextToState(oldStateText));
      }

      // Mezclamos con el delta remoto
      Y.applyUpdate(doc, decodeTextToState(row.state));
      const newStateText = encodeStateToText(doc);

      // Solo añadimos al script si hay cambios reales
      if (newStateText !== oldStateText) {
        // Actualización de la tabla de metadatos Yjs
        sqlScript += `
          INSERT OR REPLACE INTO yjsDocs (doc_id, table_name, state, dirty) 
          VALUES ($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, 0);
        `;
        params.push(row.doc_id, row.table_name, newStateText);
        paramIndex += 3;

        // Reflejo en la tabla de negocio
        const yMap = doc.getMap(row.table_name);
        const jsonFila = yMap.toJSON();

        if (jsonFila.__deleted) {
          sqlScript += `DELETE FROM "${row.table_name}" WHERE id = $${paramIndex};`;
          params.push(row.doc_id);
          paramIndex += 1;
        } else {
          const columns = Object.keys(jsonFila);
          const values = Object.values(jsonFila);

          if (!columns.includes("id")) {
            columns.push("id");
            values.push(row.doc_id);
          }

          const placeholders = columns.map(() => `$${paramIndex++}`).join(",");
          const colNames = columns.map((c) => `"${c}"`).join(",");

          sqlScript += `INSERT OR REPLACE INTO "${row.table_name}" (${colNames}) VALUES (${placeholders});`;
          params.push(...values);
        }
      }
    }

    // 2. Cerramos el script
    sqlScript += `
      COMMIT;
      PRAGMA foreign_keys = ON;
    `;

    // 3. Ejecución ÚNICA de todo el bloque
    if (params.length > 0) {
      console.log("🚀 Ejecutando script de sincronización masiva...");
      await sqlite.execute(sqlScript, params);
      console.log("✅ Sincronización exitosa.");
    } else {
      console.log("icon ✅ Nada que actualizar.");
    }
  } catch (error) {
    console.error("❌ Error en el script de sincronización:", error);
    // Intentamos un rollback de emergencia si algo falló en la cadena
    try {
      await sqlite.execute("ROLLBACK; PRAGMA foreign_keys = ON;");
    } catch (e) {}
    throw error;
  } finally {
    setSyncingFromServer(false);
    window.dispatchEvent(new CustomEvent("onLocalDbChange"));
  }
}
