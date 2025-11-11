import { useState, useEffect } from "react";
import { auth } from "../../firebaseConfig";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";


export default function AuthLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("gestor");
  const [erro, setErro] = useState("");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // 🔹 Monitora se o usuário está logado (executa 1x ao iniciar)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => { 
      setUser(currentUser); // atualiza o estado do usuário 
    });
    return () => unsubscribe(); // limpa o listener ao desmontar
  }, []);

  

  // 🔹 Função de login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !senha) {
      setErro("Preencha todos os campos!");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      console.log("Usuário logado:", userCredential.user);
      setErro("");
      localStorage.setItem("tipoUsuario", tipoUsuario);
      localStorage.setItem("email", email)
      if (tipoUsuario === "gestor"){
        navigate("/gestor");
        console.log("Redirecionar para área do gestor"); 
      }
      else {
        navigate("/tecnico");
        console.log("Redirecionar para área do técnico");
      }
      
      // Exemplo: if (tipoUsuario === "gestor") navigate("/dashboardGestor")
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setErro("Usuário não encontrado. Verifique o e-mail e a senha.");
      } else if (error.code === "auth/wrong-password") {
        setErro("Senha incorreta.");
      } else {
        setErro("Erro ao fazer login: " + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-96">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Sistema AVM 
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)} // atualiza o estado da senha
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="flex justify-between items-center">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="tipo"
                value="gestor"
                checked={tipoUsuario === "gestor"}
                onChange={(e) => setTipoUsuario(e.target.value)}
              />
              <span>Gestor</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="tipo"
                value="tecnico"
                checked={tipoUsuario === "tecnico"}
                onChange={(e) => setTipoUsuario(e.target.value)}
              />
              <span>Técnico</span>
            </label>
          </div>

          {erro && <p className="text-red-500 text-sm">{erro}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Entrar
          </button>
        </form>

        {user && (
          <p className="text-green-600 mt-4 text-center">
            Logado como: {user.email}
          </p>
        )}
      </div>
    </div>
  );
}
