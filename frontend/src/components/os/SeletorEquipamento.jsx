import { useEffect, useState } from "react";
import { Search, Wrench, Loader2, ChevronRight } from "lucide-react";
import { listarEquipamentos } from "../../services/equipamentoService";

export default function SeletorEquipamento({ contratoId, empresaId, onSelecionar, onPular, disabled = false }) {
  const [equipamentos, setEquipamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    let ativo = true;
    listarEquipamentos(contratoId, empresaId, null, true)
      .then(snapshot => {
        if (!ativo) return;
        setEquipamentos(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      })
      .catch(() => { if (ativo) setEquipamentos([]); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [contratoId, empresaId]);

  const filtrados = equipamentos.filter(eq =>
    !busca.trim() ||
    [eq.nome, eq.codigo, eq.local, eq.bloco].filter(Boolean).some(campo =>
      campo.toLowerCase().includes(busca.trim().toLowerCase())
    )
  );

  if (carregando) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 size={24} className="animate-spin text-[#7b8cd4]" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Qual equipamento você vai atender?
      </p>

      {equipamentos.length > 3 && (
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, código, local..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]"
          />
        </div>
      )}

      {filtrados.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Wrench size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhum equipamento encontrado.</p>
        </div>
      )}

      <div className="space-y-2 max-h-[45vh] overflow-y-auto">
        {filtrados.map(eq => (
          <button
            key={eq.id}
            onClick={() => onSelecionar(eq)}
            disabled={disabled}
            className="w-full flex items-center justify-between gap-2 bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.99] text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#f0f2ff] text-[#7b8cd4] flex items-center justify-center flex-shrink-0">
                <Wrench size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{eq.nome || eq.codigo || "Equipamento"}</p>
                <p className="text-xs text-gray-400 truncate">
                  {[eq.local, eq.bloco].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
          </button>
        ))}
      </div>

      <button
        onClick={onPular}
        disabled={disabled}
        className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
      >
        Continuar sem equipamento
      </button>
    </div>
  );
}
