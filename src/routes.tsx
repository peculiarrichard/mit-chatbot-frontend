import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ChatInterface } from "./pages/ChatInterface";
import { AdminLogin } from "./pages/AdminLogin";
import DashboardLayout from "./pages/DashboardLayout";
import { AdminDashboard } from "./pages/Questions";
import RouteError from "./pages/RouteError";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ChatInterface />,
    errorElement: <RouteError />,
  },
  {
    path: "admin/login",
    element: <AdminLogin />,
  },
  {
    path: "admin/dashboard",
    element: <DashboardLayout />,
    errorElement: <RouteError />,
    children: [
      {
        path: "",
        element: <AdminDashboard />,
      },
    ],
  },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;