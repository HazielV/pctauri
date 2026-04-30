import * as schema from "../db/schema";
import { eq, sql } from "drizzle-orm";
import * as Y from "yjs";
import { db } from "../db/client";

let isSyncing = false;
type SchemaTables = keyof typeof schema;

export async function pullFromBackend(tableName: string) {
  const response = await fetch(
    `http://localhost:3001/api/sync/download/${tableName}`,
  );
  const data = await response.json();

  if (data.payload) {
    try {
      const cleanBase64 = data.payload.replace(/[^A-Za-z0-9+/=]/g, "");
      const binaryUpdate = Uint8Array.from(atob(cleanBase64), (c) =>
        c.charCodeAt(0),
      );

      const tempDoc = new Y.Doc();
      Y.applyUpdate(tempDoc, binaryUpdate);

      const ymap = tempDoc.getMap(tableName.toUpperCase());
      const remoteData = ymap.toJSON();

      // 👇 NUEVA LÓGICA DE BÚSQUEDA 👇
      // Buscamos la variable en el schema ignorando mayúsculas/minúsculas
      // Ej: "UsuariosRoles" -> coincidirá con la variable "usuariosRoles"
      const schemaKey = Object.keys(schema).find(
        (key) => key.toLowerCase() === tableName.toLowerCase(),
      );

      if (!schemaKey) {
        console.error(
          `❌ La variable para la tabla ${tableName} no existe en schema.ts.`,
        );
        return;
      }

      // Usamos la llave correcta encontrada
      const tableSchema = schema[schemaKey as SchemaTables];
      // 👆 FIN DE LA NUEVA LÓGICA 👆

      // 1. Crear mapa inverso robusto (minúsculas -> TS Key)
      const dbToTsMap: Record<string, string> = {};
      for (const [tsKey, columnObj] of Object.entries(tableSchema)) {
        // Drizzle guarda el nombre de la DB en .name o .config.name
        const colName =
          (columnObj as any)?.name || (columnObj as any)?.config?.name || tsKey;
        dbToTsMap[colName.toLowerCase()] = tsKey;
      }

      for (const key in remoteData) {
        const yjsRecord = remoteData[key];
        const registro = yjsRecord?.v;

        if (!registro) continue;

        // 2. Traducir las llaves del registro ignorando el Case
        const registroLimpio: Record<string, any> = {};
        for (const [dbKey, val] of Object.entries(registro)) {
          const tsKey = dbToTsMap[dbKey.toLowerCase()] || dbKey;
          registroLimpio[tsKey] = val;
        }

        const upperTable = tableName.toUpperCase();

        if (
          upperTable === "USUARIOSROLES" ||
          upperTable === "ROLESMENUS" ||
          upperTable === "ROLESRECURSOS"
        ) {
          delete registroLimpio.id;
          await db
            .insert(tableSchema)
            .values(registroLimpio)
            .onConflictDoUpdate({
              target: [
                (tableSchema as any).usuarioId,
                (tableSchema as any).rolId,
              ],
              set: registroLimpio,
            });
        } else {
          await db
            .insert(tableSchema)
            .values(registroLimpio)
            .onConflictDoUpdate({
              target: (tableSchema as any).id,
              set: registroLimpio,
            });
        }
      }
      console.log(
        `✅ Tabla ${tableName} descargada y sincronizada localmente.`,
      );
    } catch (e) {
      console.error(
        `❌ Fallo al decodificar o guardar el payload de ${tableName}:`,
        e,
      );
    }
  }
}

export async function syncWithBackend() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.pendingSync);

    if (countResult[0].count === 0) {
      isSyncing = false;
      return;
    }

    const pendingChanges = await db.select().from(schema.pendingSync).limit(50);

    for (const change of pendingChanges) {
      const success = await sendToBackend(change);

      if (success) {
        await db
          .delete(schema.pendingSync)
          .where(eq(schema.pendingSync.id, change.id));
      } else {
        break;
      }
    }
  } finally {
    isSyncing = false;
  }
}

async function sendToBackend(change: any): Promise<boolean> {
  try {
    const payloadArray = change.updatePayload;
    const uint8 = new Uint8Array(payloadArray);

    const binaryString = Array.from(uint8)
      .map((byte) => String.fromCharCode(byte))
      .join("");
    const base64Payload = btoa(binaryString);

    const response = await fetch("http://localhost:3001/api/sync/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: "desktop-haziel-1",
        tableName: change.tabla,
        payload: base64Payload,
      }),
    });
    if (!response.ok) {
      console.error(
        `❌ Error en el servidor (${response.status}):`,
        await response.text(),
      );
    }
    return response.ok;
  } catch (error) {
    console.error("Fallo de red al sincronizar:", error);
    return false;
  }
}

const TABLAS_A_SINCRONIZAR = ["Persona", "Usuario", "Rol", "UsuariosRoles"]; // Ajusta según tus tablas

export async function fullSync() {
  console.log("Iniciando sincronización completa...");
  await syncWithBackend();

  for (const tabla of TABLAS_A_SINCRONIZAR) {
    try {
      await pullFromBackend(tabla);
    } catch (err) {
      console.error(`Error sincronizando tabla ${tabla}:`, err);
    }
  }
  console.log("Sincronización finalizada.");
}
