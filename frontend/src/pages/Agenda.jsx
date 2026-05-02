import { useState } from "react";
import { useAgenda } from "../hooks/useAgenda";
import Header from "../components/Header";
import NavegacaoSemana from "../components/agenda/NavegacaoSemana";
import CalendarioSemanal from "../components/agenda/CalendarioSemanal";
import FormNovoAgendamento from "../components/agenda/FormNovoAgendamento";
import DetalheAgendamento from "../components/agenda/DetalheAgendamento";
import { Plus, Filter } from "lucide-react";

// Página principal da agenda. Não contém lógica de negócio —
// delega tudo ao hook useAgenda e compõe os sub-componentes.
export default function Agenda() {
  const {
    agendamentos,
    tecnicos,
    contratos,
    semanaBase,
    carregando,
    erro,
    semanaAnterior,
    proximaSemana,
    irParaHoje,
    criarAgendamento,
    atualizarAgendamento,
    excluirAgendamento,
  } = useAgenda();

  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [tecnicoFiltrado, setTecnicoFiltrado] = useState("todos");

  // Guarda apenas o ID do evento selecionado. O objeto completo é derivado
  // de `agendamentos` para que atualizações otimistas do hook reflitam no modal.
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState(null);
  const eventoSelecionado = eventoSelecionadoId
    ? agendamentos.find(a => a.id === eventoSelecionadoId) ?? null
    : null;

  const tipoUsuario = localStorage.getItem("tipoUsuario");
  const podeAgendar = tipoUsuario === "gestor" || tipoUsuario === "patrao";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="p-4 md:p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Agenda de Técnicos</h1>

        {/* Barra de controles: navegação + filtro + botão novo */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <NavegacaoSemana
            semanaBase={semanaBase}
            onAnterior={semanaAnterior}
            onProxima={proximaSemana}
            onHoje={irParaHoje}
          />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={tecnicoFiltrado}
                onChange={e => setTecnicoFiltrado(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]"
              >
                <option value="todos">Todos os técnicos</option>
                {tecnicos.map(tec => (
                  <option key={tec.id} value={tec.id}>{tec.nome}</option>
                ))}
              </select>
            </div>

            {/* Só o gestor/patrão pode criar agendamentos */}
            {podeAgendar && (
              <button
                onClick={() => setModalNovoAberto(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#7b8cd4] text-white text-sm font-semibold rounded-lg hover:bg-[#6677be] transition-colors shadow-sm"
              >
                <Plus size={16} />
                Novo Agendamento
              </button>
            )}
          </div>
        </div>

        {carregando && (
          <div className="text-center py-16 text-gray-400 text-sm">
            Carregando agenda...
          </div>
        )}

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-lg mb-4">
            {erro}
          </div>
        )}

        {/* overflow-x-auto permite scroll horizontal apenas na visão desktop */}
        {!carregando && !erro && (
          <div className="overflow-x-auto">
            <CalendarioSemanal
              agendamentos={agendamentos}
              tecnicos={tecnicos}
              semanaBase={semanaBase}
              tecnicoFiltrado={tecnicoFiltrado}
              onClickEvento={evento => setEventoSelecionadoId(evento.id)}
            />
          </div>
        )}
      </main>

      {/* Modal: criar novo agendamento */}
      <FormNovoAgendamento
        aberto={modalNovoAberto}
        onFechar={() => setModalNovoAberto(false)}
        onSalvar={criarAgendamento}
        tecnicos={tecnicos}
        contratos={contratos}
      />

      {/* Modal: detalhes do agendamento clicado
          eventoSelecionado é derivado de agendamentos, então reflete
          mudanças de status em tempo real sem fechar/reabrir o modal */}
      <DetalheAgendamento
        aberto={eventoSelecionadoId !== null}
        evento={eventoSelecionado}
        tecnicos={tecnicos}
        onFechar={() => setEventoSelecionadoId(null)}
        onAtualizar={atualizarAgendamento}
        onExcluir={excluirAgendamento}
      />
    </div>
  );
}
