import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "/firebaseConfig";
import Header from "../components/Header";

export default function RegistrarPmoc() {
  const [equipamentosPorBloco, setEquipamentosPorBloco] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);
  const [descricao, setDescricao] = useState("");

  // ------------------------------
  // CARREGA EQUIPAMENTOS POR BLOCO
  // ------------------------------
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
          btus: dados.btus || "",
          statusPMOC: dados.statusPMOC || "pendente",
          ultimaManutencao: dados.ultimaManutencao
            ? new Date(dados.ultimaManutencao.toDate())
            : null,
          bloco,
        });
      });

      setEquipamentosPorBloco(blocos);
    }

    carregarEquipamentos();
  }, []);

  // ------------------------------
  // SALVAR MANUTENÇÃO NA SUBCOLEÇÃO
  // ------------------------------
  async function registrarManutencaoSubcolecao() {
    await addDoc(
      collection(db, "equipamentos", equipamentoSelecionado.id, "manutencoes"),
      {
        descricao,
        data: serverTimestamp(),
        criadoEm: serverTimestamp(),
        tipo: "PMOC",
      }
    );
  }

  // ------------------------------
  // MARCAR PMOC + ATUALIZAR EQUIPAMENTO
  // ------------------------------
  async function marcarPmoc() {
    if (!equipamentoSelecionado) return;

    try {
      // 1️⃣ salva manutenção em subcoleção
      await registrarManutencaoSubcolecao();

      // 2️⃣ atualiza status e última manutenção
      await updateDoc(doc(db, "equipamentos", equipamentoSelecionado.id), {
        statusPMOC: "feito",
        ultimaManutencao: serverTimestamp(),
      });

      alert("PMOC registrado com sucesso!");

      // 3️⃣ atualiza interface sem recarregar
      setEquipamentosPorBloco((prev) => {
        const novo = { ...prev };
        const bloco = equipamentoSelecionado.bloco;

        novo[bloco] = novo[bloco].map((eq) =>
          eq.id === equipamentoSelecionado.id
            ? {
                ...eq,
                statusPMOC: "feito",
                ultimaManutencao: new Date(),
              }
            : eq
        );

        return novo;
      });

      setModalAberto(false);
      setDescricao("");
    } catch (e) {
      console.error("Erro ao registrar PMOC:", e);
      alert("Erro ao salvar PMOC");
    }
  }

  // ------------------------------
  // ABRIR MODAL (CARREGAR EQUIPAMENTO ATUALIZADO)
  // ------------------------------
  async function abrirModal(eq, bloco) {
    const snap = await getDoc(doc(db, "equipamentos", eq.id));
    const dados = snap.data();

    setEquipamentoSelecionado({
      ...eq,
      bloco,
      statusPMOC: dados.statusPMOC || "pendente",
      ultimaManutencao: dados.ultimaManutencao
        ? new Date(dados.ultimaManutencao.toDate())
        : null,
    });

    setDescricao("");
    setModalAberto(true);
  }

  // ------------------------------
  // INTERFACE
  // ------------------------------
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

      {/* ------------------------ */}
      {/* MODAL                    */}
      {/* ------------------------ */}
      {modalAberto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4 z-50"
          onClick={() => setModalAberto(false)}
        >
          <div
            className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalAberto(false)}
              className="absolute top-3 right-3 text-xl text-gray-600 hover:text-black"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-4">Registrar PMOC</h2>

            <div className="space-y-2 text-sm">
              <p><b>Código:</b> {equipamentoSelecionado.codigo}</p>
              <p><b>Nome:</b> {equipamentoSelecionado.nome}</p>
              <p><b>Bloco:</b> {equipamentoSelecionado.bloco}</p>
              <p><b>Local:</b> {equipamentoSelecionado.local}</p>
              <p><b>Fabricante:</b> {equipamentoSelecionado.fabricante}</p>
              <p><b>Modelo:</b> {equipamentoSelecionado.modelo}</p>
              <p><b>BTUs:</b> {equipamentoSelecionado.btus}</p>
              <p><b>Status PMOC:</b> {equipamentoSelecionado.statusPMOC}</p>

              <p>
                <b>Última Manutenção:</b>{" "}
                {equipamentoSelecionado.ultimaManutencao
                  ? equipamentoSelecionado.ultimaManutencao.toLocaleDateString()
                  : "Nunca realizada"}
              </p>

              <p className="font-bold">Descrição da Manutenção:</p>
              <textarea
                className="w-full border rounded p-2"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows="3"
              />
            </div>

            <button
              onClick={marcarPmoc}
              className="w-full bg-green-600 text-white p-3 rounded-lg mt-5 font-bold hover:bg-green-700"
            >
              Registrar Manutenção
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
