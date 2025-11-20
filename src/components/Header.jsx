import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { Menu, X } from "lucide-react"; // ícones bonitos e leves


export default function Header() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const tipoUsuario = localStorage.getItem("tipoUsuario");
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  if (tipoUsuario == "gestor") {
    
    return (
    <header className="bg-blue-600 text-white px-4 py-3 shadow-md flex justify-between items-center">
      {/* Título */}
      <button className="text-lg sm:text-xl font-bold" onClick={() => navigate("/gestor")}>Sistema AVM</button>
      

      {/* Desktop */}
      <div className="hidden sm:flex items-center space-x-4">
        {user && (
          <span className="text-sm truncate max-w-[150px]">
            {user.email}
          </span>
        )}

        <Link
          to="/gestor"
          className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900 transition"
        >
          Voltar
        </Link>


        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-sm transition"
        >
          Sair
        </button>

      </div>

      {/* Mobile */}
      <button
        className="sm:hidden"
        onClick={() => setMenuAberto(!menuAberto)}
      >
        {menuAberto ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Menu mobile (dropdown) */}
      {menuAberto && (
        <div className="absolute top-14 right-3 bg-white text-black shadow-lg rounded-xl w-40 p-3 flex flex-col space-y-2 z-50">
          {user && (
            <span className="text-xs border-b border-gray-200 pb-1 text-center break-words">
              {user.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-1 rounded-lg text-sm hover:bg-red-600 transition"
          >
            Sair
          </button>
          <Link
          to="/gestor"
          className="bg-black text-white py-1 rounded-lg text-sm text-center"
        >
          Voltar
        </Link>
        </div>
      )}
    </header>
  );
} else{
  return(
    <header className="bg-blue-600 text-white px-4 py-3 shadow-md flex justify-between items-center">
      {/* Título */}
      <button className="text-lg sm:text-xl font-bold" onClick={() => navigate("/tecnico")}>Sistema AVM</button>
      

      {/* Desktop */}
      <div className="hidden sm:flex items-center space-x-4">
        {user && (
          <span className="text-sm truncate max-w-[150px]">
            {user.email}
          </span>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-sm transition"
        >
          Sair
        </button>

        <Link
          to="/tecnico"
          className="bg-black text-white py-1 rounded-lg text-sm text-center"
        >
          Voltar
        </Link>

      </div>

      {/* Mobile */}
      <button
        className="sm:hidden"
        onClick={() => setMenuAberto(!menuAberto)}
      >
        {menuAberto ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Menu mobile (dropdown) */}
      {menuAberto && (
        <div className="absolute top-14 right-3 bg-white text-black shadow-lg rounded-xl w-40 p-3 flex flex-col space-y-2 z-50">
          {user && (
            <span className="text-xs border-b border-gray-200 pb-1 text-center break-words">
              {user.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-1 rounded-lg text-sm hover:bg-red-600 transition"
          >
            Sair
          </button>

          <Link
          to="/tecnico"
          className="bg-black text-white py-1 rounded-lg text-sm text-center"
        >
          Voltar
        </Link>
        </div>
      )}
    </header>
  );
}
}
