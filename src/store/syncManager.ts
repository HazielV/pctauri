import * as Y from "yjs";
import { decodeTextToState, uint8ArrayToBase64 } from "./yjsManager";
import {
  applyRemoteSync,
  getLocalDirtyDocs,
  markDocsAsSynced,
  getAllLocalDocs,
} from "./ysjSync";

let isSyncingGlobal = false;

export async function syncWithBackend() {
  if (isSyncingGlobal) return;

  isSyncingGlobal = true;
  try {
    // --- ⬆️ PASO 1: SUBIR CAMBIOS LOCALES ---
    const dirtyDocs = await getLocalDirtyDocs();

    if (dirtyDocs.length > 0) {
      console.log(`Subiendo ${dirtyDocs.length} cambios a la web...`);

      const response = await fetch("http://localhost:3001/api/sync/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docs: dirtyDocs }),
      });

      if (response.ok) {
        const docIds = dirtyDocs.map((d) => d.doc_id);
        await markDocsAsSynced(docIds);
        console.log("✅ Cambios locales sincronizados");
      }
    }

    // --- ⬇️ PASO 2: DESCARGAR DIFERENCIAS (Vector de Estado) ---
    console.log("Preparando vectores de estado...");
    const localDocs = await getAllLocalDocs();
    const payload = [];

    for (const row of localDocs) {
      const doc = new Y.Doc();

      if (row.state) {
        Y.applyUpdate(doc, decodeTextToState(row.state));
      }

      // Generamos el vector binario
      const stateVectorBytes = Y.encodeStateVector(doc);

      payload.push({
        doc_id: row.doc_id,
        table_name: row.table_name,
        // ✅ USAMOS LA FUNCIÓN NATIVA PARA BASE64
        stateVector: uint8ArrayToBase64(stateVectorBytes),
      });
    }

    const pullResponse = await fetch(
      "http://localhost:3001/api/sync/download",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localVectors: payload }),
      },
    );

    const remoteData = await pullResponse.json();

    if (remoteData.docs && remoteData.docs.length > 0) {
      console.log(
        `Descargando ${remoteData.docs.length} deltas del servidor...`,
      );
      await applyRemoteSync(remoteData.docs);
      console.log("✅ Base de datos local actualizada");
    } else {
      console.log("✅ Todo al día");
    }
  } catch (error) {
    console.error("❌ Error de sincronización:", error);
  } finally {
    isSyncingGlobal = false;
  }
}
