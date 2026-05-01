import { useEffect, useState } from "react";
import Header from "../components/Header";
import { listarEquipamentosPMOC, registrarPMOC } from "../services/pmocServices";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import Modal from "../components/Modal";
import AssinaturaPad from "../components/agenda/AssinaturaPad";
import { Loader2, Search } from "lucide-react";

function statusEquipamento(eq) {
  if (!eq.proximaManutencao) return "pendente";
  const hoje = new Date();
  const prox = eq.proximaManutencao.toDate
    ? eq.proximaManutencao.toDate()
    : new Date(eq.proximaManutencao);
  if (prox < hoje) return "atrasado";
  if (prox.getMonth() === hoje.getMonth() && prox.getFullYear() === hoje.getFullYear())
    return "vence";
  return "ok";
}

function formatarData(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function PmocGestor() {
  const { contratoId, empresaId } = useParams();

  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");

  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);
  const [etapa, setEtapa] = useState("formulario"); // "formulario" | "assinatura"
  const [descricao, setDescricao] = useState("");
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!contratoId || !empresaId) return;
    carregar();
  }, [contratoId, empresaId]);

  async function carregar() {
    try {
      setLoading(true);
      const dados = await listarEquipamentosPMOC(empresaId, contratoId);
      setEquipamentos(dados || []);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar equipamentos");
    } finally {
      setLoading(false);
    }
  }

  function abrirModal(eq) {
    setEquipamentoSelecionado(eq);
    setEtapa("formulario");
    setDescricao("");
    setObservacao("");
  }

  function fecharModal() {
    setEquipamentoSelecionado(null);
    setEtapa("formulario");
    setDescricao("");
    setObservacao("");
  }

  function prosseguirParaAssinatura() {
    if (!descricao.trim()) {
      toast.error("Descreva a manutenção realizada.");
      return;
    }
    setEtapa("assinatura");
  }

  async function finalizarComAssinatura(assinaturaBase64) {
    setSalvando(true);
    try {
      await registrarPMOC(empresaId, contratoId, equipamentoSelecionado, descricao, observacao, assinaturaBase64);
      toast.success("PMOC registrada com sucesso!");
      fecharModal();
      carregar();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao registrar PMOC");
    } finally {
      setSalvando(false);
    }
  }

  const equipamentosFiltrados = equipamentos.filter(eq =>
    eq.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    eq.codigo?.toLowerCase().includes(busca.toLowerCase()) ||
    eq.local?.toLowerCase().includes(busca.toLowerCase())
  );

  const blocos = {};
  equipamentosFiltrados.forEach(eq => {
    const bloco = eq.bloco || "SEM BLOCO";
    if (!blocos[bloco]) blocos[bloco] = [];
    blocos[bloco].push(eq);
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Header />

      <h1 className="text-3xl font-bold text-center mb-8">Controle de PMOC</h1>

      {/* Busca */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Pesquisar por nome, código ou local..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#7b8cd4] outline-none"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-[#7b8cd4]" />
        </div>
      )}

      {!loading && Object.keys(blocos).sort().map(bloco => (
        <div key={bloco} className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h2 className="font-extrabold text-xl text-gray-800 flex items-center gap-3">
              🏢 Bloco {bloco}
              <span className="text-sm font-medium bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
                {blocos[bloco].length} equipamentos
              </span>
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {blocos[bloco].sort((a, b) => a.codigo.localeCompare(b.codigo)).map(eq => {
              const status = statusEquipamento(eq);
              const corBorda = status === "atrasado" ? "border-l-red-500" : status === "vence" ? "border-l-amber-400" : status === "pendente" ? "border-l-gray-400" : "border-l-green-500";
              const corBadge = status === "atrasado" ? "bg-red-100 text-red-800 border-red-200" : status === "vence" ? "bg-amber-100 text-amber-800 border-amber-200" : status === "pendente" ? "bg-gray-100 text-gray-600 border-gray-200" : "bg-green-100 text-green-800 border-green-200";
              const textoStatus = status === "atrasado" ? "🚨 Atrasado" : status === "vence" ? "⚠️ Fazer este mês" : status === "pendente" ? "📋 Nunca feito" : "✅ Em dia";

              return (
                <div
                  key={eq.id}
                  onClick={() => abrirModal(eq)}
                  className={`relative flex flex-col justify-between p-5 bg-white border border-gray-200 border-l-4 rounded-xl shadow-sm cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 ${corBorda}`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-800 text-lg leading-tight pr-2">{eq.nome}</h3>
                      <span className="bg-gray-100 text-gray-600 text-xs font-extrabold px-2 py-1 rounded border border-gray-200 whitespace-nowrap">{eq.codigo}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">📍 {eq.local || "Local não informado"}</p>
                    {eq.ultimaManutencao && (
                      <p className="text-xs text-gray-400">Última: {formatarData(eq.ultimaManutencao)}</p>
                    )}
                  </div>
                  <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${corBadge}`}>{textoStatus}</span>
                    <span className="text-gray-400 text-sm">Registrar ➔</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Modal */}
      <Modal
        aberto={!!equipamentoSelecionado}
        onClose={fecharModal}
        titulo={etapa === "assinatura" ? "Assinatura do Responsável" : "Registrar PMOC"}
      >
        <div className="max-h-[75vh] overflow-y-auto pr-1">

          {/* ETAPA 1: Formulário */}
          {etapa === "formulario" && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-800">{equipamentoSelecionado?.nome}</h3>
                  <span className="bg-[#f0f2ff] text-[#7b8cd4] text-xs font-extrabold px-3 py-1 rounded-full border border-[#d0d5f5]">
                    {equipamentoSelecionado?.codigo}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Local</span>
                    <p className="font-medium text-gray-800">{equipamentoSelecionado?.local || "—"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Fabricante / Modelo</span>
                    <p className="font-medium text-gray-800">{equipamentoSelecionado?.fabricante || "—"} • {equipamentoSelecionado?.modelo || "—"}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Descrição da manutenção <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Ex: Limpeza de filtros, medição de corrente, verificação de gás..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b8cd4] outline-none resize-none text-sm"
                  rows={3}
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Observações (opcional)</label>
                <textarea
                  placeholder="Ex: Equipamento apresentando ruído na turbina..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b8cd4] outline-none resize-none text-sm"
                  rows={2}
                  value={observacao}
                  onChange={e => setObservacao(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button onClick={fecharModal}
                  className="flex-1 py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm">
                  Cancelar
                </button>
                <button onClick={prosseguirParaAssinatura}
                  className="flex-1 py-3 px-4 bg-[#7b8cd4] text-white rounded-lg font-bold hover:bg-[#6677be] transition-colors text-sm">
                  Prosseguir para Assinatura →
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 2: Assinatura */}
          {etapa === "assinatura" && (
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl p-3 text-sm text-gray-600 space-y-1">
                <p><span className="font-semibold">Equipamento:</span> {equipamentoSelecionado?.nome}</p>
                <p><span className="font-semibold">Local:</span> {equipamentoSelecionado?.local}</p>
              </div>

              <AssinaturaPad
                onConfirmar={finalizarComAssinatura}
                onCancelar={() => setEtapa("formulario")}
              />

              {salvando && (
                <p className="text-center text-sm text-gray-500 animate-pulse">Salvando PMOC...</p>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
