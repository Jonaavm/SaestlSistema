import { createBrowserRouter } from "react-router";
import { createElement } from "react";
import { DashboardLayout } from "./pages/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Movimiento from "./pages/Mov";
import Reportes from "./pages/Reportes";
import Calendario from "./pages/Calendario";

const Placeholder = ({ title }) =>
  createElement("div", { className: "p-8 text-gray-500" }, title + " (Próximamente)");

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "ingresos", Component: Movimiento },
      { path: "reportes", Component: Reportes},
      { path: "calendario", Component: Calendario },
      { path: "configuracion", Component: () => createElement(Placeholder, { title: "Configuración" }) },
    ],
  },
]);
