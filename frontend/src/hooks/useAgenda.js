import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Timestamp } from "firebase/firestore";
import { getWeekAppointments } from "../services/agenda/getWeekAppointments";
import { getTecnicos } from "../services/tecService";
import { contracts as getContratos } from "../services/contracts/contractsService";
import { createAppointment } from "../services/agenda/createAppointment";
import { deleteAppointment } from "../services/agenda/deleteAppointment";
import { updateAppointment } from "../services/agenda/updateAppointment";
import { temConflito } from "../services/agenda/checkConflict";
import { getStartOfWeek } from "../services/agenda/weekRange";

// Centraliza toda a lógica da agenda: carregamento, navegação de semana,
// criação, atualização e exclusão de agendamentos com validação de conflito.
// A página Agenda.jsx não precisa saber nada sobre Firebase — só usa este hook.
export function useAgenda() {
  const { empresaId } = useParams();

  // Técnico só vê os agendamentos em que está escalado.
  // Gestor/patrão passa null e recebe tudo.
  const tipoUsuario = localStorage.getItem("tipoUsuario");
  const tecnicoId   = tipoUsuario === "tecnico"
    ? localStorage.getItem("usuarioId")
    : null;

  const [agendamentos, setAgendamentos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [contratos, setContratos] = useState([]);
  // semanaBase sempre aponta para a segunda-feira da semana exibida
  const [semanaBase, setSemanaBase] = useState(() => getStartOfWeek());
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // useCallback garante que carregarDados não mude de referência desnecessariamente,
  // evitando loops infinitos no useEffect que depende dela
  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [agendamentosData, tecnicosData, contratosData] = await Promise.all([
        getWeekAppointments(empresaId, semanaBase, tecnicoId),
        getTecnicos(empresaId),
        getContratos(empresaId),
      ]);
      setAgendamentos(agendamentosData);
      setTecnicos(tecnicosData);
      setContratos(contratosData);
    } catch (e) {
      console.error("[useAgenda] Erro ao carregar dados:", e);
      setErro("Erro ao carregar dados da agenda. Verifique sua conexão.");
    } finally {
      setCarregando(false);
    }
  }, [empresaId, semanaBase]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  function semanaAnterior() {
    setSemanaBase(prev => {
      const nova = new Date(prev);
      nova.setDate(nova.getDate() - 7);
      return nova;
    });
  }

  function proximaSemana() {
    setSemanaBase(prev => {
      const nova = new Date(prev);
      nova.setDate(nova.getDate() + 7);
      return nova;
    });
  }

  function irParaHoje() {
    setSemanaBase(getStartOfWeek());
  }

  // Verifica conflito de horário para cada técnico selecionado antes de salvar
  async function criarAgendamento(dados) {
    for (const tecId of dados.tecnicos) {
      const eventosDoTecnico = agendamentos.filter(a => a.tecnicos?.includes(tecId));

      if (temConflito({ inicio: dados.inicio, fim: dados.fim }, eventosDoTecnico)) {
        const tec = tecnicos.find(t => t.id === tecId);
        throw new Error(`Conflito de horário para o técnico ${tec?.nome ?? tecId}.`);
      }
    }

    await createAppointment(empresaId, dados);
    await carregarDados();
  }

  // Atualiza campos de um agendamento (ex: status, assinatura) com atualização otimista:
  // reflete a mudança localmente de imediato sem esperar o servidor, para UX mais fluida
  async function atualizarAgendamento(agendamentoId, dados) {
    await updateAppointment(empresaId, agendamentoId, dados);
    setAgendamentos(prev =>
      prev.map(a => a.id === agendamentoId ? { ...a, ...dados } : a)
    );
  }

  // Edita os dados principais de um agendamento com validação de conflito.
  // Exclui o próprio agendamento da checagem para não conflitar consigo mesmo.
  async function editarAgendamento(agendamentoId, dados) {
    const outros = agendamentos.filter(a => a.id !== agendamentoId);
    for (const tecId of dados.tecnicos) {
      const eventosDoTecnico = outros.filter(a => a.tecnicos?.includes(tecId));
      if (temConflito({ inicio: dados.inicio, fim: dados.fim }, eventosDoTecnico)) {
        const tec = tecnicos.find(t => t.id === tecId);
        throw new Error(`Conflito de horário para o técnico ${tec?.nome ?? tecId}.`);
      }
    }
    await updateAppointment(empresaId, agendamentoId, dados);
    // Converte Date → Timestamp para manter o formato esperado pelos componentes
    const dadosNormalizados = {
      ...dados,
      inicio: Timestamp.fromDate(dados.inicio),
      fim:    Timestamp.fromDate(dados.fim),
    };
    setAgendamentos(prev =>
      prev.map(a => a.id === agendamentoId ? { ...a, ...dadosNormalizados } : a)
    );
  }

  async function excluirAgendamento(agendamentoId) {
    await deleteAppointment(empresaId, agendamentoId);
    // Atualização otimista: remove do estado local sem rebuscar o servidor
    setAgendamentos(prev => prev.filter(a => a.id !== agendamentoId));
  }

  return {
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
    editarAgendamento,
    excluirAgendamento,
  };
}
