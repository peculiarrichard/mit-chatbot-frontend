
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "../components/Header";

const DashboardLayout = () => {
  const user = JSON.parse(localStorage.getItem("mitAdminUser") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.token === "") {
      navigate("/admin/login");
    }
  }, []);

  return (
    <>
    <Header />
      <div className="">
        
        <Outlet />
      </div>
    </>
  );
};

export default DashboardLayout;
