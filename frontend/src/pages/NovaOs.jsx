import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Modal from "../components/Modal";
import { getOrdens, avaliarOS } from "../services/os/osService";
import {
  ClipboardList, User, MapPin, Wrench, Package,
  Car, Calendar, CheckCircle, ChevronRight, Loader2,
  Star, DollarSign, MessageSquare, TrendingUp, BadgeCheck, Users,
} from "lucide-react";

const LABEL_DESEMPENHO = ["", "Abaixo do esperado", "Regular", "Bom", "Muito bom", "Excelente"];
const COR_DESEMPENHO   = ["", "text-red-500", "text-orange-400", "text-yellow-500", "text-blue-500", "text-green-500"];
const PRESETS_COMISSAO = [5, 8, 10, 12, 15, 20];

function formatarData(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatarMoeda(valor) {
  if (!valor && valor !== 0) return "—";
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function iniciais(nome) {
  return (nome || "?").split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

// ── Estrelas interativas ───────────────────────────────────────────────────
function Estrelas({ valor, onChange, tamanho = 22, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          className="transition-transform active:scale-110 disabled:cursor-default"
        >
          <Star
            size={tamanho}
            className={`transition-colors ${
              n <= (hover || valor)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-200 fill-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Card de avaliação individual do técnico ────────────────────────────────
function CardAvaliacaoTecnico({ tec, idx, valorServico, onChange }) {
  const comissaoValor = valorServico > 0
    ? (valorServico * tec.comissaoPct) / 100
    : 0;

  return (
    <div className="border border-gray-200 rounded-2xl p-4 space-y-3 bg-white">
      {/* Cabeçalho do técnico */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#7b8cd4] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {iniciais(tec.nome)}
        </div>
        <p className="text-sm font-semibold text-gray-800">{tec.nome}</p>
      </div>

      {/* Desempenho */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5">Desempenho</p>
        <div className="flex items-center gap-3">
          <Estrelas
            valor={tec.desempenho}
            onChange={v => onChange(idx, "desempenho", v)}
            tamanho={26}
          />
          {tec.desempenho > 0 && (
            <span className={`text-xs font-semibold ${COR_DESEMPENHO[tec.desempenho]}`}>
              {LABEL_DESEMPENHO[tec.desempenho]}
            </span>
          )}
        </div>
      </div>

      {/* Comissão */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5">Comissão</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {PRESETS_COMISSAO.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => onChange(idx, "comissaoPct", p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                tec.comissaoPct === p
                  ? "bg-[#7b8cd4] text-white border-[#7b8cd4]"
                  : "bg-white text-gray-500 border-gray-300 hover:border-[#7b8cd4]"
              }`}
            >
              {p}%
            </button>
          ))}
          {/* Campo livre para valor fora dos presets */}
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={PRESETS_COMISSAO.includes(tec.comissaoPct) ? "" : tec.comissaoPct}
            onChange={e => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) onChange(idx, "comissaoPct", v);
            }}
            placeholder="outro%"
            className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#7b8cd4]"
          />
        </div>

        {/* Valor calculado */}
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          <span className="text-xs text-green-600 font-medium">
            {tec.comissaoPct}% de {formatarMoeda(valorServico || 0)}
          </span>
          <span className="text-sm font-bold text-green-700">
            {formatarMoeda(comissaoValor)}
          </span>
        </div>
      </div>

      {/* Observações */}
      <div>
        <p className="text-xs text-gray-500 mb-1">Observações (opcional)</p>
        <textarea
          value={tec.observacoes}
          onChange={e => onChange(idx, "observacoes", e.target.value)}
          rows={2}
          placeholder="Feedback, pontos de melhoria..."
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#7b8cd4] resize-none"
        />
      </div>
    </div>
  );
}

