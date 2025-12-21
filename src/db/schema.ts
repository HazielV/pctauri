import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").unique(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
  // Campos vitales para tu Proyecto de Grado (Sincronización)
  isSynced: integer("is_synced", { mode: "boolean" }).default(false),
  externalId: text("external_id"), // El ID que le asigne NestJS en la nube
});
// Añade esto a tu archivo schema.ts
export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  action: text("action").notNull(), // ej: "USER_CREATED"
  entityId: integer("entity_id"), // ID del objeto afectado
  payload: text("payload"), // Datos en JSON
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});
