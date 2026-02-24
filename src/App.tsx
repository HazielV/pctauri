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
function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Layout>
          <AlertContext />
          <ModalContext />
          <Toaster />
          <CustomTitlebar />
          <Switch>
            {/* Ruta base redirigida a admin */}
            <Route path="/">
              <Redirect to="/admin" />
            </Route>

            <Route path="/admin" component={Dashboard} />
            <Route path="/admin/usuarios" component={Usuarios} />
            <Route path="/admin/roles" component={Roles} />
            <Route path="/admin/menus" component={Menus} />
            <Route path="/admin/permisos" component={Permisos} />
            <Route path="/admin/recursos" component={Recursos} />
            <Route path="/admin/gestion" component={Gestion} />
            <Route path="/admin/sucursales" component={Sucursales} />
            <Route path="/admin/vehiculos" component={Vehiculos} />
            <Route path="/admin/instructores" component={Instructores} />

            {/* Ruta 404 opcional */}
            <Route>
              <div className="flex items-center justify-center h-full">
                404 | Página no encontrada
              </div>
            </Route>
          </Switch>
        </Layout>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
