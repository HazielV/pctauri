import { defineConfig } from "drizzle-kit";
import path from "path";

// Detecta automáticamente la ruta en AppData/Roaming para Windows
const appData = process.env.APPDATA;
const dbPath = path.join(appData!, "com.autov1.app", "proyecto4.db");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite", // Volvemos a SQLite para el entorno local
  dbCredentials: {
    // Aseguramos que los slashes sean correctos para Windows
    url: `file:${dbPath.replace(/\\/g, "/")}`,
  },
  verbose: true,
  strict: true,
});
