// src/pages/Agenda.jsx
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc
} from "firebase/firestore";
import { db } from "/firebaseConfig";
import Header from "../components/Header";

export default function Agenda() {
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [ordens, setOrdens] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // modal / OS selecionada / campos do form
  const [modalAberto, setModalAberto] = useState(false);
  const [osSelecionada, setOsSelecionada] = useState(null);
  const [ajudantes, setAjudantes] = useState("");
  const [observacoes, setObservacoes] = useState("");


  // --- prioridade: espera string 'baixa' | 'media' | 'alta' no doc
  function getPrioridadeColor(p) {
    return {
      baixa: "bg-green-500",
      media: "bg-yellow-500",
      alta: "bg-red-500",
    }[p] || "bg-gray-400";
  }

  // Carrega ordens pendentes para a data selecionada em tempo real
  useEffect(() => {
    setCarregando(true);

    // constrói query: data == dataSelecionada AND status == 'pendente'
    
    const col = collection(db, "ordens");

    const q = query(col, where("data", "==", dataSelecionada), where("status", "==", "pendente"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // ordenar localmente por hora (se existir) para evitar erros de índice
        list.sort((a, b) => {
          if (a.hora && b.hora) return a.hora.localeCompare(b.hora);
          if (a.hora) return -1;
          if (b.hora) return 1;
          return 0;
        });
        setOrdens(list);
        setCarregando(false);
      },
      (err) => {
        console.error("Erro ao carregar ordens:", err);
        setCarregando(false);
      }
    );

    return () => unsub();
  }, [dataSelecionada]);

  // abrir modal e preencher os campos com valores existentes (se houver)
  function abrirModal(os) {
    setOsSelecionada(os);
    setAjudantes(os.ajudantes || "");
    setObservacoes(os.observacoes || "");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setOsSelecionada(null);
  }

  // finalizar OS: atualiza documento da OS e, se equipamento ligado, atualiza equipamento (PMOC)
  async function finalizarOS(e) {
    e.preventDefault();
    if (!osSelecionada) return;

    const osRef = doc(db, "ordens", osSelecionada.id);

    const dadosFinal = {
      ajudantes,
      observacoes,
      concluidoEm: new Date(),
      status: "concluida",
    };

    try {
      // atualiza a OS
      await updateDoc(osRef, dadosFinal);

      // se a OS tiver equipamentoId, tentamos atualizar o equipamento (marca PMOC)
      if (osSelecionada.equipamentoId) {
        // equipamento pode estar em 'equipamentos' ou você usar 'pmoc' — aqui tentamos equipamentos
        const eqRef = doc(db, "equipamentos", osSelecionada.equipamentoId);
        const eqSnap = await getDoc(eqRef);

        if (eqSnap.exists()) {
          await updateDoc(eqRef, {
            statusPMOC: "feito",
            ultimaManutencao: new Date(),
          });
        } else {
          // opcional: se você gravar PMOC em coleção separada, atualize também
          // const pmocRef = doc(db, "pmoc", osSelecionada.equipamentoId);
          // await updateDoc(pmocRef, { status: "ok", ultimaManutencao: new Date() });
        }
      }

      // mensagem e fechar modal
      alert("OS finalizada com sucesso!");
      fecharModal();
      // ordens é via onSnapshot, então UI atualiza automaticamente
    } catch (err) {
      console.error("Erro ao finalizar OS:", err);
      alert("Erro ao finalizar OS. Veja console.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Header />

      <h1 className="text-2xl font-bold text-center mb-6">Agenda de Serviços</h1>

      <div className="mb-6 max-w-xs mx-auto">
        <label className="text-sm font-medium block mb-1">Selecionar dia</label>
        <input
          type="date"
          value={dataSelecionada}
          onChange={(e) => setDataSelecionada(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      {carregando ? (
        <p className="text-center text-gray-600">Carregando...</p>
      ) : ordens.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma OS pendente nesse dia.</p>
      ) : (
        <div className="space-y-4">
          {ordens.map((os) => (
            <article
              key={os.id}
              className="flex items-stretch gap-4 border rounded-lg p-3 shadow cursor-pointer hover:bg-gray-50"
              onClick={() => abrirModal(os)}
            >
              <div className={`w-2 rounded ${getPrioridadeColor(os.prioridade)}`}></div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold">
                      {os.hora ? os.hora + " • " : ""} {os.nomeEquipamento || "Serviço"}
                    </p>
                    <p className="text-gray-700">{os.descricao}</p>
                    <p className="text-sm text-gray-500 mt-1">{os.local || ""}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalAberto && osSelecionada && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={fecharModal}
        >
          <div
            className="bg-white w-full max-w-lg rounded-lg p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="text-gray-500 hover:text-black float-right"
              onClick={fecharModal}
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-2">Finalizar OS</h2>
            <p className="text-sm text-gray-600 mb-4">
              {osSelecionada.nomeEquipamento ? (
                <>
                  <b>{osSelecionada.local} — {osSelecionada.nomeEquipamento} — {osSelecionada.codigoEquipamento} </b>
                  <br />
                  <b>Descrição:</b>  {osSelecionada.descricao}
                </>
              ) : (
                "Serviço geral"
              )}
            </p>

            <form onSubmit={finalizarOS} className="space-y-3">

              <div>
                <label className="text-sm font-medium">Ajudantes (opcional)</label>
                <input
                  value={ajudantes}
                  onChange={(e) => setAjudantes(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Ex: João, Pedro"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Observações (opcional)</label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <button className="w-full bg-blue-600 text-white py-2 rounded mt-2">
                Finalizar OS
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
