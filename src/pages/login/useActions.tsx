// Roles/useRoles.ts
import {  useMutation } from "@tanstack/react-query";
import { db } from "@/db/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useLocation,  } from "wouter";

export const useActions = () => {
const setAuth = useAuthStore((state) => state.setAuth);
const [location, navigate] = useLocation();

  // --- MUTACIONES ---
const loginMutation = useMutation({
  mutationFn: async ({ values }: { values: any }) => {
    console.log("mutacion del login",values)
    // 1. Cambiamos 'vehiculo' por la tabla de 'usuarios' (ajusta según tu schema)
    const usuarioLogin = await db.query.usuario.findFirst({
      where: (usuario, { eq }) => eq(usuario.username, values["username"]),
      with:{
        usuariosRoles:{
          columns:{
            rolId: true
          }
        }
      }
    });
    // 2. Validaciones básicas antes de seguir
    if (!usuarioLogin) {
      throw new Error("Usuario no encontrado");
    }

    // 3. Verificación de password (asumiendo que usas bcrypt o similar en el futuro)
    // Por ahora una comparación directa, pero ¡ojo con la seguridad de la tesis!
    /* if (usuarioLogin.password !== values.password) {
      throw new Error("Credenciales invalidas");
    } */

    // 4. IMPORTANTE: Lo que retornes aquí es lo que llega a 'onSuccess'
    return usuarioLogin; 
  },
  onSuccess: (data) => {
    setAuth({
      id: data.id,
      username: data.username,
      roles: data.usuariosRoles
    });
    navigate("/admin/usuarios",{replace: true})
    // 'data' ahora contiene lo que retornamos en mutationFn (el usuarioLogin)
    console.log("Datos del usuario recibidos:", data);
    
    // Aquí es donde guardarías en tu estado global (Zustand, Context, etc.)
    // setAuthUser(data); 

    toast.success(`Bienvenido de nuevo, ${data.username}`);
    
    // Aquí podrías redirigir:
    // setLocation("/admin/dashboard");
  },
  onError: (error: any) => {
    console.log("error", error)
    // El error que lanzamos con 'throw new Error' llega aquí
    toast.error(error.message || "Error al procesar la solicitud");
  },
});


  



  return {
    
    loginMutation,

  };
};
