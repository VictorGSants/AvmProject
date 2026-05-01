import Header from "../components/Header";
import ItemChecklist from "../components/rotinas/ItemChecklist";
import { useRotinas, VEICULOS } from "../hooks/useRotinas";
import { RotateCcw, CheckSquare, ClipboardCheck, Car } from "lucide-react";

const COR_CATEGORIA = {
  EPIs:           "bg-red-100 text-red-700 border-red-200",
  Ferramentas:    "bg-orange-100 text-orange-700 border-orange-200",
  "Refrigeração": "bg-blue-100 text-blue-700 border-blue-200",
  Medição:        "bg-purple-100 text-purple-700 border-purple-200",
  Materiais:      "bg-yellow-100 text-yellow-700 border-yellow-200",
  Veículo:        "bg-slate-100 text-slate-700 border-slate-200",
};

const ICONE_VEICULO = {
  Kombi:   "🚐",
  Fiorino: "🚚",
  Strada:  "🛻",
  Celta:   "🚗",
};

export default function Rotinas() {
  const {
    checklist, categorias, marcados, veiculo, setVeiculo,
    total, totalMarcado, toggleItem, resetar,
  } = useRotinas();

  const porcentagem = total > 0 ? Math.round((totalMarcado / total) * 100) : 0;
  const tudoOk = total > 0 && totalMarcado === total;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="p-4 md:p-6 max-w-xl mx-auto pb-10">

        {/* Título */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={22} className="text-[#7b8cd4]" />
            <h1 className="text-xl font-bold text-gray-800">Rotina Diária</h1>
          </div>
          <button
            onClick={resetar}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RotateCcw size={13} />
            Reiniciar
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Confirme todos os itens antes de sair para o campo.
        </p>

        {/* Seletor de veículo */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Car size={16} className="text-[#7b8cd4]" />
            Veículo de hoje
          </p>
          <div className="grid grid-cols-2 gap-2">
            {VEICULOS.map(v => (
              <button
                key={v}
                onClick={() => setVeiculo(v)}
                className={`py-2.5 rounded-xl text-sm font-semibold border transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  veiculo === v
                    ? "bg-[#1a1a2e] text-white border-[#1a1a2e] shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#7b8cd4]"
                }`}
              >
                <span>{ICONE_VEICULO[v]}</span>
                {v}
              </button>
            ))}
          </div>
          {!veiculo && (
            <p className="text-xs text-amber-500 mt-2 text-center">
              Selecione o veículo para ver o checklist completo
            </p>
          )}
        </div>

        {/* Barra de progresso */}
        <div className="bg-white rounded-2xl p-4 mb-5 shadow-sm border border-gray-100">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">
              {totalMarcado} <span className="text-gray-400 font-normal">de {total} itens</span>
            </span>
            <span className={`font-bold ${tudoOk ? "text-green-600" : "text-[#7b8cd4]"}`}>
              {porcentagem}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                tudoOk ? "bg-green-500" : "bg-[#7b8cd4]"
              }`}
              style={{ width: `${porcentagem}%` }}
            />
          </div>
          {tudoOk && (
            <div className="flex items-center gap-2 mt-3 text-green-600">
              <CheckSquare size={16} />
              <span className="text-sm font-semibold">Tudo verificado! Bom trabalho.</span>
            </div>
          )}
        </div>

        {/* Categorias e itens */}
        <div className="space-y-5">
          {categorias.map(categoria => {
            const itens = checklist.filter(i => i.categoria === categoria);
            const marcadosNaCategoria = itens.filter(i => marcados.includes(i.id)).length;
            const completa = marcadosNaCategoria === itens.length;

            return (
              <div key={categoria}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    COR_CATEGORIA[categoria] ?? "bg-gray-100 text-gray-600 border-gray-200"
                  }`}>
                    {categoria}
                  </span>
                  <span className={`text-xs font-medium ${completa ? "text-green-500" : "text-gray-400"}`}>
                    {marcadosNaCategoria}/{itens.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {itens.map(item => (
                    <ItemChecklist
                      key={item.id}
                      item={item}
                      marcado={marcados.includes(item.id)}
                      onToggle={toggleItem}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
