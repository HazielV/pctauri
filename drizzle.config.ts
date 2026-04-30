import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import path from "path";
import os from "os"; // Importamos el módulo OS de Node

// 1. Obtenemos el directorio principal del usuario y la plataforma
const homeDir = os.homedir();
const platform = process.platform;
const bundleId = "com.autov1.app";

let appDataPath = "";

// 2. Resolvemos la ruta base dependiendo del Sistema Operativo
if (platform === "win32") {
  // Windows: AppData/Roaming
  appDataPath = process.env.APPDATA || path.join(homeDir, "AppData", "Roaming");
} else if (platform === "darwin") {
  // macOS: Library/Application Support
  appDataPath = path.join(homeDir, "Library", "Application Support");
} else {
  // Linux: ~/.local/share (ruta estándar de Tauri en Linux)
  appDataPath =
    process.env.XDG_DATA_HOME || path.join(homeDir, ".local", "share");
}

// 3. Unimos la ruta final de la base de datos
const dbPath = path.join(appDataPath, bundleId, "proyecto5.db");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    // Reemplazamos los slashes invertidos por normales para el protocolo de SQLite
    url: `file:${dbPath.replace(/\\/g, "/")}`,
  },
  verbose: true,
  strict: true,
});
