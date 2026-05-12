import * as Y from "yjs";

import { getDb } from "@/db/client";
export function uint8ArrayToBase64(array: Uint8Array): string {
  let binary = "";
  const len = array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return window.btoa(binary);
}
// 🔧 Utilidades para texto <-> uint8array (sin usar blobs)
export function encodeStateToText(doc: Y.Doc): string {
  const updateBytes = Y.encodeStateAsUpdate(doc);
  // Convertimos a Base64 para guardarlo como Texto Seguro en SQLite
  return btoa(String.fromCharCode(...updateBytes));
}

export function decodeTextToState(base64Str: string): Uint8Array {
  const binaryString = atob(base64Str);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// 📦 Función Principal pushData
export async function pushData(
  docId: string,
  tableName: string,
  method: "INSERT" | "UPDATE" | "DELETE",
  payload: Record<string, any>,
) {
  const sqlite = await getDb();
  const doc = new Y.Doc();

  // Recuperar el mapa que representa esta tabla/fila
  const yMap = doc.getMap(tableName);
  console.log("INGRESA A PUSH", tableName, payload);
  // 1. Si es UPDATE o DELETE, necesitamos recuperar el estado anterior
  if (method === "UPDATE" || method === "DELETE") {
    console.log("entra aqui con id", docId);
    const result = await sqlite.select<any[]>(
      "SELECT state FROM yjs_docs WHERE doc_id = $1",
      [docId],
    );

    if (result.length > 0 && result[0].state) {
      const existingStateText = result[0].state as string;
      const existingStateBytes = decodeTextToState(existingStateText);
      Y.applyUpdate(doc, existingStateBytes);
    }
  }

  // 2. Aplicar los nuevos cambios locales al Y.Doc
  if (method === "DELETE") {
    yMap.set("__deleted", true);
  } else {
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined) {
        yMap.set(key, value);
      }
    }
  }

  // 3. Generar el nuevo string Base64 del documento Yjs
  const finalStateText = encodeStateToText(doc);

  // 4. Guardar en SQL indicando que está "sucio" (dirty = 1 / true)
  if (method === "INSERT") {
    await sqlite.execute(
      `INSERT INTO yjs_docs (doc_id, table_name, state, dirty) 
       VALUES ($1, $2, $3, 1)`,
      [docId, tableName, finalStateText],
    );
  } else {
    // INSERT OR REPLACE por seguridad si por alguna razón no existía
    await sqlite.execute(
      `INSERT OR REPLACE INTO yjs_docs (doc_id, table_name, state, dirty) 
       VALUES ($1, $2, $3, 1)`,
      [docId, tableName, finalStateText],
    );
  }
}
