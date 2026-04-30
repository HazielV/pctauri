import * as Y from "yjs";

export function createUpdate(
  tableName: string,
  data: { params: Record<string, any>; timestamp: number },
) {
  try {
    const paramsObject = data.params;

    // 1. Validamos que el objeto no esté vacío
    if (!paramsObject || Object.keys(paramsObject).length === 0) return null;

    const doc = new Y.Doc();
    const ymap = doc.getMap(tableName);

    // 2. Extraemos el ID directamente del objeto (gracias a que ahora es un diccionario)
    const id = paramsObject["id"] || paramsObject["Id"] || paramsObject["ID"];

    if (!id) {
      console.warn(
        "⚠️ No se encontró ID en el objeto mapeado para la tabla:",
        tableName,
        paramsObject,
      );
      return null;
    }

    // 3. Guardamos el objeto entero en la propiedad 'v'
    ymap.set(String(id), {
      v: paramsObject,
      t: data.timestamp,
    });

    return Y.encodeStateAsUpdate(doc);
  } catch (error) {
    console.error("❌ Error interno en Yjs Manager:", error);
    return null;
  }
}
