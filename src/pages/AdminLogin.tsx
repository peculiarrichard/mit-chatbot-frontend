import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AdminLogin = () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const endpoint = "/api/auth/admin/login";
      const response = await axios.post(`${API_BASE}${endpoint}`, {
        email,
        password,
      });
      localStorage.setItem("mitAdminUser", JSON.stringify(response.data.data));
      navigate("/admin/dashboard");
    } catch (error: any) {
      setError(error.response?.data?.detail || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-form">
        <h2>Admin Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};
