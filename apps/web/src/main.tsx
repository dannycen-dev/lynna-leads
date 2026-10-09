import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider, useRouteError } from "react-router";
import { Layout } from "./components/Layout";
import { Empty, Spinner } from "./components/ui";
import { Cuenta, ForcedPasswordChange } from "./pages/Cuenta";
import { Usuarios } from "./pages/Usuarios";
import { Conocimiento } from "./pages/Conocimiento";
import { Login } from "./pages/Login";
import { AdmissionsDashboard, AdmissionsDetail, AdmissionsLeads, AdmissionsReports, AdmissionsSimulator } from "./pages/Admisiones";
import { SessionProvider, useSession } from "./lib/session";
import "./styles/app.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 15_000, refetchOnWindowFocus: true, retry: 1 },
  },
});

/** Sin sesión, todo lleva al login; con sesión, a la app. */
function Protected() {
  const { status, me } = useSession();
  if (status === "loading") return <Spinner label="Cargando Lynna…" />;
  if (status !== "signed-in") return <Navigate to="/login" replace />;
  // Contraseña temporal: primero hay que cambiarla (la API también bloquea todo lo demás).
  return me?.user.mustChangePassword ? <ForcedPasswordChange /> : <Layout />;
}

function LoginRoute() {
  const { status } = useSession();
  if (status === "loading") return <Spinner label="Cargando Lynna…" />;
  return status === "signed-in" ? <Navigate to="/" replace /> : <Login />;
}

/** Error inesperado en una pantalla: mensaje claro en lugar del volcado técnico. */
function RouteError() {
  const error = useRouteError();
  console.error(error);
  return (
    <div className="page">
      <Empty title="Algo salió mal en esta pantalla">
        <p>Recarga la página. Si vuelve a pasar, avísanos qué estabas haciendo.</p>
        <button className="btn btn--primary" onClick={() => window.location.reload()}>
          Recargar
        </button>
      </Empty>
    </div>
  );
}

const router = createBrowserRouter([
  { path: "/login", element: <LoginRoute />, errorElement: <RouteError /> },
  {
    element: <Protected />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <AdmissionsDashboard /> },
      { path: "admisiones", element: <AdmissionsLeads /> },
      { path: "admisiones/:id", element: <AdmissionsDetail /> },
      { path: "reportes", element: <AdmissionsReports /> },
      { path: "agente", element: <AdmissionsSimulator /> },
      { path: "conocimiento", element: <Conocimiento /> },
      { path: "usuarios", element: <Usuarios /> },
      { path: "cuenta", element: <Cuenta /> },
      { path: "*", element: <div className="page"><Empty title="Página no encontrada" /></div> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </QueryClientProvider>
  </StrictMode>,
);
