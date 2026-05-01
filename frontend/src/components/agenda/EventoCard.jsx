import { Clock, ChevronRight } from "lucide-react";

const ESTILOS_STATUS = {
  agendado:     { borda: "border-l-blue-400",  fundo: "bg-blue-50",        badge: "bg-blue-100 text-blue-700",    label: "Agendado" },
  em_andamento: { borda: "border-l-amber-400", fundo: "bg-amber-50",       badge: "bg-amber-100 text-amber-700",  label: "Em andamento" },
  concluido:    { borda: "border-l-green-400", fundo: "bg-green-50",       badge: "bg-green-100 text-green-700",  label: "Concluído" },
  cancelado:    { borda: "border-l-red-400",   fundo: "bg-red-50 opacity-60", badge: "bg-red-100 text-red-700",  label: "Cancelado" },
};

function formatarHora(ts) {
  return ts.toDate().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// Card clicável — abre o modal de detalhes ao tocar/clicar
export default function EventoCard({ evento, nomeTecnico, onClickEvento }) {
  const estilo = ESTILOS_STATUS[evento.status] ?? ESTILOS_STATUS.agendado;

  return (
    <div
      onClick={() => onClickEvento?.(evento)}
      className={`border-l-4 rounded-r-xl p-2.5 mb-2 cursor-pointer active:scale-95 transition-transform ${estilo.borda} ${estilo.fundo}`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate">{evento.tipo}</p>

          <div className="flex items-center gap-1 mt-1">
            <Clock size={10} className="text-gray-500 flex-shrink-0" />
            <span className="text-[11px] text-gray-600">
              {formatarHora(evento.inicio)} – {formatarHora(evento.fim)}
            </span>
          </div>

          {nomeTecnico && (
            <p className="text-[11px] text-gray-500 mt-0.5 truncate">{nomeTecnico}</p>
          )}

          {evento.clienteNome && (
            <p className="text-[11px] text-gray-500 truncate">{evento.clienteNome}</p>
          )}

          <span className={`inline-block mt-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${estilo.badge}`}>
            {estilo.label}
          </span>
        </div>

        <ChevronRight size={14} className="text-gray-300 flex-shrink-0 mt-1" />
      </div>
    </div>
  );
}
