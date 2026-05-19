import { useEffect, useState } from "react";
import Header from '../components/Header';
import { useParams } from "react-router-dom";
import { atualizarEquipamento, deletarEquipamento, listarEquipamentos } from "../services/equipamentoService";

export default function EditarEquip() {
  const { contratoId, empresaId } = useParams();

  const [equipamentosPorBloco, setEquipamentosPorBloco] = useState({});
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando]   = useState(true);
  const [erro, setErro]               = useState(null);
  const [totalDocs, setTotalDocs]     = useState(0);

  // ── Carregar equipamentos ────────────────────────────────────────────────
  useEffect(() => {
    if (!contratoId || !empresaId) {
      setCarregando(false);
      setErro("Contrato ou empresa não identificados na URL.");
      return;
    }

    async function carregarEquipamentos() {
      setCarregando(true);
      setErro(null);
      try {
        const snapshot = await listarEquipamentos(contratoId, empresaId);
        const docs = snapshot.docs ?? [];
        setTotalDocs(docs.length);

        const blocos = {};
        docs.forEach((doc) => {
          const dados = doc.data();
          const bloco  = dados.bloco?.trim()  || "SEM BLOCO";
          const codigo = dados.codigo?.trim() || "(sem código)";

          if (!blocos[bloco]) blocos[bloco] = [];
          blocos[bloco].push({
            id: doc.id,
            codigo,
            nome:        dados.nome          || "",
            local:       dados.local         || "",
            bloco,
            fabricante:  dados.fabricante    || "",
            modelo:      dados.modelo        || "",
            btus:        dados.capacidadeDeRefrigeracao || "",
            status:      dados.status        || "",
            tensao:      dados.tensao        || "",
            gas:         dados.gas_refrigerante || "",
          });
        });

        Object.keys(blocos).forEach((b) =>
          blocos[b].sort((a, z) => a.codigo.localeCompare(z.codigo))
        );

        setEquipamentosPorBloco(blocos);
      } catch (e) {
        console.error("Erro ao carregar equipamentos:", e);
        setErro("Erro ao buscar equipamentos. Verifique o console para mais detalhes.");
      } finally {
        setCarregando(false);
      }
    }

    carregarEquipamentos();
  }, [contratoId, empresaId]);

  // ── Abrir modal ─────────────────────────────────────────────────────────
  function selecionarEquipamento(eq) {
    setEquipamentoSelecionado(eq);
    setModalAberto(true);
  }

  // ── Editar ──────────────────────────────────────────────────────────────
  async function editar(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const novosDados = {
      codigo:                    form.get("codigo"),
      nome:                      form.get("nome"),
      bloco:                     form.get("bloco"),
      local:                     form.get("local"),
      fabricante:                form.get("fabricante"),
      modelo:                    form.get("modelo"),
      capacidadeDeRefrigeracao:  form.get("btus"),
      status:                    form.get("status"),
      tensao:                    form.get("tensao"),
      gas_refrigerante:          form.get("gas"),
    };
    try {
      await atualizarEquipamento(contratoId, empresaId, equipamentoSelecionado.id, novosDados);
      alert("Dados atualizados!");
      setModalAberto(false);
      setEquipamentoSelecionado(null);
      // Atualiza localmente sem recarregar tudo
      setEquipamentosPorBloco((prev) => {
        const copia = { ...prev };
        Object.keys(copia).forEach((b) => {
          copia[b] = copia[b].map((eq) =>
            eq.id === equipamentoSelecionado.id
              ? { ...eq, ...novosDados, btus: novosDados.capacidadeDeRefrigeracao, gas: novosDados.gas_refrigerante }
              : eq
          );
        });
        return copia;
      });
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar equipamento.");
    }
  }

  // ── Deletar ─────────────────────────────────────────────────────────────
  async function deletar() {
    if (!confirm("Deseja realmente excluir este equipamento?")) return;
    try {
      await deletarEquipamento(contratoId, empresaId, equipamentoSelecionado.id);
      alert("Equipamento excluído");
      setModalAberto(false);
      setEquipamentoSelecionado(null);
      setEquipamentosPorBloco((prev) => {
        const copia = {};
        Object.entries(prev).forEach(([b, lista]) => {
          const filtrada = lista.filter((eq) => eq.id !== equipamentoSelecionado.id);
          if (filtrada.length > 0) copia[b] = filtrada;
        });
        return copia;
      });
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir equipamento");
    }
  }

  // ── Render: loading ─────────────────────────────────────────────────────
  if (carregando) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Header />
        <p className="text-center text-gray-400 mt-16">Carregando equipamentos...</p>
      </div>
    );
  }

  // ── Render: erro ────────────────────────────────────────────────────────
  if (erro) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Header />
        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-600 text-sm font-semibold mb-1">Erro ao carregar</p>
          <p className="text-red-500 text-xs">{erro}</p>
        </div>
      </div>
    );
  }

  const blocoKeys = Object.keys(equipamentosPorBloco);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Header />
      <br />

      <h1 className="text-3xl font-bold text-center mb-2">Equipamentos por Bloco</h1>

      {/* ── Estado vazio ──────────────────────────────────────────────────── */}
      {blocoKeys.length === 0 && (
        <div className="mt-8 bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
          <p className="text-gray-500 font-semibold mb-1">Nenhum equipamento cadastrado</p>
          <p className="text-gray-400 text-sm mb-3">
            Nenhum equipamento foi encontrado para este contrato.
          </p>
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-left text-xs text-gray-400 font-mono">
            <p className="font-semibold text-gray-500 mb-1">Caminho consultado no Firebase:</p>
            <p>empresas / <span className="text-blue-500">{empresaId}</span></p>
            <p className="ml-2">contratos / <span className="text-blue-500">{contratoId}</span></p>
            <p className="ml-4">equipamentos  <span className="text-gray-300">← os documentos devem estar aqui</span></p>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Verifique se os dados foram cadastrados neste caminho exato no Firestore.
          </p>
        </div>
      )}

      {/* ── Lista de equipamentos por bloco ─────────────────────────────── */}
      {blocoKeys.map((bloco) => (
        <div key={bloco} className="bg-gray-100 p-4 rounded-xl shadow mb-6">
          <h2 className="text-xl mb-3 text-gray-700 text-center font-bold">
            Bloco {bloco}
          </h2>
          <ul className="space-y-2">
            {equipamentosPorBloco[bloco].map((eq) => (
              <li
                key={eq.id}
                onClick={() => selecionarEquipamento(eq)}
                className={`flex justify-between items-center p-3 rounded-lg cursor-pointer border transition ${
                  equipamentoSelecionado?.id === eq.id
                    ? "bg-blue-100 border-blue-500"
                    : "bg-white hover:bg-blue-50 border-gray-300"
                }`}
              >
                <span className="font-bold text-gray-800">{eq.local}</span>
                <span className="text-gray-600">{eq.nome} — {eq.codigo}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* ── Modal de edição ─────────────────────────────────────────────── */}
      {modalAberto && equipamentoSelecionado && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4 z-50"
          onClick={() => setModalAberto(false)}
        >
          <div
            className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
              onClick={() => setModalAberto(false)}
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-4 text-center">Editar Equipamento</h2>

            <form onSubmit={editar} className="space-y-4 mt-4">
              {[
                { label: "Código",              name: "codigo",    value: equipamentoSelecionado.codigo },
                { label: "Nome",                name: "nome",      value: equipamentoSelecionado.nome },
                { label: "Bloco",               name: "bloco",     value: equipamentoSelecionado.bloco },
                { label: "Local",               name: "local",     value: equipamentoSelecionado.local },
                { label: "Fabricante",          name: "fabricante",value: equipamentoSelecionado.fabricante },
                { label: "Modelo",              name: "modelo",    value: equipamentoSelecionado.modelo },
                { label: "Capacidade (BTUs)",   name: "btus",      value: equipamentoSelecionado.btus },
                { label: "Status",              name: "status",    value: equipamentoSelecionado.status },
                { label: "Tensão",              name: "tensao",    value: equipamentoSelecionado.tensao },
                { label: "Gás Refrigerante",    name: "gas",       value: equipamentoSelecionado.gas },
              ].map(({ label, name, value }) => (
                <div key={name}>
                  <label className="font-medium">{label}: </label>
                  <input
                    name={name}
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    defaultValue={value || ""}
                  />
                </div>
              ))}

              <button
                type="submit"
                className="w-full bg-blue-600 p-3 rounded-lg text-white font-bold hover:bg-blue-700"
              >
                Atualizar Dados
              </button>
              <button
                onClick={deletar}
                type="button"
                className="w-full bg-red-600 p-3 rounded-lg text-white font-bold hover:bg-red-700"
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
