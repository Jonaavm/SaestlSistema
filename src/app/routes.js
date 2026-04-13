import { createBrowserRouter } from "react-router";
import Dashboard from "./pages/Dashboard";
import Movimiento from "./pages/Mov";
import Reportes from "./pages/Reportes";
import Calendario from "./pages/Calendario";
import Login from "./pages/Login";
import { ProtectedLayout } from "./components/common/ProtectedLayout";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: ProtectedLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "ingresos", Component: Movimiento },
      { path: "reportes", Component: Reportes},
      { path: "calendario", Component: Calendario },
    ],
  },
]);
