import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "/firebaseConfig";
import { useEffect, useState } from "react";
import Header from '../components/Header';

export default function EditarEquip() {
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
          btus: dados.btus || dados.btu || "",
          status: dados.status || "",
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

  // ---------------------- editar dados ----------------------
  async function editar(event) {
    event.preventDefault(); //Impede o comportamento padrão do formulário. 

    const form = new FormData(event.target); // Coleta os dados do formulário

    const novosDados = {
      codigo: form.get("codigoEquipamento"),
      nome: form.get("nomeEquipamento"),
      bloco: form.get("blocoCadastrado"),
      local: form.get("localCadastrado"),
      fabricante: form.get("fabricanteCadastrado"),
      modelo: form.get("modeloCadastrado"),
      btus: form.get("btusCadastrado"),
      status: form.get("status"),

    };

    console.log("Dados Atualizados", novosDados);

    
    const ref = doc(db, "equipamentos", equipamentoSelecionado.id);
    await updateDoc(ref, novosDados);

    alert("Dados Atualizados");
    setModalAberto(false);
  }


   async function deletar() {
    console.log("Equipamento Deletado do Banco !");
    const ref = doc(db, "equipamentos", equipamentoSelecionado.id);
    await deleteDoc(ref);

    alert("Dados Deletados !");
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

            <h2 className="text-xl font-bold mb-4 text-center">Editar Equipamento</h2>

            {/* ---------------------- Editar Equipamento ---------------------- */}
            <form onSubmit={editar} className="space-y-4 mt-4">

              <div>
                <label className="font-medium">Código Cadastrado: </label>
                <input
                  name="codigoEquipamento"
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  required
                  defaultValue={equipamentoSelecionado.codigo || "SEM CODIGO CADASTRADO"}
                />
              </div>

              <div>
                <label className="font-medium">Nome Cadastrado: </label>
                <input
                  name="nomeEquipamento"
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  required
                  defaultValue={equipamentoSelecionado.nome || "SEM NOME CADASTRADO"}
                />
              </div>

              <div>
                <label className="font-medium">Bloco Cadastrado: </label>
                <input
                  name="blocoCadastrado"
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  required
                  defaultValue={equipamentoSelecionado.bloco || "SEM BLOCO CADASTRADO"}
                />
              </div>

              <div>
                <label className="font-medium">Local Cadastrado: </label>
                <input
                  name="localCadastrado"
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  required
                  defaultValue={equipamentoSelecionado.local || "SEM LOCAL CADASTRADO"}
                />
              </div>

              <div>
                <label className="font-medium">Fabricante Cadastrado: </label>
                <input
                  name="fabricanteCadastrado"
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  required
                  defaultValue={equipamentoSelecionado.fabricante || "SEM FABRICANTE CADASTRADO"}
                />
              </div>

              <div>
                <label className="font-medium">Modelo Cadastrado: </label>
                <input
                  name="modeloCadastrado"
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  required
                  defaultValue={equipamentoSelecionado.modelo || "SEM MODELO CADASTRADO"}
                />
              </div>

              <div>
                <label className="font-medium">BTUS: </label>
                <input
                  name="btusCadastrado"
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  required
                  defaultValue={equipamentoSelecionado.btus || "SEM BTUS CADASTRADO"}
                />
              </div>

              <div>
                <label className="font-semibold">Status: </label>
                <input
                  name="status"
                  type="text"
                  className="w-full p-2 border rounded"
                  required
                  defaultValue={equipamentoSelecionado.status || "SEM STATUS CADASTRADO"}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 p-3 rounded-lg text-white font-bold hover:bg-blue-700"
              >
                Atualizar Dados do Equipamento 
              </button>
              
              <button
                onClick={deletar}
                type="button"
                className="w-full bg-red-600 p-3 rounded-lg text-white font-bold hover:bg--700"
              >
                Excluir Equipamento 
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
