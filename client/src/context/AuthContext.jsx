import { createContext, useState } from "react";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Проверяем, есть ли флаг авторизации при загрузке приложения
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuth") === "true",
  );

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuth", "true");
  };

  const logout = async () => {
    try {
      // Отправляем запрос на бэкенд для удаления httpOnly куки
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Ошибка при выходе", error);
    }
    setIsAuthenticated(false);
    localStorage.removeItem("isAuth");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
