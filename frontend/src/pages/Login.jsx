import { useState, useEffect } from "react";
import { auth, db } from "../config/firebaseConfig";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

export default function AuthLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) console.log("Usuário autenticado:", user.email);
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !senha) {
      setErro("Preencha todos os campos!");
      return;
    }

    try {
      setCarregando(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);

      const loggedUser = userCredential.user;
      const ref = doc(db, "usuarios", loggedUser.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setErro("Usuário não encontrado no banco!");
        return;
      }

      const dados = snap.data();
      localStorage.setItem("tipoUsuario", dados.tipo);
      localStorage.setItem("email", loggedUser.email);

      if (dados.tipo === "gestor") {
        navigate("/gestor/piracicaba");
      }
      else if (dados.tipo === "patrao") {
        navigate("/patrao")
      }
      else if(dados.tipo === "tecnico"){
        navigate("/tecnico/piracicaba");
      }

    } catch (error) {
      console.error(error);

      if (error.code === "auth/wrong-password") {
        setErro("Senha incorreta.");
      } else if (error.code === "auth/user-not-found") {
        setErro("Usuário não encontrado.");
      } else {
        setErro("Erro ao fazer login.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">

      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        
        <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6">
          Sistema AVM
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label className="text-sm font-semibold text-gray-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border mt-1 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border mt-1 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          {erro && (
            <p className="text-red-600 text-center font-semibold">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className={`w-full py-3 font-bold rounded-lg text-white transition 
            ${carregando ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          © {new Date().getFullYear()} AVM — Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
