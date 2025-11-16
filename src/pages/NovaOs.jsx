import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "/firebaseConfig";
import { useEffect, useState } from "react";
import Header from '../components/Header';

export default function NovaOs() {
  const [equipamentosPorBloco, setEquipamentosPorBloco] = useState({});
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  // ---------------------- CARREGAR EQUIPAMENTOS ----------------------
  useEffect(() => {
    async function carregarEquipamentos() {
      const snapshot = await getDocs(collection(db, "equipamentos"));
      const blocos = {};

      snapshot.forEach((doc) => {
        const dados = doc.data();
        const bloco = (dados.bloco || "").trim() || "SEM BLOCO";
        const codigo = (dados.codigo || "").trim() || "(sem código)";

        if (!blocos[bloco]) blocos[bloco] = [];

        blocos[bloco].push({
          id: doc.id,
          codigo,
          nome: dados.nome || "",
          bloco,
          fabricante: dados.fabricante || "",
          modelo: dados.modelo || "",
          btu: dados.btus || dados.btu || "",
          local: dados.local || "",
          raw: dados,
        });
      });

      Object.keys(blocos).forEach((bloco) => {
        blocos[bloco].sort((a, b) => a.codigo.localeCompare(b.codigo));
      });

      setEquipamentosPorBloco(blocos);
    }

    carregarEquipamentos();
  }, []);

  // ---------------------- ABRIR MODAL ----------------------
  function selecionarEquipamento(eq) {
    setEquipamentoSelecionado(eq);
    setModalAberto(true);
  }

  // ---------------------- CRIAR ORDEM DE SERVIÇO ----------------------
  async function criarOS(event) {
    event.preventDefault(); //Impede o comportamento padrão do formulário. 

    const form = new FormData(event.target); // Coleta os dados do formulário

    const novaOS = {
      equipamentoId: equipamentoSelecionado.id,
      codigoEquipamento: equipamentoSelecionado.codigo,
      nomeEquipamento: equipamentoSelecionado.nome,
      bloco: equipamentoSelecionado.bloco,
      local: equipamentoSelecionado.local,

      data: form.get("data"),
      descricao: form.get("descricao"),
      criadoEm: new Date(),
      status: "pendente"
    };

    console.log("OS criada:", novaOS);

    // Exemplo: salvar no Firestore
    const docRef = await addDoc(collection(db, "ordens"), novaOS);
    docRef();

    alert("OS criada com sucesso!");
    setModalAberto(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Header />
      <br />

      <h1 className="text-3xl font-bold text-center mb-6">
        Equipamentos por Bloco
      </h1>

      {/* ---------------------- LISTA DE EQUIPAMENTOS ---------------------- */}
      {Object.keys(equipamentosPorBloco).map((bloco) => (
        <div
          key={bloco}
          className="bg-gray-100 p-4 rounded-xl shadow mb-6"
        >
          <h2 className="text-xl font-semibold mb-3 text-gray-700">
            Bloco {bloco}
          </h2>

          <ul className="space-y-2">
            {equipamentosPorBloco[bloco].map((eq) => (
              <li
                key={eq.id}
                onClick={() => selecionarEquipamento(eq)}
                className={`flex justify-between items-center p-3 rounded-lg cursor-pointer border transition
                  ${
                    equipamentoSelecionado?.id === eq.id
                      ? "bg-blue-100 border-blue-500"
                      : "bg-white hover:bg-blue-50 border-gray-300"
                  }
                `}
              >
                <span className="font-bold text-gray-800">{eq.codigo}</span>
                <span className="text-gray-600">{eq.nome}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* ---------------------- MODAL ---------------------- */}
      {modalAberto && equipamentoSelecionado && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4 z-50"
          onClick={() => setModalAberto(false)}
        >
          <div
            className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão Fechar */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
              onClick={() => setModalAberto(false)}
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-4">Detalhes do Equipamento</h2>

            {/* Detalhes */}
            <div className="space-y-2 text-sm">
              <p><b>Código:</b> {equipamentoSelecionado.codigo}</p>
              <p><b>Nome:</b> {equipamentoSelecionado.nome}</p>
              <p><b>Bloco:</b> {equipamentoSelecionado.bloco}</p>
              <p><b>Local:</b> {equipamentoSelecionado.local}</p>
              <p><b>Fabricante:</b> {equipamentoSelecionado.fabricante}</p>
              <p><b>Modelo:</b> {equipamentoSelecionado.modelo}</p>
              <p><b>BTUs:</b> {equipamentoSelecionado.btu}</p>
            </div>

            {/* ---------------------- FORMULÁRIO OS ---------------------- */}
            <form onSubmit={criarOS} className="space-y-4 mt-4">

              <div>
                <label className="font-medium">Data da OS</label>
                <input
                  name="data"
                  type="date"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="font-medium">Descrição do Serviço</label>
                <textarea
                  name="descricao"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Descreva o serviço"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 p-3 rounded-lg text-white font-bold hover:bg-blue-700"
              >
                Criar OS
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
