import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ResultView from "./pages/ResultView";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout"; // Импортируем наш Layout

// Компонент для сброса скролла при переходе между страницами
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Публичные маршруты (у них свой белый/серый дизайн для логина) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Защищенные маршруты (оборачиваем в MainLayout) */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Индексный роут */}
            <Route path="/" element={<Dashboard />} />
            {/* ИСПРАВЛЕНО: убрали 's' в слове results, чтобы совпало с Dashboard */}
            <Route path="/result/:id" element={<ResultView />} />
          </Route>

          {/* Редирект для неизвестных адресов */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
