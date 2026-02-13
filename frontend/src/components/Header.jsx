import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../config/firebaseConfig";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { Menu, X } from "lucide-react"; // ícones bonitos e leves
import { doc, getDoc } from "firebase/firestore";

function Voltar() {
  history.back();
}

export default function Header() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const { contratoId } = useParams();
  const tipoUsuario = localStorage.getItem("tipoUsuario");
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const [nome, setNome] = useState("");

  useEffect(()=> {
    async function buscarNome() {
      if (!user) return;
      
      const ref = doc(db, "usuarios", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists) {
        setNome(snap.data().nome)
      }
    }
    buscarNome();
  }, [user]);

  if (tipoUsuario == "gestor") {
    
    return (
    <header className="bg-blue-600 text-white px-4 py-3 shadow-md flex justify-between items-center">
      {/* Título */}
      <button className="text-lg sm:text-xl font-bold" onClick={() => navigate("/gestor/:contratoId")}>Sistema AVM</button>
      

      {/* Desktop */}
      {user && (
          <span className="text-sm truncate max-w-[150px]">
           <strong> {"Bem vindo, " + nome}</strong>
          </span>
        )}

      <div className="hidden sm:flex items-center space-x-4">
        

        <button
          onClick={Voltar}
          className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900 transition"
        >
          Voltar
        </button>


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

          <button
          onClick={() => navigate(`/gestor/${contratoId}`)}
          className="bg-black text-white py-1 rounded-lg text-sm text-center"
        >
          Voltar
        </button>
        </div>
      )}
    </header>
  );
} else if (tipoUsuario == "patrao") {
    
    return (
    <header className="bg-blue-600 text-white px-4 py-3 shadow-md flex justify-between items-center">
      {/* Título */}
      <button className="text-lg sm:text-xl font-bold" onClick={() => navigate("/patrao")}>Sistema AVM</button>
      

      {/* Desktop */}
      {user && (
          <span className="text-sm truncate max-w-[150px]">
           <strong> {"Bem vindo, " + nome}</strong>
          </span>
        )}

      <div className="hidden sm:flex items-center space-x-4">
        

        <button
          onClick={Voltar}
          className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900 transition"
        >
          Voltar
        </button>


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

          <button
          onClick={() => navigate(`/gestor/${contratoId}`)}
          className="bg-black text-white py-1 rounded-lg text-sm text-center"
        >
          Voltar
        </button>
        </div>
      )}
    </header>
  );
}
  
  else {
    return(
    <header className="bg-blue-600 text-white px-4 py-3 shadow-md flex justify-between items-center">
      {/* Título */}
      <button className="text-lg sm:text-xl font-bold" onClick={() => navigate(`/tecnico/${contratoId}`)}>Sistema AVM</button>
      
      {user && (
          <span className="text-sm truncate max-w-[150px]">
           <strong> {"Bem vindo, " + nome}</strong>
          </span>
        )}

      {/* Desktop */}
      <div className="hidden sm:flex items-center space-x-4">
        
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-sm transition"
        >
          Sair
        </button>

         <button
          onClick={Voltar}
          className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900 transition"
        >
          Voltar
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

          <button
          onClick={() => navigate(`/tecnico/${contratoId}`)}
          className="bg-black text-white py-1 rounded-lg text-sm text-center"
        >
          Voltar
        </button>
        </div>
      )}
    </header>
  );
}
}
