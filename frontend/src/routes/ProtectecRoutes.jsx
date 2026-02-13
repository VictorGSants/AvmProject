import { Navigate, useLocation } from "react-router-dom";
import { auth } from "../config/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";

export default function ProtectedRoutes({ children }) {
  const [user, loading] = useAuthState(auth);
  const location = useLocation();
  const tipoUsuario = localStorage.getItem("tipoUsuario");

  if (loading) return <p>Carregando...</p>;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 🔐 Somente patrão
  if (location.pathname.startsWith("/patrao") && tipoUsuario !== "patrao") {
    return <Navigate to="/" replace />;
  }

  // 🔐 Gestor (patrão também pode)
  if (
    location.pathname.startsWith("/gestor") &&
    tipoUsuario !== "gestor" &&
    tipoUsuario !== "patrao"
  ) {
    return <Navigate to="/" replace />;
  }

  // 🔐 Técnico
  if (location.pathname.startsWith("/tecnico") && tipoUsuario !== "tecnico") {
    return <Navigate to="/" replace />;
  }

  return children;
}
