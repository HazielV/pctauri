import { useEffect, useState } from "react";
import { db } from "./db/client";
import { users } from "./db/schema";
import { Button } from "@/components/ui/button"; // Si ya instalaste el botón de shadcn

export default function TestDB() {
  const [lista, setLista] = useState<any[]>([]);

  // Función para leer
  const cargarUsuarios = async () => {
    try {
      const resultado = await db.select().from(users);
      setLista(resultado);
    } catch (error) {
      console.error("Fallo al leer:", error);
    }
  };

  // Función para crear
  const agregarUsuario = async () => {
    try {
      await db.insert(users).values({
        name: "Usuario de Prueba",
        email: `test-${Math.random()}@example.com`,
      });
      await cargarUsuarios(); // Recargar la lista
    } catch (error) {
      console.error("Fallo al insertar:", error);
    }
  };

  useEffect(() => {
    console.log('lista:',lista)
    cargarUsuarios();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Prueba de SQLite + Drizzle</h1>
      
      <Button onClick={agregarUsuario} className="mb-4">
        Agregar Usuario Aleatorio
      </Button>

      <div className="border rounded p-4">
        <h2 className="font-semibold">Usuarios en DB:</h2>
        <ul>
          {lista.map((u) => (
            <li key={u.id} className="border-b py-1">
              {u.id} - {u.name} ({u.email})
            </li>
          ))}
          {lista.length === 0 && <p>No hay usuarios aún.</p>}
        </ul>
      </div>
    </div>
  );
}