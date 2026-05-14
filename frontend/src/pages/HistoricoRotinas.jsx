import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import { listarRotinas, excluirRotina } from "../services/rotinaService";
import { EPIS, FERRAMENTAS_POR_VEICULO } from "../hooks/useRotinas";
import { toast } from "sonner";
import { Car, Trash2, ChevronDown, ChevronUp, ClipboardCheck } from "lucide-react";

const ICONE_VEICULO = {
  Kombi: "🚐", Fiorino: "🚚", Strada: "🛻", Celta: "🚗",
};

function getNomeItem(id, veiculo) {
  const todos = [...EPIS, ...(FERRAMENTAS_POR_VEICULO[veiculo] || [])];
  return todos.find(i => i.id === id)?.item || id;
}

function fmtDataHora(ts) {
  if (!ts) return "—";
  const d = new Date(ts.seconds * 1000);
  return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function HistoricoRotinas() {
  const { empresaId } = useParams();
  const [rotinas, setRotinas]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [expandido, setExpandido]   = useState(null);
  const [filtroVeiculo, setFiltroVeiculo] = useState("");

  useEffect(() => {
    listarRotinas(empresaId)
      .then(setRotinas)
      .catch(() => toast.error("Erro ao carregar rotinas"))
      .finally(() => setLoading(false));
  }, [empresaId]);

  async function handleExcluir(id) {
    if (!confirm("Excluir este registro de rotina?")) return;
    try {
      await excluirRotina(empresaId, id);
      setRotinas(prev => prev.filter(r => r.id !== id));
      if (expandido === id) setExpandido(null);
      toast.success("Registro excluído");
    } catch {
      toast.error("Erro ao excluir registro");
    }
  }

  const filtradas = filtroVeiculo
    ? rotinas.filter(r => r.veiculo === filtroVeiculo)
    : rotinas;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Checklists de Veículos" />

      <main className="p-4 max-w-xl mx-auto pb-10">

        {/* Filtro por veículo */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {["", "Kombi", "Fiorino", "Strada", "Celta"].map(v => (
            <button
              key={v || "todos"}
              onClick={() => setFiltroVeiculo(v)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                filtroVeiculo === v
                  ? "bg-[#1a5ea8] text-white border-[#1a5ea8]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#7b8cd4]"
              }`}
            >
              {v ? `${ICONE_VEICULO[v]} ${v}` : "Todos"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-10 text-sm">Carregando...</p>
        ) : filtradas.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardCheck size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Nenhum checklist registrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtradas.map(rotina => {
              const porcentagem = rotina.totalItens > 0
                ? Math.round((rotina.totalMarcado / rotina.totalItens) * 100)
                : 0;
              const isOpen = expandido === rotina.id;

              return (
                <div key={rotina.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{ICONE_VEICULO[rotina.veiculo] || "🚗"}</span>
                          <span className="font-semibold text-gray-800 text-sm">{rotina.veiculo || "Veículo"}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                            rotina.completo
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {porcentagem}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 font-medium truncate">
                          {rotina.tecnicoNome || "Técnico"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {fmtDataHora(rotina.dataHora)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {rotina.totalMarcado} de {rotina.totalItens} itens verificados
                        </p>
                      </div>

                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <button
                          onClick={() => handleExcluir(rotina.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                          title="Excluir registro"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => setExpandido(isOpen ? null : rotina.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                          title={isOpen ? "Recolher" : "Ver itens"}
                        >
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Barra de progresso */}
                    <div className="mt-3 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          rotina.completo ? "bg-green-500" : "bg-[#7b8cd4]"
                        }`}
                        style={{ width: `${porcentagem}%` }}
                      />
                    </div>
                  </div>

                  {/* Itens verificados (expandido) */}
                  {isOpen && (
                    <div className="border-t border-gray-100 px-4 py-3 bg-slate-50">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Itens verificados
                      </p>
                      {rotina.itensMarcados?.length > 0 ? (
                        <div className="space-y-1.5">
                          {rotina.itensMarcados.map(id => (
                            <div key={id} className="flex items-center gap-2 text-xs text-gray-600">
                              <span className="text-green-500 flex-shrink-0">✓</span>
                              <span>{getNomeItem(id, rotina.veiculo)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">Nenhum item registrado.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
