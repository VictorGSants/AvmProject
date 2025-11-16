import { useState } from "react";
import { db } from "/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import Header from "../components/Header";

export default function RegistrarEquipamento() {
  const [loading, setLoading] = useState(false);

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
      btus: form.get("btus"),
      criadoEm: new Date(),
    };

    try {
      await addDoc(collection(db, "equipamentos"), novoEquipamento);
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
          <label className="font-semibold">BTUs</label>
          <input
            name="btus"
            type="number"
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          {loading ? "Salvando..." : "Salvar Equipamento"}
        </button>
      </form>
    </div>
  );
}
