import { useState, useEffect } from "react";
import { db } from "/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export default function OsConcluidas() {
  const [lista, setLista] = useState({});
  const [loading, setLoading] = useState(true);
  const [detalhes, setDetalhes] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    carregarOsConcluidas();
  }, []);

  async function carregarOsConcluidas() {
    setLoading(true);

    const ref = collection(db, "ordens");
    const q = query(ref, where("status", "==", "concluida"));

    const snap = await getDocs(q);

    let arr = [];
    snap.forEach((doc) => arr.push({ id: doc.id, ...doc.data() }));

    // ordena por data
    arr.sort((a, b) => b.data.localeCompare(a.data));

    // agrupa por dia
    const grupos = {};
    arr.forEach((os) => {
      const dia = os.data;
      if (!grupos[dia]) grupos[dia] = [];
      grupos[dia].push(os);
    });

    setLista(grupos);
    setLoading(false);
  }

  function gerarPdf(os) {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Relatório de Ordem de Serviço", 14, 15);

    doc.setFontSize(12);
    doc.text(`Código: ${os.modelo}`, 14, 30);
    doc.text(`Data: ${os.data}`, 14, 38);
    doc.text(`Local: ${os.local}`, 14, 46);
    doc.text(`Técnico Responsável: ${os.tecnicoResponsavel}`, 14, 54);

    if (os.nomeEquipamento) {
      doc.text(`Equipamento: ${os.nomeEquipamento}`, 14, 62);
    }

    doc.text("Descrição do Serviço:", 14, 75);
    doc.text(os.descricao || "-", 14, 83);

    doc.text("Observações:", 14, 100);
    doc.text(os.observacoes || "-", 14, 108);

    // gera tabela bonita
    autoTable(doc, {
      startY: 125,
      head: [["Campo", "Valor"]],
      body: [
        ["Ajudantes", os.ajudantes || "-"],
        ["Status", "Concluída"],
        ["Código", os.codigoEquipamento],
        ["Tipo Serviço", os.tipoServico || "-"],
        ["Bloco", os.bloco]
      ],
    });

    doc.save(`OS_${os.id}.pdf`);
}

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Ordem de Serviços Concluídas</h1>

        {/* Botão voltar */}
        <Link
          to="/gestor"
          className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900 transition"
        >
          Voltar
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Carregando...</p>
      ) : Object.keys(lista).length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma OS concluída.</p>
      ) : (
        <div className="space-y-6">
          {Object.keys(lista)
            .sort()
            .reverse()
            .map((dia) => (
              <div key={dia}>
                {/* Data */}
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  {dia}
                </h2>

                <div className="space-y-3">
                  {lista[dia].map((os) => (
                    <div
                      key={os.id}
                      onClick={() => {
                        setDetalhes(os);
                        setModalAberto(true);
                      }}
                      className="p-4 bg-white border rounded-lg shadow hover:shadow-md hover:bg-gray-50 cursor-pointer transition"
                    >
                      <p>
                        <span className="font-semibold">ID:</span> {os.id}
                      </p>
                      <p>
                        <span className="font-semibold">Local:</span> {os.local}
                      </p>
                      <p>
                        <span className="font-semibold">Técnico:</span>{" "}
                        {os.tecnicoResponsavel}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* MODAL DETALHES */}
      {modalAberto && detalhes && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative">
            <button
              onClick={() => setModalAberto(false)}
              className="absolute top-2 right-3 text-lg text-gray-600 hover:text-black"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-4">Detalhes da OS</h2>

            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Código:</strong> {detalhes.id}
              </p>
              <p>
                <strong>Local:</strong> {detalhes.local}
              </p>
              <p>
                <strong>Data:</strong> {detalhes.data}
              </p>
              <p>
                <strong>Descrição:</strong> {detalhes.descricao}
              </p>
              <p>
                <strong>Técnico Responsável:</strong>{" "}
                {detalhes.tecnicoResponsavel}
              </p>
              <p>
                <strong>Observações:</strong> {detalhes.observacoes}
              </p>
              <p>
                <strong>Equipamento:</strong> {detalhes.nomeEquipamento}
              </p>
              <br />
            </div>

            <button
              onClick={() => gerarPdf(detalhes)}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition mb-3"  >
              Gerar PDF
            </button>
            
            <button
              onClick={() => setModalAberto(false)}
              className="mt-6 w-full py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
