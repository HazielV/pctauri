// Roles/useRoles.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useLocation } from "wouter";
import { permiso, recurso, rolesRecursos, usuariosRoles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const useActions = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [_, navigate] = useLocation();
  async function construirPermisosUsuario(
    usuarioId: number,
  ): Promise<Record<string, string[]>> {
    // 1. Obtener el diccionario dinámico de bits desde la tabla Permiso
    // Esto retorna ej: [{ nombre: "leer", valor: 1 }, { nombre: "escribir", valor: 2 }, ...]
    const catalogoPermisos = await db.select().from(permiso);

    // 2. Obtener los recursos y las máscaras de bits asignadas al usuario
    const recursosUsuario = await db
      .select({
        ruta: recurso.ruta,
        mascaraBits: rolesRecursos.permisos,
      })
      .from(usuariosRoles)
      .innerJoin(rolesRecursos, eq(usuariosRoles.rolId, rolesRecursos.rolId))
      .innerJoin(recurso, eq(rolesRecursos.recursoId, recurso.id))
      .where(eq(usuariosRoles.usuarioId, usuarioId));

    // 3. Agrupar y combinar máscaras de bits (por si 2 roles dan acceso a la misma ruta)
    const mapaBitsCombinados: Record<string, number> = {};
    for (const fila of recursosUsuario) {
      if (!mapaBitsCombinados[fila.ruta]) {
        mapaBitsCombinados[fila.ruta] = 0;
      }
      // Usamos OR (|) para combinar los permisos de múltiples roles
      mapaBitsCombinados[fila.ruta] |= fila.mascaraBits;
    }

    // 4. Traducir los bits combinados a arrays de strings
    const permisosRutas: Record<string, string[]> = {};

    for (const [ruta, mascaraTotal] of Object.entries(mapaBitsCombinados)) {
      const permisosTexto: string[] = [];

      for (const p of catalogoPermisos) {
        // Operación Bitwise AND (&) para verificar si el permiso está incluido en la máscara
        if ((mascaraTotal & p.valor) === p.valor) {
          permisosTexto.push(p.nombre); // ej: "leer"
        }
      }

      permisosRutas[ruta] = permisosTexto;
    }

    return permisosRutas; // Retorna: { "/admin/usuarios": ["leer", "escribir", ...], ... }
  }

  // --- MUTACIONES ---
  const loginMutation = useMutation({
    mutationFn: async ({ values }: { values: any }) => {
      console.log("mutacion del login", values);
      // 1. Cambiamos 'vehiculo' por la tabla de 'usuarios' (ajusta según tu schema)
      const usuarioLogin = await db.query.usuario.findFirst({
        where: (usuario, { eq }) => eq(usuario.username, values["username"]),
        with: {
          usuariosRoles: {
            columns: {
              rolId: true,
            },
          },
        },
      });

      if (!usuarioLogin) {
        throw new Error("Usuario no encontrado");
      }
      const permisosRutas = await construirPermisosUsuario(usuarioLogin.id);

      return {
        usuario: usuarioLogin,
        permisosRutas,
      };
    },
    onSuccess: (data) => {
      setAuth(
        {
          id: data.usuario.id,
          username: data.usuario.username,
          roles: data.usuario.usuariosRoles,
        },
        data.permisosRutas, // El diccionario generado
      );
      queryClient.clear();

      console.log("Permisos generados:", data.permisosRutas);
      toast.success(`Bienvenido de nuevo, ${data.usuario.username}`);

      navigate("/admin/", { replace: true });
      // Aquí podrías redirigir:
      // setLocation("/admin/dashboard");
    },
    onError: (error: any) => {
      console.log("error", error);
      // El error que lanzamos con 'throw new Error' llega aquí
      toast.error("Error al iniciar sesion");
    },
  });

  return {
    loginMutation,
  };
};