// ── Card da lista de OS ────────────────────────────────────────────────────
function OsCard({ os, onClick }) {
  const desempenhoMedio = os.avaliacoes?.length > 0
    ? Math.round(os.avaliacoes.reduce((s, a) => s + a.desempenho, 0) / os.avaliacoes.length)
    : 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="text-xs font-bold text-[#7b8cd4] bg-[#f0f2ff] px-2 py-0.5 rounded-full">
            {os.numero}
          </span>
          <p className="text-sm font-semibold text-gray-800 mt-1.5">{os.tipoServico || "Serviço"}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle size={14} />
            <span className="text-xs font-medium">Concluída</span>
          </div>
          {os.avaliada && (
            <div className="flex items-center gap-1 text-yellow-500">
              <BadgeCheck size={13} />
              <span className="text-[11px] font-semibold">Avaliada</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        {os.clienteNome && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={13} className="text-gray-400 flex-shrink-0" />
            {os.clienteNome}
          </div>
        )}
        {os.tecnicosNomes?.length > 1 && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Users size={12} className="text-gray-400 flex-shrink-0" />
            {os.tecnicosNomes.join(", ")}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar size={12} />
            {formatarData(os.dataServico)}
          </div>
          {os.avaliada && desempenhoMedio > 0 && (
            <Estrelas valor={desempenhoMedio} tamanho={12} readonly />
          )}
        </div>
        {os.avaliada && os.valorServico > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 font-semibold text-green-600">
              <DollarSign size={11} />
              {formatarMoeda(os.valorServico)}
            </span>
            {os.comissaoTotal > 0 && (
              <span className="text-gray-400">
                comissão: {formatarMoeda(os.comissaoTotal)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end mt-3">
        <ChevronRight size={16} className="text-gray-300" />
      </div>
    </div>
  );
}

// ── Linha de info no detalhe ───────────────────────────────────────────────
function InfoLinha({ Icone, label, children }) {
  return (
    <div className="flex gap-3">
      <Icone size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  );
}

// ── Modal detalhe + avaliação ──────────────────────────────────────────────
function OsDetalheModal({ os, aberto, onFechar, empresaId, eGestor, onAvaliar }) {
  const [etapa, setEtapa] = useState("detalhe");
  const [salvando, setSalvando] = useState(false);
  const [avForm, setAvForm] = useState({ valorServico: "", tecnicosAv: [] });

  useEffect(() => {
    if (aberto) setEtapa("detalhe");
  }, [aberto, os?.id]);

  if (!os) return null;

  function abrirAvaliacao() {
    // Monta lista de técnicos a partir dos campos salvos na OS
    const lista = (
      os.tecnicoIds?.length > 0
        ? os.tecnicoIds.map((id, i) => ({ id, nome: os.tecnicosNomes?.[i] || id }))
        : [{ id: "tec", nome: os.tecnicoNome || "Técnico" }]
    ).map(t => ({ ...t, desempenho: 0, comissaoPct: 10, observacoes: "" }));

    setAvForm({ valorServico: "", tecnicosAv: lista });
    setEtapa("avaliar");
  }

  function atualizarTecnico(idx, campo, valor) {
    setAvForm(prev => ({
      ...prev,
      tecnicosAv: prev.tecnicosAv.map((t, i) => i === idx ? { ...t, [campo]: valor } : t),
    }));
  }

  const valorNum     = parseFloat(avForm.valorServico) || 0;
  const comissaoTotal = avForm.tecnicosAv.reduce(
    (soma, t) => soma + (valorNum * t.comissaoPct) / 100, 0
  );

  async function salvarAvaliacao() {
    if (avForm.tecnicosAv.some(t => t.desempenho === 0)) {
      alert("Avalie o desempenho de todos os técnicos.");
      return;
    }
    if (!avForm.valorServico || valorNum <= 0) {
      alert("Informe o valor do serviço.");
      return;
    }

    setSalvando(true);
    try {
      const avaliacoes = avForm.tecnicosAv.map(t => ({
        tecnicoId:    t.id,
        tecnicoNome:  t.nome,
        desempenho:   t.desempenho,
        comissaoPct:  t.comissaoPct,
        comissaoValor: parseFloat(((valorNum * t.comissaoPct) / 100).toFixed(2)),
        observacoes:  t.observacoes,
      }));

      const payload = {
        valorServico:  valorNum,
        comissaoTotal: parseFloat(comissaoTotal.toFixed(2)),
        avaliacoes,
        avaliadoPor:   localStorage.getItem("uid") || "gestor",
      };

      await avaliarOS(empresaId, os.id, payload);
      onAvaliar(os.id, payload);
      setEtapa("detalhe");
    } catch (e) {
      alert("Erro ao salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      aberto={aberto}
      onClose={onFechar}
      titulo={etapa === "avaliar" ? `Avaliar · ${os.numero}` : os.numero}
    >
      <div className="max-h-[75vh] overflow-y-auto pr-1 space-y-4">

        {/* ── DETALHE ──────────────────────────────────────── */}
        {etapa === "detalhe" && (
          <>
            <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              <CheckCircle size={15} />
              <span className="text-sm font-semibold">Ordem de Serviço Concluída</span>
            </div>

            {/* Técnicos */}
            {os.tecnicosNomes?.length > 0 ? (
              <InfoLinha Icone={Users} label="Técnico(s)">
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {os.tecnicosNomes.map((nome, i) => (
                    <span key={i} className="flex items-center gap-1.5 bg-slate-100 rounded-full px-2.5 py-1">
                      <span className="w-4 h-4 rounded-full bg-[#7b8cd4] text-white text-[9px] font-bold flex items-center justify-center">
                        {iniciais(nome)}
                      </span>
                      <span className="text-xs text-gray-700">{nome}</span>
                    </span>
                  ))}
                </div>
              </InfoLinha>
            ) : (
              <InfoLinha Icone={User} label="Técnico">
                <p className="text-sm text-gray-700">{os.tecnicoNome || "—"}</p>
              </InfoLinha>
            )}

            <InfoLinha Icone={User} label="Cliente">
              <p className="text-sm text-gray-700">{os.clienteNome || "—"}</p>
            </InfoLinha>

            {os.endereco && (
              <InfoLinha Icone={MapPin} label="Endereço">
                <p className="text-sm text-gray-700">{os.endereco}</p>
              </InfoLinha>
            )}

            <InfoLinha Icone={ClipboardList} label="Tipo de serviço">
              <p className="text-sm text-gray-700">{os.tipoServico || "—"}</p>
            </InfoLinha>

            {os.descricaoAgendamento && (
              <InfoLinha Icone={ClipboardList} label="Observações do agendamento">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{os.descricaoAgendamento}</p>
              </InfoLinha>
            )}

            <InfoLinha Icone={Wrench} label="Serviço executado">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{os.servicoExecutado || "—"}</p>
            </InfoLinha>

            {os.materiaisUtilizados && (
              <InfoLinha Icone={Package} label="Materiais utilizados">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{os.materiaisUtilizados}</p>
              </InfoLinha>
            )}

            {os.veiculo && (
              <InfoLinha Icone={Car} label="Veículo">
                <p className="text-sm text-gray-700">{os.veiculo}</p>
              </InfoLinha>
            )}

            <InfoLinha Icone={Calendar} label="Data do serviço">
              <p className="text-sm text-gray-700">{formatarData(os.dataServico)}</p>
            </InfoLinha>

            {os.fotos?.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Fotos</p>
                <div className="flex flex-wrap gap-2">
                  {os.fotos.map((url, i) => (
                    <img key={i} src={url} alt={`Foto ${i + 1}`}
                      className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                  ))}
                </div>
              </div>
            )}

            {os.assinatura && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Assinatura</p>
                <img src={os.assinatura} alt="Assinatura"
                  className="w-full max-h-28 object-contain border border-gray-200 rounded-xl bg-gray-50" />
              </div>
            )}

            {/* Avaliações registradas */}
            {os.avaliada && os.avaliacoes?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Avaliação do gestor</p>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp size={13} />
                    <span className="text-xs font-bold">
                      Serviço: {formatarMoeda(os.valorServico)}
                    </span>
                  </div>
                </div>

                {os.avaliacoes.map((av, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#7b8cd4] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                        {iniciais(av.tecnicoNome)}
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{av.tecnicoNome}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Estrelas valor={av.desempenho} tamanho={16} readonly />
                      <span className={`text-xs font-semibold ${COR_DESEMPENHO[av.desempenho]}`}>
                        {LABEL_DESEMPENHO[av.desempenho]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-1.5">
                      <span className="text-xs text-green-600">{av.comissaoPct}% do serviço</span>
                      <span className="text-sm font-bold text-green-700">{formatarMoeda(av.comissaoValor)}</span>
                    </div>

                    {av.observacoes && (
                      <p className="text-xs text-gray-500 italic">"{av.observacoes}"</p>
                    )}
                  </div>
                ))}

                {os.avaliacoes.length > 1 && (
                  <div className="flex items-center justify-between bg-[#f0f2ff] border border-[#c5ccef] rounded-xl px-3 py-2">
                    <span className="text-xs font-semibold text-[#7b8cd4]">Total de comissões</span>
                    <span className="text-sm font-bold text-[#7b8cd4]">{formatarMoeda(os.comissaoTotal)}</span>
                  </div>
                )}

                <p className="text-[10px] text-gray-400">
                  Avaliado por {os.avaliadoPor} · {formatarData(os.avaliadoEm)}
                </p>
              </div>
            )}

            {eGestor && !os.avaliada && (
              <button
                onClick={abrirAvaliacao}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-[#7b8cd4] rounded-xl hover:bg-[#6677be] transition-colors"
              >
                <Star size={16} />
                Avaliar esta OS
              </button>
            )}
          </>
        )}

        {/* ── AVALIAÇÃO ────────────────────────────────────── */}
        {etapa === "avaliar" && (
          <div className="space-y-5">

            {/* Valor total do serviço */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Valor total do serviço (R$) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={avForm.valorServico}
                  onChange={e => setAvForm(p => ({ ...p, valorServico: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]"
                  autoFocus
                />
              </div>
            </div>

            {/* Um card por técnico */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">
                  Avaliação individual
                  {avForm.tecnicosAv.length > 1 && (
                    <span className="ml-1.5 text-xs font-normal text-gray-400">
                      ({avForm.tecnicosAv.length} técnicos)
                    </span>
                  )}
                </p>
              </div>

              {avForm.tecnicosAv.map((tec, idx) => (
                <CardAvaliacaoTecnico
                  key={tec.id}
                  tec={tec}
                  idx={idx}
                  valorServico={valorNum}
                  onChange={atualizarTecnico}
                />
              ))}
            </div>

            {/* Resumo total (só aparece com 2+ técnicos) */}
            {avForm.tecnicosAv.length > 1 && valorNum > 0 && (
              <div className="bg-[#f0f2ff] border border-[#c5ccef] rounded-2xl p-3 space-y-1">
                <p className="text-xs font-bold text-[#7b8cd4] uppercase tracking-wide mb-2">Resumo</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Valor do serviço</span>
                  <span className="font-semibold">{formatarMoeda(valorNum)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total de comissões</span>
                  <span className="font-semibold text-green-600">{formatarMoeda(comissaoTotal)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-[#c5ccef] pt-1 mt-1">
                  <span className="text-gray-600">Líquido empresa</span>
                  <span className="font-bold text-gray-800">{formatarMoeda(valorNum - comissaoTotal)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setEtapa("detalhe")}
                className="px-4 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvarAvaliacao}
                disabled={salvando}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-[#7b8cd4] rounded-xl hover:bg-[#6677be] disabled:opacity-50 transition-colors"
              >
                {salvando ? "Salvando..." : "Confirmar Avaliação"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── Página principal ───────────────────────────────────────────────────────
export default function VerOs() {
  const { empresaId } = useParams();
  const [ordens, setOrdens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [osSelecionada, setOsSelecionada] = useState(null);

  const tipoUsuario = localStorage.getItem("tipoUsuario");
  const eGestor = tipoUsuario === "gestor" || tipoUsuario === "patrao";

  useEffect(() => {
    if (!empresaId) return;
    getOrdens(empresaId)
      .then(setOrdens)
      .finally(() => setCarregando(false));
  }, [empresaId]);

  function handleAvaliar(osId, payload) {
    const atualizar = os => os.id === osId ? { ...os, avaliada: true, ...payload } : os;
    setOrdens(prev => prev.map(atualizar));
    setOsSelecionada(prev => prev?.id === osId ? atualizar(prev) : prev);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="p-4 md:p-6 max-w-xl mx-auto pb-10">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList size={22} className="text-[#7b8cd4]" />
          <h1 className="text-xl font-bold text-gray-800">Ordens de Serviço</h1>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          OS geradas automaticamente ao finalizar agendamentos.
        </p>

        {carregando && (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#7b8cd4]" />
          </div>
        )}

        {!carregando && ordens.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma OS gerada ainda.</p>
          </div>
        )}

        {!carregando && ordens.length > 0 && (
          <div className="space-y-3">
            {ordens.map(os => (
              <OsCard key={os.id} os={os} onClick={() => setOsSelecionada(os)} />
            ))}
          </div>
        )}
      </main>

      <OsDetalheModal
        os={osSelecionada}
        aberto={!!osSelecionada}
        onFechar={() => setOsSelecionada(null)}
        empresaId={empresaId}
        eGestor={eGestor}
        onAvaliar={handleAvaliar}
      />
    </div>
  );
}
