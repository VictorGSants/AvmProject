import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Modal from "../components/Modal";
import { getChamados, atualizarChamado } from "../services/contracts/chamadoService";
import { AlertTriangle, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";

const COR_URGENCIA = {
  alta:  { badge: "bg-red-100 text-red-700 border-red-200",    borda: "border-l-red-500"   },
  media: { badge: "bg-amber-100 text-amber-700 border-amber-200", borda: "border-l-amber-400" },
  baixa: { badge: "bg-slate-100 text-slate-600 border-slate-200", borda: "border-l-slate-400" },
};
const COR_STATUS = {
  aberto:         "bg-blue-100 text-blue-700",
  em_atendimento: "bg-amber-100 text-amber-700",
  fechado:        "bg-green-100 text-green-700",
};
const LABEL_STATUS = {
  aberto:         "Aberto",
  em_atendimento: "Em atendimento",
  fechado:        "Fechado",
};

const FILTROS = ["todos", "aberto", "em_atendimento", "fechado"];
const LABEL_FILTRO = { todos: "Todos", aberto: "Abertos", em_atendimento: "Em atendimento", fechado: "Fechados" };

function formatarData(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function VerChamados() {
  const { empresaId } = useParams();
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [selecionado, setSelecionado] = useState(null);
  const [atualizando, setAtualizando] = useState(false);

  useEffect(() => {
    if (!empresaId) return;
    getChamados(empresaId)
      .then(setChamados)
      .finally(() => setCarregando(false));
  }, [empresaId]);

  async function mudarStatus(chamadoId, novoStatus) {
    setAtualizando(true);
    try {
      await atualizarChamado(empresaId, chamadoId, { status: novoStatus });
      setChamados(prev =>
        prev.map(c => c.id === chamadoId ? { ...c, status: novoStatus } : c)
      );
      if (selecionado?.id === chamadoId) {
        setSelecionado(prev => ({ ...prev, status: novoStatus }));
      }
    } finally {
      setAtualizando(false);
    }
  }

  const lista = filtro === "todos"
    ? chamados
    : chamados.filter(c => c.status === filtro);

  const contagemAbertos = chamados.filter(c => c.status === "aberto").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="p-4 md:p-6 max-w-2xl mx-auto pb-10">

        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={22} className="text-[#7b8cd4]" />
          <h1 className="text-xl font-bold text-gray-800">Chamados</h1>
          {contagemAbertos > 0 && (
            <span className="ml-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {contagemAbertos} aberto{contagemAbertos > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-4">Solicitações enviadas pelos clientes.</p>

        {/* Filtros */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {FILTROS.map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                filtro === f
                  ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {LABEL_FILTRO[f]}
            </button>
          ))}
        </div>

        {carregando && (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#7b8cd4]" />
          </div>
        )}

        {!carregando && lista.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum chamado {filtro !== "todos" ? LABEL_FILTRO[filtro].toLowerCase() : ""}.</p>
          </div>
        )}

        <div className="space-y-3">
          {lista.map(c => {
            const cores = COR_URGENCIA[c.urgencia] ?? COR_URGENCIA.baixa;
            return (
              <div
                key={c.id}
                onClick={() => setSelecionado(c)}
                className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 border-l-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98] ${cores.borda}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${cores.badge}`}>
                      {c.urgencia || "—"} urgência
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${COR_STATUS[c.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {LABEL_STATUS[c.status] ?? c.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatarData(c.criadoEm)}</span>
                </div>

                <p className="text-sm font-semibold text-gray-800 mb-1 capitalize">{c.tipo || "Chamado"}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{c.descricao}</p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal de detalhe */}
      <Modal aberto={!!selecionado} onClose={() => setSelecionado(null)} titulo="Chamado">
        {selecionado && (
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full border capitalize ${(COR_URGENCIA[selecionado.urgencia] ?? COR_URGENCIA.baixa).badge}`}>
                {selecionado.urgencia || "—"} urgência
              </span>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${COR_STATUS[selecionado.status] ?? "bg-gray-100 text-gray-600"}`}>
                {LABEL_STATUS[selecionado.status] ?? selecionado.status}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Tipo</p>
                <p className="text-gray-800 font-medium capitalize">{selecionado.tipo || "—"}</p>
              </div>
              {selecionado.contratoId && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Contrato</p>
                  <p className="text-gray-800">{selecionado.contratoId}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Descrição</p>
                <p className="text-gray-800 whitespace-pre-wrap">{selecionado.descricao}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Aberto em</p>
                <p className="text-gray-600">{formatarData(selecionado.criadoEm)}</p>
              </div>
            </div>

            {/* Ações de status */}
            {selecionado.status !== "fechado" && (
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Atualizar status</p>
                <div className="flex gap-2">
                  {selecionado.status === "aberto" && (
                    <button
                      onClick={() => mudarStatus(selecionado.id, "em_atendimento")}
                      disabled={atualizando}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-white bg-[#7b8cd4] rounded-xl hover:bg-[#6677be] disabled:opacity-50 transition-colors"
                    >
                      <Clock size={14} /> Assumir atendimento
                    </button>
                  )}
                  <button
                    onClick={() => mudarStatus(selecionado.id, "fechado")}
                    disabled={atualizando}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle size={14} /> Fechar chamado
                  </button>
                </div>
              </div>
            )}

            {selecionado.status === "fechado" && (
              <div className="flex items-center justify-center gap-2 text-green-600 py-2">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Chamado encerrado</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
