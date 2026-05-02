import { useState } from "react";
import { useParams } from "react-router-dom";
import Modal from "../Modal";
import AssinaturaPad from "./AssinaturaPad";
import FotoUpload from "./FotoUpload";
import { createOS } from "../../services/os/osService";
import { getAppointment } from "../../services/agenda/getAppointment";
import {
  MapPin, Clock, User, FileText, CheckCircle,
  Play, Trash2, ChevronRight, Car, ArrowLeft,
} from "lucide-react";

const COR_STATUS = {
  agendado:     "bg-blue-100 text-blue-700",
  em_andamento: "bg-amber-100 text-amber-700",
  concluido:    "bg-green-100 text-green-700",
  cancelado:    "bg-red-100 text-red-700",
};
const LABEL_STATUS = {
  agendado:     "Agendado",
  em_andamento: "Em andamento",
  concluido:    "Concluído",
  cancelado:    "Cancelado",
};

function formatarData(ts) {
  return ts.toDate().toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}
function formatarHora(ts) {
  return ts.toDate().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function InfoLinha({ Icone, label, children }) {
  return (
    <div className="flex gap-3">
      <Icone size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  );
}

// Etapas do fluxo de finalização:
// "detalhes" → "formulario_os" → "assinatura" → fecha e cria OS
export default function DetalheAgendamento({ evento, tecnicos, aberto, onFechar, onAtualizar, onExcluir }) {
  const { empresaId } = useParams();
  const [etapa, setEtapa] = useState("detalhes");
  const [osForm, setOsForm] = useState({ servicoExecutado: "", materiaisUtilizados: "" });
  const [erroOs, setErroOs] = useState("");
  const [fotos, setFotos] = useState([]);
  const [salvando, setSalvando] = useState(false);

  const tipoUsuario = localStorage.getItem("tipoUsuario");
  const eTecnico  = tipoUsuario === "tecnico";
  const eGestor   = tipoUsuario === "gestor" || tipoUsuario === "patrao";

  if (!evento) return null;

  const nomeTecnicos =
    evento.tecnicos
      ?.map(id => tecnicos.find(t => t.id === id)?.nome)
      .filter(Boolean)
      .join(", ") ?? "—";

  // Sincroniza fotos locais com o que está no evento quando abre o modal
  const fotosEvento = evento.fotos ?? [];

  // ─── Ações ────────────────────────────────────────────────────────────
  async function iniciarServico() {
    setSalvando(true);
    try { await onAtualizar(evento.id, { status: "em_andamento", fotos: [] }); }
    finally { setSalvando(false); }
  }

  function avancarParaFormulario() {
    setOsForm({ servicoExecutado: "", materiaisUtilizados: "" });
    setErroOs("");
    setFotos(fotosEvento);
    setEtapa("formulario_os");
  }

  function avancarParaAssinatura() {
    if (!osForm.servicoExecutado.trim()) {
      setErroOs("Descreva o serviço executado antes de continuar.");
      return;
    }
    setErroOs("");
    setEtapa("assinatura");
  }

  async function finalizarComAssinatura(assinaturaBase64) {
    setSalvando(true);
    try {
      // Busca o estado atual no Firestore para evitar OS duplicada
      // caso outro técnico do mesmo agendamento já tenha finalizado
      const atual = await getAppointment(empresaId, evento.id);
      if (atual?.status === "concluido") {
        alert(`Este serviço já foi finalizado.\nOS gerada: ${atual.osNumero ?? ""}`);
        handleFechar();
        return;
      }

      const tecnicoNome = localStorage.getItem("uid") || "";

      // Monta lista completa de técnicos do agendamento para análise futura
      const tecnicosDoEvento = (evento.tecnicos || []).map(id => {
        const tec = tecnicos.find(t => t.id === id);
        return { id, nome: tec?.nome || "" };
      });

      // Gera a Ordem de Serviço no Firestore
      const { numero } = await createOS(empresaId, {
        agendamentoId:        evento.id,
        tecnicoNome,
        tecnicoIds:           tecnicosDoEvento.map(t => t.id),
        tecnicosNomes:        tecnicosDoEvento.map(t => t.nome),
        clienteNome:          evento.clienteNome,
        endereco:             evento.endereco,
        tipoServico:          evento.tipo,
        descricaoAgendamento: evento.descricao,
        servicoExecutado:     osForm.servicoExecutado,
        materiaisUtilizados:  osForm.materiaisUtilizados,
        veiculo:              evento.veiculo,
        fotos,
        assinatura:           assinaturaBase64,
        dataServico:          evento.inicio.toDate(),
      });

      // Atualiza o agendamento com status concluído + referência à OS
      await onAtualizar(evento.id, {
        status:     "concluido",
        assinatura: assinaturaBase64,
        fotos,
        osNumero:   numero,
      });

      handleFechar();
    } catch (e) {
      alert("Erro ao finalizar serviço: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function atualizarFotos(novasFotos) {
    setFotos(novasFotos);
    // Salva as fotos no agendamento em tempo real (segurança caso o app feche)
    await onAtualizar(evento.id, { fotos: novasFotos });
  }

  async function excluir() {
    if (!window.confirm("Excluir este agendamento?")) return;
    setSalvando(true);
    try { await onExcluir(evento.id); handleFechar(); }
    finally { setSalvando(false); }
  }

  function handleFechar() {
    setEtapa("detalhes");
    setOsForm({ servicoExecutado: "", materiaisUtilizados: "" });
    setErroOs("");
    onFechar();
  }

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <Modal aberto={aberto} onClose={handleFechar} titulo={
      etapa === "formulario_os" ? "Relatório do Serviço"
      : etapa === "assinatura"  ? "Coleta de Assinatura"
      : evento.tipo
    }>
      <div className="max-h-[75vh] overflow-y-auto pr-1 space-y-4">

        {/* ── ETAPA: DETALHES ─────────────────────────────── */}
        {etapa === "detalhes" && (
          <>
            {/* Status + excluir */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${COR_STATUS[evento.status] ?? COR_STATUS.agendado}`}>
                {LABEL_STATUS[evento.status] ?? evento.status}
              </span>
              {eGestor && evento.status !== "concluido" && (
                <button onClick={excluir} disabled={salvando}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50">
                  <Trash2 size={13} /> Excluir
                </button>
              )}
            </div>

            {/* OS gerada */}
            {evento.osNumero && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-xs font-semibold text-green-700">
                OS gerada: {evento.osNumero}
              </div>
            )}

            <InfoLinha Icone={Clock} label="Data e horário">
              <p className="text-sm text-gray-700 capitalize">{formatarData(evento.inicio)}</p>
              <p className="text-sm text-gray-500">{formatarHora(evento.inicio)} – {formatarHora(evento.fim)}</p>
            </InfoLinha>

            {evento.clienteNome && (
              <InfoLinha Icone={User} label="Cliente / Local">
                <p className="text-sm text-gray-700">{evento.clienteNome}</p>
              </InfoLinha>
            )}

            {evento.endereco && (
              <InfoLinha Icone={MapPin} label="Endereço">
                <p className="text-sm text-gray-700">{evento.endereco}</p>
              </InfoLinha>
            )}

            <InfoLinha Icone={User} label="Técnico(s)">
              <p className="text-sm text-gray-700">{nomeTecnicos}</p>
            </InfoLinha>

            {evento.veiculo && (
              <InfoLinha Icone={Car} label="Veículo">
                <p className="text-sm text-gray-700">{evento.veiculo}</p>
              </InfoLinha>
            )}

            {evento.descricao && (
              <InfoLinha Icone={FileText} label="Observações">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{evento.descricao}</p>
              </InfoLinha>
            )}

            {/* Fotos durante execução */}
            {eTecnico && evento.status === "em_andamento" && (
              <FotoUpload
                empresaId={empresaId}
                agendamentoId={evento.id}
                fotosIniciais={fotosEvento}
                onFotosChange={atualizarFotos}
              />
            )}

            {/* Fotos salvas (concluído) */}
            {evento.status === "concluido" && fotosEvento.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Fotos do serviço
                </p>
                <div className="flex flex-wrap gap-2">
                  {fotosEvento.map((url, i) => (
                    <img key={i} src={url} alt={`Foto ${i + 1}`}
                      className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                  ))}
                </div>
              </div>
            )}

            {/* Assinatura salva */}
            {evento.status === "concluido" && evento.assinatura && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Assinatura coletada
                </p>
                <img src={evento.assinatura} alt="Assinatura"
                  className="w-full max-h-28 object-contain border border-gray-200 rounded-xl bg-gray-50" />
              </div>
            )}

            {/* Ações do técnico */}
            {eTecnico && evento.status !== "concluido" && evento.status !== "cancelado" && (
              <div className="pt-1">
                {evento.status === "agendado" && (
                  <button onClick={iniciarServico} disabled={salvando}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-[#7b8cd4] rounded-xl hover:bg-[#6677be] disabled:opacity-50 transition-colors">
                    <Play size={16} />
                    {salvando ? "Atualizando..." : "Iniciar Serviço"}
                  </button>
                )}
                {evento.status === "em_andamento" && (
                  <button onClick={avancarParaFormulario}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors">
                    <CheckCircle size={16} />
                    Finalizar Serviço
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            )}

            {evento.status === "concluido" && (
              <div className="flex items-center justify-center gap-2 text-green-600 py-1">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Serviço concluído · {evento.osNumero ?? ""}</span>
              </div>
            )}
          </>
        )}

        {/* ── ETAPA: FORMULÁRIO DA OS ─────────────────────── */}
        {etapa === "formulario_os" && (
          <div className="space-y-4">
            {erroOs && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                {erroOs}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serviço executado <span className="text-red-500">*</span>
              </label>
              <textarea
                value={osForm.servicoExecutado}
                onChange={e => setOsForm(prev => ({ ...prev, servicoExecutado: e.target.value }))}
                rows={4}
                placeholder="Descreva o que foi feito: limpeza, carga de gás, substituição de peças..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b8cd4] resize-none"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Materiais utilizados
              </label>
              <textarea
                value={osForm.materiaisUtilizados}
                onChange={e => setOsForm(prev => ({ ...prev, materiaisUtilizados: e.target.value }))}
                rows={3}
                placeholder="Ex: 500g gás R-410A, 1 filtro secador, 2m fita isolante..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b8cd4] resize-none"
              />
            </div>

            {/* Fotos também ficam disponíveis aqui */}
            <FotoUpload
              empresaId={empresaId}
              agendamentoId={evento.id}
              fotosIniciais={fotos}
              onFotosChange={novasFotos => setFotos(novasFotos)}
            />

            <div className="flex gap-3 pt-1">
              <button onClick={() => setEtapa("detalhes")}
                className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ArrowLeft size={14} /> Voltar
              </button>
              <button onClick={avancarParaAssinatura}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-white bg-[#7b8cd4] rounded-lg hover:bg-[#6677be] transition-colors">
                Prosseguir para Assinatura <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── ETAPA: ASSINATURA ───────────────────────────── */}
        {etapa === "assinatura" && (
          <div className="space-y-3">
            <div className="bg-slate-50 rounded-xl p-3 text-sm text-gray-600 space-y-1">
              <p><span className="font-semibold">Cliente:</span> {evento.clienteNome || "—"}</p>
              <p><span className="font-semibold">Serviço:</span> {evento.tipo}</p>
            </div>

            <AssinaturaPad
              onConfirmar={finalizarComAssinatura}
              onCancelar={() => setEtapa("formulario_os")}
            />

            {salvando && (
              <p className="text-center text-sm text-gray-500 animate-pulse">
                Gerando OS e salvando...
              </p>
            )}
          </div>
        )}

      </div>
    </Modal>
  );
}
