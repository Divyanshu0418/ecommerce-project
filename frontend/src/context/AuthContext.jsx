import { createContext, useContext, useState } from "react";
import { loginUser } from "../services/authService";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  const login = async (email, password) => {
    const response = await loginUser({ email, password });

    const data = response.data;
    // The backend returns a 200 response with a failure string on invalid login
    if (typeof data === "string" && (data.includes("Invalid") || data.includes("password"))) {
      throw new Error(data);
    }

    const jwtToken = data;
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);

    // Update axios headers for this session
    api.defaults.headers.common["Authorization"] = `Bearer ${jwtToken}`;

    let userRole = "USER";
    try {
      // If we can access admin routes, the user is an admin
      await api.get("/admin/users");
      userRole = "ADMIN";
    } catch (err) {
      console.log("Normal user detected:", err.message);
    }

    localStorage.setItem("role", userRole);
    setRole(userRole);

    return userRole;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
