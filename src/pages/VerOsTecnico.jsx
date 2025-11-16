import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "/firebaseConfig.js";

export default function EditarOsTecnico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [os, setOs] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // 🔹 Escuta em tempo real
  useEffect(() => {
    const ref = doc(db, "ordens_servico", id);
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        setOs({ id: snapshot.id, ...snapshot.data() });
        setCarregando(false);
      } else {
        alert("OS não encontrada!");
        navigate("/tecnico/ordens");
      }
    });

    return () => unsubscribe();
  }, [id, navigate]);

  const atualizarOS = async (dadosAtualizados) => {
    try {
      const ref = doc(db, "ordens_servico", id);
      await updateDoc(ref, dadosAtualizados);
      alert("Alterações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar OS:", error);
    }
  };

  const finalizarOS = async () => {
    await atualizarOS({ status: "finalizada" });
    alert("OS finalizada!");
    navigate("/tecnico/ordens");
  };

  if (carregando) return <p className="text-center mt-10">Carregando...</p>;
  if (!os) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        OS #{os.id}
      </h1>

      <div className="mb-4 p-4 bg-white rounded-lg shadow">
        <p><strong>Cliente:</strong> {os.nomeCliente}</p>
        <p><strong>Endereço:</strong> {os.enderecoCliente}</p>
        <p><strong>Data:</strong> {os.dataCriacao}</p>
      </div>

      {/* Campos editáveis */}
      <textarea
        placeholder="Descrição do serviço..."
        value={os.descricao || ""}
        onChange={(e) => atualizarOS({ descricao: e.target.value })}
        className="w-full border rounded p-2 mb-3"
      />
      <input
        type="text"
        placeholder="Ajudantes"
        value={os.ajudantes || ""}
        onChange={(e) => atualizarOS({ ajudantes: e.target.value })}
        className="w-full border rounded p-2 mb-3"
      />
      <input
        type="text"
        placeholder="Frota / Motorista"
        value={os.frota || ""}
        onChange={(e) => atualizarOS({ frota: e.target.value })}
        className="w-full border rounded p-2 mb-3"
      />
      <textarea
        placeholder="Observações (opcional)"
        value={os.observacoes || ""}
        onChange={(e) => atualizarOS({ observacoes: e.target.value })}
        className="w-full border rounded p-2 mb-3"
      />

      <button
        onClick={finalizarOS}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Finalizar OS
      </button>
    </div>
  );
}
