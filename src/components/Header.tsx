export const Header = () => {
  const logout = () => {
    localStorage.removeItem("mitAdminUser");
    window.location.href = "/admin/login";
  };
  return (
    <div style={{ padding: "20px" }}>
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};
