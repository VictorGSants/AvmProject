import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { useEffect, useState } from "react";
import Header from '../components/Header';
import {useContrato} from "../context/ContratoContext";

export default function NovaOs() {
  const {contratoId} = useContrato();
  const [equipamentosPorBloco, setEquipamentosPorBloco] = useState({});
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  console.log(contratoId)

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

      tecnicoResponsavel: form.get("tecnicoResponsavel") || null,
      tipoServico: form.get("tipoServico"),
      prioridade: form.get("prioridade"),
      data: form.get("data"),
      descricao: form.get("descricao"),
      criadoEm: new Date(),
      status: "pendente"
    };

    console.log("OS criada:", novaOS);

    // Exemplo: salvar no Firestore
    await addDoc(collection(db, "ordens"), novaOS);


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
          <h2 className="text-xl mb-3 text-gray-700 text-center font-bold">
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
                <span className="font-bold text-gray-800">{eq.local}</span>
                <span className="text-gray-600">{eq.nome + " - " + eq.codigo }</span>
                
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
                <label className="font-medium">Data Agendamento</label>
                <input
                  name="data"
                  type="date"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

             <div>
                <label className="font-medium">Prioridade</label>
               <select
                  name="prioridade"
                  className="
                    w-full mt-1 px-3 py-2 
                    border border-gray-300 rounded-lg 
                    bg-gray-50 text-gray-800 
                    shadow-sm
                    focus:outline-none 
                    focus:ring-2 focus:ring-blue-400 
                    focus:border-blue-500
                    transition-all
                  ">
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
                      

              <div>
                <label className="font-medium">Tipo de Serviço</label>
                <select
                  name="tipoServico"
                  className="w-full mt-1 p-2 border rounded-lg bg-white text-gray-700 
                            focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
                >
                  <option value="instalacao">Instalação</option>
                  <option value="manutencao">Manutenção</option>
                  <option value="reparo">Reparo</option>
                </select>
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

              <div>
                <label className="font-medium">Técnico Responsável (Opcional)</label>
                <input
                    type="text"
                    name="tecnicoResponsavel"
                    placeholder="Nome do Técnico"
                    className="
                      w-full mt-1 px-3 py-2
                      border border-gray-300 rounded-lg
                      bg-gray-50 text-gray-800
                      shadow-sm
                      placeholder:text-gray-400
                      focus:outline-none
                      focus:ring-2 focus:ring-blue-400 
                      focus:border-blue-500
                      transition-all
                    "
                  />
              </div>


              <button
                type="submit"
                className="w-full bg-blue-600 p-3 rounded-lg text-white font-bold hover:bg-blue-700"
              >
                Criar Ordem
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
