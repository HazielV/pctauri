import { Route, Switch, Redirect } from "wouter";
import Layout from "./components/Layout";
import Usuarios from "./pages/Dashboard";
import Dashboard from "./pages/Dashboard";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CustomTitlebar from "./components/CustomTitlebar";
import { ThemeProvider } from "./components/themeProvider";

function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Layout>
          <CustomTitlebar />
          <Switch>
            {/* Ruta base redirigida a admin */}
            <Route path="/">
              <Redirect to="/admin" />
            </Route>

            <Route path="/admin" component={Dashboard} />
            <Route path="/admin/usuarios" component={Usuarios} />

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
