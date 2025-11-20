import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "/firebaseConfig";
import Header from "../components/Header";

export default function RegistrarPmoc() {
  const [equipamentosPorBloco, setEquipamentosPorBloco] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);

  // ---------------------------------------------
  // CARREGAR TODOS OS EQUIPAMENTOS
  // ---------------------------------------------
  useEffect(() => {
    async function carregarEquipamentos() {
      const snapshot = await getDocs(collection(db, "equipamentos"));
      const blocos = {};

      snapshot.forEach((docSnap) => {
        const dados = docSnap.data();
        const bloco = dados.bloco || "SEM BLOCO";

        if (!blocos[bloco]) blocos[bloco] = [];

        blocos[bloco].push({
          id: docSnap.id,
          codigo: dados.codigo || "",
          nome: dados.nome || "",
          local: dados.local || "",
          fabricante: dados.fabricante || "",
          modelo: dados.modelo || "",
          btu: dados.btu || "",
          statusPMOC: dados.statusPMOC || "pendente",
          ultimaManutencao: dados.ultimaManutencao
            ? new Date(dados.ultimaManutencao.toDate())
            : null,
        });
      });

      setEquipamentosPorBloco(blocos);
    }

    carregarEquipamentos();
  }, []);

  // ---------------------------------------------
  // FUNÇÃO: MARCAR PMOC FEITO
  // ---------------------------------------------
  async function marcarPmoc() {
    if (!equipamentoSelecionado) return;

    await updateDoc(doc(db, "equipamentos", equipamentoSelecionado.id), {
      statusPMOC: "feito",
      ultimaManutencao: new Date(),
    });

    alert("PMOC registrado com sucesso!");

    // Atualizar UI localmente (sem recarregar tudo)
    setEquipamentosPorBloco((prev) => {
      const novo = { ...prev };
      const bloco = equipamentoSelecionado.bloco;

      novo[bloco] = novo[bloco].map((e) =>
        e.id === equipamentoSelecionado.id
          ? {
              ...e,
              statusPMOC: "feito",
              ultimaManutencao: new Date(),
            }
          : e
      );

      return novo;
    });

    setModalAberto(false);
  }

  // ---------------------------------------------
  // ABRIR MODAL
  // ---------------------------------------------
  function abrirModal(eq, bloco) {
    setEquipamentoSelecionado({ ...eq, bloco });
    setModalAberto(true);
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Header />
      <br />

      <h1 className="text-3xl font-bold text-center mb-6">Registrar PMOC</h1>

      {Object.keys(equipamentosPorBloco).map((bloco) => (
        <div key={bloco} className="bg-gray-100 p-4 rounded-xl shadow mb-6">
          <h2 className="text-xl font-bold text-gray-700 mb-3 text-center">
            Bloco {bloco}
          </h2>

          <ul className="space-y-2">
            {equipamentosPorBloco[bloco].map((eq) => (
              <li
                key={eq.id}
                onClick={() => abrirModal(eq, bloco)}
                className={`p-3 rounded-lg border cursor-pointer transition flex justify-between items-center
                  ${
                    eq.statusPMOC === "feito"
                      ? "bg-green-100 border-green-500"
                      : "bg-red-100 border-red-500 hover:bg-red-200"
                  }
                `}
              >
                <span className="font-semibold">{eq.local}</span>

                <span className="text-sm text-gray-700">
                  {eq.nome} — {eq.codigo}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* --------------------------------------------- */}
      {/* MODAL PMOC */}
      {/* --------------------------------------------- */}
      {modalAberto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4 z-50"
          onClick={() => setModalAberto(false)}
        >
          <div
            className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão fechar */}
            <button
              onClick={() => setModalAberto(false)}
              className="absolute top-3 right-3 text-xl text-gray-600 hover:text-black"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-4">Detalhes do Equipamento</h2>

            <div className="space-y-2 text-sm">
              <p><b>Código:</b> {equipamentoSelecionado.codigo}</p>
              <p><b>Nome:</b> {equipamentoSelecionado.nome}</p>
              <p><b>Bloco:</b> {equipamentoSelecionado.bloco}</p>
              <p><b>Local:</b> {equipamentoSelecionado.local}</p>
              <p><b>Fabricante:</b> {equipamentoSelecionado.fabricante}</p>
              <p><b>Modelo:</b> {equipamentoSelecionado.modelo}</p>
              <p><b>BTUs:</b> {equipamentoSelecionado.btu}</p>

              <p>
                <b>Última Manutenção:</b>{" "}
                {equipamentoSelecionado.ultimaManutencao
                  ? equipamentoSelecionado.ultimaManutencao.toLocaleDateString()
                  : "Nunca realizada"}
              </p>

              <p>
                <b>Status PMOC:</b>{" "}
                {equipamentoSelecionado.statusPMOC === "feito" ? (
                  <span className="text-green-600 font-bold">FEITO</span>
                ) : (
                  <span className="text-red-600 font-bold">PENDENTE</span>
                )}
              </p>
            </div>

            <button
              onClick={marcarPmoc}
              className="w-full bg-green-600 text-white p-3 rounded-lg mt-5 font-bold hover:bg-green-700"
            >
              Marcar PMOC como Feito
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
