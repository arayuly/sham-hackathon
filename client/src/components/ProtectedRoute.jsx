import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    // Если не авторизован, перенаправляем на страницу входа
    return <Navigate to="/login" replace />;
  }

  // Если авторизован, показываем защищенный контент
  return children;
}
