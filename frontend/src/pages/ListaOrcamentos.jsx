import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Search, FileText, ChevronRight, Trash2 } from "lucide-react";
import Header from "../components/Header";
import {
  listarOrcamentos, excluirOrcamento,
  corStatus, labelStatus, fmtBRL, STATUS,
} from "../services/orcamentoService";
import { EMPRESAID } from "../config/empresa";
import { toast } from "sonner";

export default function ListaOrcamentos() {
  const navigate = useNavigate();
  const { empresaId } = useParams();
  const eId = empresaId || EMPRESAID;

  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [busca, setBusca]           = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  useEffect(() => {
    carregar();
  }, [eId]);

  async function carregar() {
    setLoading(true);
    try {
      const dados = await listarOrcamentos(eId);
      setOrcamentos(dados);
    } catch (e) {
      toast.error("Erro ao carregar orçamentos");
    } finally {
      setLoading(false);
    }
  }

  async function handleExcluir(e, id) {
    e.stopPropagation();
    if (!confirm("Excluir este orçamento?")) return;
    try {
      await excluirOrcamento(eId, id);
      setOrcamentos((prev) => prev.filter((o) => o.id !== id));
      toast.success("Orçamento excluído");
    } catch {
      toast.error("Erro ao excluir");
    }
  }

  const filtrados = orcamentos.filter((o) => {
    const matchBusca =
      !busca ||
      o.clienteNome?.toLowerCase().includes(busca.toLowerCase()) ||
      o.numero?.includes(busca) ||
      o.servicoNome?.toLowerCase().includes(busca.toLowerCase());
    const matchStatus =
      filtroStatus === "todos" || o.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Orçamentos" />

      <main className="flex-grow p-4 max-w-2xl mx-auto w-full">
        {/* Busca + Novo */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, nº ou serviço..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]"
            />
          </div>
          <button
            onClick={() => navigate(`/gestor/${eId}/orcamentos/novo`)}
            className="flex items-center gap-1.5 bg-[#1a5ea8] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1650920] active:scale-95 transition-all"
          >
            <Plus size={16} /> Novo
          </button>
        </div>

        {/* Filtro por status */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {["todos", ...Object.values(STATUS)].map((s) => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filtroStatus === s
                  ? "bg-[#1a5ea8] text-white"
                  : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              {s === "todos" ? "Todos" : labelStatus(s)}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">Nenhum orçamento encontrado</p>
            <button
              onClick={() => navigate(`/gestor/${eId}/orcamentos/novo`)}
              className="mt-4 text-[#1a5ea8] text-sm font-semibold"
            >
              Criar primeiro orçamento →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.map((o) => (
              <div
                key={o.id}
                onClick={() => navigate(`/gestor/${eId}/orcamentos/${o.id}`)}
                className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">{o.numero}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${corStatus(o.status)}`}>
                        {labelStatus(o.status)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate">{o.clienteNome}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{o.servicoNome}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-gray-800">
                      {fmtBRL(o.calculo?.totalGeral ?? o.precoFinal ?? 0)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => handleExcluir(e, o.id)}
                        className="p-1.5 text-gray-300 hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                      <ChevronRight size={16} className="text-gray-300 mt-1" />
                    </div>
                  </div>
                </div>
                {o.criadoEm && (
                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(o.criadoEm.seconds * 1000).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
