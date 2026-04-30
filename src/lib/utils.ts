import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as Y from "yjs";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// src/lib/yjs/utils.ts
export function encodeBase64(doc: Y.Doc): string {
  const state = Y.encodeStateAsUpdate(doc);
  return btoa(String.fromCharCode(...state));
}

export function decodeBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
