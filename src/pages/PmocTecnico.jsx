import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  addDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "/firebaseConfig";
import Header from "../components/Header";

export default function RegistrarPmoc() {
  const [equipamentosPorBloco, setEquipamentosPorBloco] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);
  const [descricao, setDescricao] = useState("");
  const [observacao, setObservacao] = useState("");

  // CICLO ATUAL
  const [cicloAtual, setCicloAtual] = useState("");

  // ------------------------------
  // CARREGAR CICLO ATUAL + EQUIPAMENTOS
  // ------------------------------
  useEffect(() => {
    async function carregarTudo() {
      // Carregar ciclo PMOC
      const cicloRef = doc(db, "config", "pmoc");
      const cicloSnap = await getDoc(cicloRef);

      if (cicloSnap.exists()) {
        setCicloAtual(cicloSnap.data().cicloAtual);
      } else {
        // cria o primeiro ciclo automaticamente
        const mes = new Date().toLocaleString("pt-BR", { month: "long" });
        const ano = new Date().getFullYear();
        const ciclo = `${mes.toUpperCase()}/${ano}`;

        await updateDoc(cicloRef, { cicloAtual: ciclo }).catch(async () => {
          await setDoc(cicloRef, { cicloAtual: ciclo });
        });

        setCicloAtual(ciclo);
      }

      // Carregar equipamentos
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
          cicloPMOC: dados.cicloPMOC || "",
          bloco,
        });
      });

      setEquipamentosPorBloco(blocos);
    }

    carregarTudo();
  }, []);

  // ------------------------------
  // SALVAR MANUTENÇÃO EM SUBCOLEÇÃO
  // ------------------------------
  async function registrarManutencaoSubcolecao() {
    await addDoc(
      collection(db, "equipamentos", equipamentoSelecionado.id, "manutencoes"),
      {
        descricao,
        observacao,
        data: serverTimestamp(),
        criadoEm: serverTimestamp(),
        tipo: "PMOC",
        ciclo: cicloAtual,
      }
    );
  }

  // ------------------------------
  // RESETAR CICLO PMOC (novo mês)
  // ------------------------------
  async function resetarPmoc() {
    if (!confirm("Tem certeza que deseja iniciar um novo ciclo de PMOC?")) return;

    const mes = new Date().toLocaleString("pt-BR", { month: "long" });
    const ano = new Date().getFullYear();
    const novoCiclo = `${mes.toUpperCase()}/${ano}`;

    try {
      // Atualiza o documento de ciclo atual
      await updateDoc(doc(db, "config", "pmoc"), {
        cicloAtual: novoCiclo,
      });

      setCicloAtual(novoCiclo);

      // Reset equipamentos
      const snap = await getDocs(collection(db, "equipamentos"));

      const updates = snap.docs.map(async (d) => {
        await updateDoc(doc(db, "equipamentos", d.id), {
          statusPMOC: "pendente",
          cicloPMOC: novoCiclo,
        });
      });

      await Promise.all(updates);

      alert("Novo ciclo de PMOC iniciado!");

      // Atualiza interface
      setEquipamentosPorBloco((prev) => {
        const novo = {};
        Object.keys(prev).forEach((bloco) => {
          novo[bloco] = prev[bloco].map((eq) => ({
            ...eq,
            statusPMOC: "pendente",
            cicloPMOC: novoCiclo,
          }));
        });
        return novo;
      });
    } catch (e) {
      console.error("Erro ao resetar PMOC:", e);
      alert("Erro ao iniciar novo ciclo.");
    }
  }

  // ------------------------------
  // MARCAR PMOC
  // ------------------------------
  async function marcarPmoc() {
    if (!equipamentoSelecionado) return;

    try {
      // salva subcoleção
      await registrarManutencaoSubcolecao();

      // marca como feito para o ciclo atual
      await updateDoc(doc(db, "equipamentos", equipamentoSelecionado.id), {
        statusPMOC: "feito",
        ultimaManutencao: serverTimestamp(),
        cicloPMOC: cicloAtual,
      });

      alert("PMOC registrado!");

      // atualiza interface
      setEquipamentosPorBloco((prev) => {
        const novo = { ...prev };
        novo[equipamentoSelecionado.bloco] = novo[
          equipamentoSelecionado.bloco
        ].map((eq) =>
          eq.id === equipamentoSelecionado.id
            ? {
                ...eq,
                statusPMOC: "feito",
                ultimaManutencao: new Date(),
                cicloPMOC: cicloAtual,
              }
            : eq
        );
        return novo;
      });

      setModalAberto(false);
      setDescricao("");
      setObservacao("");
    } catch (e) {
      console.error("Erro ao salvar PMOC:", e);
      alert("Erro ao registrar manutenção.");
    }
  }

  // ------------------------------
  // ABRIR MODAL
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
    setObservacao("");
    setModalAberto(true);
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Header />

      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-xl font-bold text-gray-700">
          Ciclo Atual: <span className="text-blue-700">{cicloAtual}</span>
        </h2>

    
      </div>

      <h1 className="text-3xl font-bold text-center mt-4 mb-6">
        Controle de PMOC
      </h1>

      {Object.keys(equipamentosPorBloco).map((bloco) => (
        <div
          key={bloco}
          className="bg-gray-100 shadow border border-gray-300 p-4 rounded-xl mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-3 text-center">
            Bloco {bloco}
          </h2>

          <ul className="space-y-2">
            {equipamentosPorBloco[bloco].map((eq) => (
              <li
                key={eq.id}
                onClick={() => abrirModal(eq, bloco)}
                className={`p-4 rounded-lg border cursor-pointer transition flex justify-between items-center
                  ${
                    eq.statusPMOC === "feito"
                      ? "bg-green-100 border-green-500 hover:bg-green-200"
                      : "bg-red-100 border-red-500 hover:bg-red-200"
                  }
                `}
              >
                <div>
                  <div className="font-bold text-gray-800">{eq.nome}</div>
                  <div className="text-sm text-gray-700 flex gap-2">
                    <span>{eq.codigo}</span> • <span>{eq.local}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-500">Status:</div>
                  <div
                    className={`font-bold ${
                      eq.statusPMOC === "feito"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {eq.statusPMOC.toUpperCase()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {modalAberto && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setModalAberto(false)}
        >
          <div
            className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalAberto(false)}
              className="absolute top-3 right-3 text-2xl text-gray-600 hover:text-black"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-3 text-center">
              Registrar PMOC
            </h2>

            <div className="space-y-1 text-sm">
              <p><b>Código:</b> {equipamentoSelecionado.codigo}</p>
              <p><b>Nome:</b> {equipamentoSelecionado.nome}</p>
              <p><b>Local:</b> {equipamentoSelecionado.local}</p>
              <p><b>Bloco:</b> {equipamentoSelecionado.bloco}</p>
              <p><b>Modelo:</b> {equipamentoSelecionado.modelo}</p>
              <p><b>BTUs:</b> {equipamentoSelecionado.btus}</p>
              <p>
                <b>Última Manutenção:</b>{" "}
                {equipamentoSelecionado.ultimaManutencao
                  ? equipamentoSelecionado.ultimaManutencao.toLocaleDateString()
                  : "Nunca realizada"}
              </p>
            </div>

            <div className="mt-4">
              <label className="font-bold text-sm">Descrição:</label>
              <textarea
                className="w-full border rounded p-2 mt-1"
                rows="3"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />

              <label className="font-bold text-sm mt-3 block">Observação:</label>
              <textarea
                className="w-full border rounded p-2 mt-1"
                rows="3"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>

            <button
              onClick={marcarPmoc}
              className="w-full bg-green-600 text-white p-3 rounded-lg mt-5 font-bold hover:bg-green-700 transition"
            >
              Registrar Manutenção
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
