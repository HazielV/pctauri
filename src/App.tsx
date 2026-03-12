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
import Inscripciones from "./pages/Inscripciones";
import Archivo from "./pages/Inscripciones/archivo";
import Asistencia from "./pages/asistencia";

function App() {
  const queryClient = new QueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {/* El Titlebar siempre debe estar presente, fuera del Switch */}
        <CustomTitlebar />

        <Switch>
          <Route path="/login">
            {isAuthenticated ? <Redirect to="/admin" /> : <Login />}
          </Route>

          {/* 1. Usamos 'nest' en lugar de ':rest*' */}
          <Route path="/admin" nest>
            {!isAuthenticated ? (
              <Redirect to="/login" />
            ) : (
              <Layout>
                <AlertContext />
                <ModalContext />
                <Toaster />
                <Switch>
                  {/* 2. Las rutas ahora son relativas a /admin */}
                  {/* Dashboard: la ruta base dentro de admin */}
                  <Route path="/" component={Dashboard} />
                  {/* Rutas hijas más limpias */}
                  <Route path="/usuarios" component={Usuarios} />
                  <Route path="/roles" component={Roles} />
                  <Route path="/menus" component={Menus} />
                  <Route path="/permisos" component={Permisos} />
                  <Route path="/recursos" component={Recursos} />
                  <Route path="/gestion" component={Gestion} />
                  <Route path="/sucursales" component={Sucursales} />
                  <Route path="/vehiculos" component={Vehiculos} />
                  <Route path="/instructores" component={Instructores} />
                  <Route path="/cursos" component={Cursos} />
                  <Route path="/inscripciones" component={Inscripciones} />
                  <Route
                    path="/inscripciones/archivo/:id"
                    component={Archivo}
                  />
                  <Route path="/asistencia" component={Asistencia} />
                  <Route>
                    <div className="flex items-center justify-center h-screen">
                      404 | Página no encontrada Global
                    </div>
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
              404 | Página no encontrada Global
            </div>
          </Route>
        </Switch>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
