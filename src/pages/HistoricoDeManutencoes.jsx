import { useEffect, useState } from "react";
import { db } from "/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import Header from "../components/Header";

export default function HistoricoManutencoes() {
  const [equipamentosPorBloco, setEquipamentosPorBloco] = useState({});
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);
  const [manutencoes, setManutencoes] = useState([]);
  const [drawerAberto, setDrawerAberto] = useState(false);

  // ---------------------- CARREGA EQUIPAMENTOS ----------------------
  useEffect(() => {
    async function carregarEquipamentos() {
      const snapshot = await getDocs(collection(db, "equipamentos"));
      const blocos = {};

      snapshot.forEach((doc) => {
        const dados = doc.data();
        const bloco = dados.bloco?.trim() || "SEM BLOCO";
        const codigo = dados.codigo?.trim() || "(sem código)";

        if (!blocos[bloco]) blocos[bloco] = [];

        blocos[bloco].push({
          id: doc.id,
          codigo,
          nome: dados.nome || "",
          local: dados.local || "",
          bloco,
        });
      });

      Object.keys(blocos).forEach((bloco) =>
        blocos[bloco].sort((a, b) => a.codigo.localeCompare(b.codigo))
      );

      setEquipamentosPorBloco(blocos);
    }

    carregarEquipamentos();
  }, []);

  // ---------------------- CARREGA MANUTENÇÕES ----------------------
  async function carregarManutencoes(eq) {
    setEquipamentoSelecionado(eq);

    try {
      const ref = collection(db, "equipamentos", eq.id, "manutencoes");
      const snap = await getDocs(ref);

      const lista = snap.docs.map((d) => {
        const dados = d.data();
        return {
          id: d.id,
          ...dados,
          data: dados.data?.toDate ? dados.data.toDate() : null,
        };
      });

      lista.sort((a, b) => (b.data?.getTime() || 0) - (a.data?.getTime() || 0));

      setManutencoes(lista);
      setDrawerAberto(true);

    } catch (e) {
      console.error("Erro ao carregar manutenções:", e);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Header />
      <br />

      <h1 className="text-3xl font-bold text-center mb-6">
        Histórico de Manutenções
      </h1>

      {/* ---------------------- LISTA DE EQUIPAMENTOS ---------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(equipamentosPorBloco).map((bloco) => (
          <div key={bloco} className="bg-gray-100 p-4 rounded-xl shadow">
            <h2 className="text-xl mb-3 font-bold text-center text-gray-700">
              Bloco {bloco}
            </h2>

            <ul className="space-y-2">
              {equipamentosPorBloco[bloco].map((eq) => (
                <li
                  key={eq.id}
                  className="p-3 rounded-lg cursor-pointer border bg-white hover:bg-blue-50 hover:border-blue-500 transition shadow-sm"
                  onClick={() => carregarManutencoes(eq)}
                >
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-800">{eq.local}</span>
                    <span className="text-gray-600">
                      {eq.nome + " - " + eq.codigo}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ---------------------- DRAWER LATERAL ---------------------- */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          drawerAberto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cabeçalho */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold">
            {equipamentoSelecionado
              ? `${equipamentoSelecionado.nome} – ${equipamentoSelecionado.local}`
              : ""}
          </h2>

          <button
            onClick={() => setDrawerAberto(false)}
            className="text-gray-500 text-2xl font-bold hover:text-black"
          >
            ×
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
          {manutencoes.length === 0 ? (
            <p className="text-gray-500">Nenhuma manutenção registrada.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {manutencoes.map((m) => (
                <div
                  key={m.id}
                  className="p-4 bg-gray-100 rounded-xl shadow-inner"
                >
                  <p className="font-semibold text-lg">
                    {m.descricao || "Manutenção"}
                  </p>

                  <p className="text-gray-700">
                    <b>Observação:</b> {m.observacao || "OK"}
                  </p>

                  <p className="text-gray-600 mt-1">
                    <b>Data:</b>{" "}
                    {m.data ? m.data.toLocaleDateString() : "(sem data)"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fundo escurecido quando o drawer está aberto */}
      {drawerAberto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setDrawerAberto(false)}
        ></div>
      )}
    </div>
  );
}
