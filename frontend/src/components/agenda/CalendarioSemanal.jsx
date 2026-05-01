import { useState, useEffect } from "react";
import EventoCard from "./EventoCard";

const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function mesmaData(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Nenhuma lógica de negócio aqui — apenas apresentação.
// Adapta-se automaticamente entre grade (desktop) e lista com seletor de dia (mobile).
export default function CalendarioSemanal({ agendamentos, tecnicos, semanaBase, tecnicoFiltrado, onClickEvento }) {
  const hoje = new Date();

  const dias = Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(semanaBase);
    dia.setDate(dia.getDate() + i);
    return dia;
  });

  // Índice do dia selecionado na visão mobile.
  // Quando a semana muda, reseta para o dia de hoje (se estiver na semana) ou para segunda.
  const [diaSelecionado, setDiaSelecionado] = useState(() => {
    const idx = dias.findIndex(d => mesmaData(d, hoje));
    return idx >= 0 ? idx : 0;
  });

  useEffect(() => {
    const idx = dias.findIndex(d => mesmaData(d, new Date()));
    setDiaSelecionado(idx >= 0 ? idx : 0);
    // semanaBase é a dependência real — dias é derivado dela
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semanaBase]);

  function eventosNoDia(dia) {
    return agendamentos.filter(a => {
      if (!mesmaData(a.inicio.toDate(), dia)) return false;
      if (tecnicoFiltrado && tecnicoFiltrado !== "todos") {
        return a.tecnicos?.includes(tecnicoFiltrado);
      }
      return true;
    });
  }

  function nomesTecnicos(evento) {
    return (
      evento.tecnicos
        ?.map(id => tecnicos.find(t => t.id === id)?.nome)
        .filter(Boolean)
        .join(", ") ?? ""
    );
  }

  return (
    <>
      {/* ============ VISÃO MOBILE (< md) ============ */}
      <div className="md:hidden">

        {/* Strip de seleção de dia */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dias.map((dia, idx) => {
            const isHoje = mesmaData(dia, hoje);
            const isSelecionado = idx === diaSelecionado;
            const temEventos = eventosNoDia(dia).length > 0;

            return (
              <button
                key={idx}
                onClick={() => setDiaSelecionado(idx)}
                className={`flex flex-col items-center py-2 rounded-xl transition-all active:scale-95 ${
                  isSelecionado
                    ? "bg-[#1a1a2e] text-white shadow-md"
                    : isHoje
                    ? "bg-[#7b8cd4] text-white"
                    : "bg-white text-gray-600 border border-gray-100"
                }`}
              >
                <span className="text-[10px] font-bold">{DIAS_SEMANA[idx]}</span>
                <span className="text-base font-extrabold leading-tight">{dia.getDate()}</span>
                {/* Ponto indicando eventos no dia */}
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 transition-opacity ${
                  temEventos ? "bg-[#7b8cd4] opacity-100" : "opacity-0"
                } ${isSelecionado ? "bg-white" : ""}`} />
              </button>
            );
          })}
        </div>

        {/* Lista de eventos do dia selecionado */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 capitalize">
          {dias[diaSelecionado]?.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
        </p>

        {eventosNoDia(dias[diaSelecionado]).length === 0 ? (
          <div className="text-center py-14">
            <p className="text-sm text-gray-300">Nenhum agendamento neste dia</p>
          </div>
        ) : (
          eventosNoDia(dias[diaSelecionado]).map(evento => (
            <EventoCard
              key={evento.id}
              evento={evento}
              nomeTecnico={nomesTecnicos(evento)}
              onClickEvento={onClickEvento}
            />
          ))
        )}
      </div>

      {/* ============ VISÃO DESKTOP (>= md) ============ */}
      <div className="hidden md:grid grid-cols-7 gap-2 min-w-[700px]">
        {dias.map((dia, idx) => {
          const isHoje = mesmaData(dia, hoje);
          const eventos = eventosNoDia(dia);

          return (
            <div key={idx} className="flex flex-col">
              {/* Cabeçalho da coluna */}
              <div className={`text-center mb-2 py-2 rounded-xl ${isHoje ? "bg-[#1a1a2e] text-white" : "bg-gray-100 text-gray-600"}`}>
                <p className="text-xs font-bold">{DIAS_SEMANA[idx]}</p>
                <p className={`text-lg font-extrabold ${isHoje ? "text-white" : "text-gray-800"}`}>{dia.getDate()}</p>
                <p className={`text-[10px] ${isHoje ? "text-gray-400" : "text-gray-400"}`}>
                  {dia.toLocaleDateString("pt-BR", { month: "short" })}
                </p>
              </div>

              {/* Eventos */}
              <div className="flex-1 min-h-[120px]">
                {eventos.length === 0 ? (
                  <div className="h-full min-h-[80px] border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-xs text-gray-200">Livre</span>
                  </div>
                ) : (
                  eventos.map(evento => (
                    <EventoCard
                      key={evento.id}
                      evento={evento}
                      nomeTecnico={nomesTecnicos(evento)}
                      onClickEvento={onClickEvento}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
