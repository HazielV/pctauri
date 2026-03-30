import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  username: string;
  roles: { rolId: number }[];
}

interface AuthState {
  user: User;
  isAuthenticated: boolean;
  permisosRutas: Record<string, string[]>;
  setAuth: (user: User, permisosRutas: Record<string, string[]>) => void;
  getPermisosParaRuta: (pathname: string) => string[];
  logout: () => void;
}

const defaultUser = { id: 0, username: "default", roles: [{ rolId: 0 }] };

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: defaultUser,
      isAuthenticated: false,
      permisosRutas: {},
      getPermisosParaRuta: (pathname: string) => {
        const { permisosRutas } = get();

        // 1. Normalizamos la ruta que viene del navegador
        const cleanPath = pathname.replace(/\/$/, "") || "/";

        // 2. Buscamos la coincidencia
        const llave = Object.keys(permisosRutas).find((rutaDb) => {
          const cleanDb = rutaDb.replace(/\/$/, "");

          return (
            cleanDb === cleanPath || // Coincidencia exacta
            cleanPath.endsWith(cleanDb) || // Para cuando location es "/usuarios" y DB es "/admin/usuarios"
            cleanDb.endsWith(cleanPath) || // Al revés
            cleanPath.includes(cleanDb) // Por si hay parámetros dinámicos
          );
        });

        console.log("🔍 Buscando permisos para:", cleanPath);
        console.log("🔑 Llave encontrada en DB:", llave);

        return llave ? permisosRutas[llave] : [];
      },

      setAuth: (user, permisosRutas) =>
        set({ user, permisosRutas, isAuthenticated: true }),
      logout: () =>
        set({
          user: defaultUser,
          permisosRutas: {},
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
