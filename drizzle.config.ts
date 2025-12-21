import { defineConfig } from "drizzle-kit";
import path from "path";

// Esto detecta automáticamente C:\Users\TuNombre\AppData\Roaming
const appData = process.env.APPDATA;
const dbPath = path.join(appData!, "com.autov1.app", "proyecto2.db");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    // Usamos path.resolve para asegurar que los slashes sean correctos para Windows
    url: `file:${dbPath.replace(/\\/g, "/")}`,
  },
  verbose: true, // Esto te mostrará EXACTAMENTE qué SQL está intentando ejecutar
  strict: true,
});
