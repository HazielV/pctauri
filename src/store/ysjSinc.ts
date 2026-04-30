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
 * 🧼 Después de enviarlos a la web exitosamente, limpiamos el estado "dirty"
 */
export async function markDocsAsSynced(docIds: string[]) {
  if (docIds.length === 0) return;
  const sqlite = await getDb();

  // Convertir arreglo a parámetros para query: "?, ?, ?"
  const placeholders = docIds.map(() => "?").join(",");
  await sqlite.execute(
    `UPDATE yjsDocs SET dirty = 0 WHERE doc_id IN (${placeholders})`,
    docIds,
  );
}

/**
 * ⬇️ 2. Sincronizar cambios recibidos desde la Web hacia SQLite Local.
 * @param remoteDocs Documentos que llegan de la red {doc_id, table_name, state}
 */
export async function applyRemoteSync(
  remoteDocs: Array<{ doc_id: string; table_name: string; state: string }>,
) {
  const sqlite = await getDb();

  // Evitar que Drizzle capture estas inserciones/actualizaciones y genere un bucle
  setSyncingFromServer(true);

  try {
    for (const row of remoteDocs) {
      const doc = new Y.Doc();

      // 1. Obtener estado local si existe
      const localCheck = await sqlite.select<any[]>(
        "SELECT state FROM yjsDocs WHERE doc_id = $1",
        [row.doc_id],
      );

      if (localCheck.length > 0 && localCheck[0].state) {
        Y.applyUpdate(doc, decodeTextToState(localCheck[0].state));
      }

      // 2. Aplicar el estado remoto encima del local
      Y.applyUpdate(doc, decodeTextToState(row.state));

      // 3. Guardar el estado combinado limpio
      const combinedStateText = encodeStateToText(doc);
      await sqlite.execute(
        `INSERT OR REPLACE INTO yjsDocs (doc_id, table_name, state, dirty) 
         VALUES ($1, $2, $3, 0)`,
        [row.doc_id, row.table_name, combinedStateText],
      );

      // 4. Reflejar este cambio físicamente en la tabla destino (persona, pedido, etc.)
      const yMap = doc.getMap(row.table_name);
      const jsonFila = yMap.toJSON();

      if (jsonFila.__deleted) {
        // Lógica si manejas deletes
        await sqlite.execute(`DELETE FROM "${row.table_name}" WHERE id = $1`, [
          row.doc_id,
        ]);
      } else {
        // Construimos un query dinámico INSERT OR REPLACE (solo SQLite)
        const columns = Object.keys(jsonFila);
        const values = Object.values(jsonFila);

        // Si la fila remota no incluyó 'id', la forzamos con el doc_id
        if (!columns.includes("id")) {
          columns.push("id");
          values.push(row.doc_id);
        }

        const placeholders = columns.map((_, i) => `$${i + 1}`).join(",");
        const colNames = columns.map((c) => `"${c}"`).join(",");

        const sql = `INSERT OR REPLACE INTO "${row.table_name}" (${colNames}) VALUES (${placeholders})`;

        await sqlite.execute(sql, values);
      }
    }
  } catch (error) {
    console.error("Error aplicando sincronización remota:", error);
  } finally {
    // Restaurar bandera normal para seguir capturando mutaciones del usuario
    setSyncingFromServer(false);
    window.dispatchEvent(new CustomEvent("onLocalDbChange"));
  }
}
