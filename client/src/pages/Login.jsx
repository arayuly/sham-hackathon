import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Состояние загрузки
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    setIsLoading(true);
    try {
      await api.post("/auth/login", { email, password });
      login(); // Обновляем состояние авторизации
      navigate("/"); // Перенаправляем на главный дашборд
    } catch (err) {
      setError(err.response?.data?.detail || "Неверный логин или пароль");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Идеально совпадающий фон с Register
    <div className="relative flex items-center justify-center min-h-screen bg-[#0B0F19] text-white overflow-hidden">
      {/* Те же светящиеся пятна */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Карточка формы */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Заголовок с новой иконкой */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-500/10 border border-violet-500/20 rounded-2xl mb-4">
            <LogIn className="w-7 h-7 text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Вход в систему</h2>
          <p className="text-gray-500 text-sm mt-1">
            Войдите, чтобы продолжить анализ
          </p>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center transition-all">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Инпут Email (изменил type="text" на type="email") */}
          <div>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
              required
            />
          </div>

          {/* Инпут Пароль */}
          <div>
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
              required
            />
          </div>

          {/* Кнопка */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 p-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-500 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Вход...
              </>
            ) : (
              "Войти"
            )}
          </button>
        </form>

        {/* Ссылка на регистрацию */}
        <p className="text-sm text-center text-gray-500 mt-6">
          Нет аккаунта?{" "}
          <Link
            to="/register"
            className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
          >
            Регистрация
          </Link>
        </p>
      </div>
    </div>
  );
}
