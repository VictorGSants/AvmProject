import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

// Exibe o intervalo da semana atual (ex: "28 abr – 04 mai 2026")
// e botões para navegar entre semanas.
export default function NavegacaoSemana({ semanaBase, onAnterior, onProxima, onHoje }) {
  function formatarIntervalo(base) {
    const inicio = new Date(base);
    const fim = new Date(base);
    fim.setDate(fim.getDate() + 6);

    const opcoes = { day: "2-digit", month: "short" };
    const ano = fim.getFullYear();
    return `${inicio.toLocaleDateString("pt-BR", opcoes)} – ${fim.toLocaleDateString("pt-BR", opcoes)} ${ano}`;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onAnterior}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        title="Semana anterior"
      >
        <ChevronLeft size={18} />
      </button>

      <span className="text-sm font-medium text-gray-700 min-w-[210px] text-center">
        {formatarIntervalo(semanaBase)}
      </span>

      <button
        onClick={onProxima}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        title="Próxima semana"
      >
        <ChevronRight size={18} />
      </button>

      <button
        onClick={onHoje}
        className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
      >
        <CalendarDays size={16} />
        Hoje
      </button>
    </div>
  );
}
