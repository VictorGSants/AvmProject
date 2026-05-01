import { signOut } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { ArrowLeft, Snowflake, LogOut } from "lucide-react";

export default function Header() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <header className="bg-[#1a1a2e] text-white px-4 py-3 shadow-lg flex justify-between items-center">
      {/* Voltar */}
      <button
        onClick={() => window.history.back()}
        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
        title="Voltar"
      >
        <ArrowLeft size={22} />
      </button>

      {/* Logo + nome da empresa
          Para usar a logo real: substitua o <div> abaixo por:
          <img src="/logo.png" alt="AVM" className="h-9 w-9 rounded-xl object-cover" /> */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#7b8cd4] flex items-center justify-center shadow-md">
          <Snowflake size={18} className="text-white" />
        </div>
        <div className="text-left leading-tight">
          <p className="text-sm font-extrabold tracking-wider text-white">A.V.M Ar</p>
          <p className="text-[10px] text-gray-400 tracking-widest uppercase">Campinas</p>
        </div>
      </div>

      {/* Sair */}
      <button
        onClick={handleLogout}
        className="p-2 rounded-xl hover:bg-white/10 transition-colors text-red-400 hover:text-red-300"
        title="Sair"
      >
        <LogOut size={20} />
      </button>
    </header>
  );
}
