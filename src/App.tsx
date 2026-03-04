import { Route, Switch, Redirect } from "wouter";
import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Roles from "./pages/Roles";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CustomTitlebar from "./components/CustomTitlebar";
import { ThemeProvider } from "./components/themeProvider";
import { ModalContext } from "./components/ModalContext";
import { Toaster } from "@/components/ui/sonner";
import { AlertContext } from "./components/AlertContext";
import Usuarios from "./pages/Usuarios";
import Menus from "./pages/Menus";
import Permisos from "./pages/Permisos";
import Recursos from "./pages/Recursos";
import Gestion from "./pages/Gestion";
import Sucursales from "./pages/Sucursales";
import Vehiculos from "./pages/Vehiculos";
import Instructores from "./pages/Instructores";
import Cursos from "./pages/Cursos";
import Login from "./pages/login";
import { useAuthStore } from "./store/authStore";
function App() {
  const queryClient = new QueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {/* El Titlebar siempre debe estar presente, fuera del Switch */}
        <CustomTitlebar />

       <Switch>
  <Route path="/login" component={Login} />

  {/* Capturamos todo lo que empiece con /admin */}
  <Route path="/admin/:rest*">
    {!isAuthenticated ? (
      <Redirect to="/login" />
    ) : (
      <Layout>
        <AlertContext />
        <ModalContext />
        <Toaster />
        <Switch>
          {/* Dashboard: IMPORTANTE usar el path exacto */}
          <Route path="/admin" component={Dashboard} />
          
          {/* Rutas hijas */}
          <Route path="/admin/usuarios" component={Usuarios} />
          <Route path="/admin/roles" component={Roles} />
          <Route path="/admin/menus" component={Menus} />
          <Route path="/admin/permisos" component={Permisos} />
          <Route path="/admin/recursos" component={Recursos} />
          <Route path="/admin/gestion" component={Gestion} />
          <Route path="/admin/sucursales" component={Sucursales} />
          <Route path="/admin/vehiculos" component={Vehiculos} />
          <Route path="/admin/instructores" component={Instructores} />
          <Route path="/admin/cursos" component={Cursos} />

          {/* Fallback dentro de admin: Si entran a /admin/lo-que-sea y no existe */}
          <Route>
            <Redirect to="/admin" />
          </Route>
        </Switch>
      </Layout>
    )}
  </Route>

  {/* Raíz del sitio */}
  <Route path="/">
    <Redirect to={isAuthenticated ? "/admin" : "/login"} />
  </Route>

  {/* 404 Global fuera de /admin */}
  <Route>
    <div className="flex items-center justify-center h-screen">
      404 | Página no encontrada
    </div>
  </Route>
</Switch>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
export default App;
