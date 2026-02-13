import { useState } from "react";

import Header from "../components/Header";
import { useParams } from "react-router-dom";

import { useContrato } from "../context/ContratoContext";
import { criarEquipamento } from "../services/equipamentoService";

export default function CadastrarEquipamento() {
  const [loading, setLoading] = useState(false);
    const { contratoId } = useParams();

  async function salvarEquipamento(event) {
    event.preventDefault();
    setLoading(true);

    const form = new FormData(event.target);

    const novoEquipamento = {
      codigo: form.get("codigo"),
      nome: form.get("nome"),
      bloco: form.get("bloco"),
      local: form.get("local"),
      fabricante: form.get("fabricante"),
      modelo: form.get("modelo"),
      capacidadeDeRefrigeracao: form.get("btus"),
      status: form.get("status"),
      Gas_Refrigerante: form.get("gas"),
      tensao: form.get("tensao")
    };
    
     if (!contratoId) {
  alert("Contrato não identificado.");
  setLoading(false);
  return;
}

    try {
      await criarEquipamento(contratoId, novoEquipamento);
      alert("Equipamento cadastrado com sucesso!");
      event.target.reset();
    } catch (erro) {
      console.error("Erro ao salvar:", erro);
      alert("Erro ao salvar equipamento.");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Header />

      <h1 className="text-3xl font-bold text-center mb-6">
        Registrar Equipamento
      </h1>

      <form 
        onSubmit={salvarEquipamento} 
        className="bg-white shadow-lg p-6 rounded-xl space-y-4"
      >
        <div>
          <label className="font-semibold">Código</label>
          <input
            name="codigo"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="font-semibold">Nome do Equipamento</label>
          <input
            name="nome"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="font-semibold">Bloco</label>
          <input
            name="bloco"
            className="w-full p-2 border rounded"
            placeholder="Ex: A, B, C..."
            required
          />
        </div>


        <div>
          <label className="font-semibold">Local</label>
          <input
            name="local"
            className="w-full p-2 border rounded"
            placeholder="Ex: corredor, recepção..."
          />
        </div>

        <div>
          <label className="font-semibold">Fabricante</label>
          <input
            name="fabricante"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="font-semibold">Modelo</label>
          <input
            name="modelo"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="font-semibold">Capacidade de Refrigeração:</label>
          <input
            name="btus"
            type="text"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="font-semibold">Gas Refrigerante:</label>
          <input
            name="gas"
            type="text"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="font-semibold">Tensão:</label>
          <input
            name="tensao"
            type="text"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="font-semibold">Status: </label>
          <input
            name="status"
            type="text"
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          {loading ? "Salvando..." : "Salvar Equipamento"}
        </button>
      </form>
    </div>
  );
}
