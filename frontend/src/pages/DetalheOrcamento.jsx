import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileDown, CheckCircle, XCircle, Send, Trash2, Pencil } from "lucide-react";
import Header from "../components/Header";
import {
  obterOrcamento, atualizarStatus, excluirOrcamento,
  corStatus, labelStatus, fmtBRL, STATUS,
} from "../services/orcamentoService";
import { gerarPdfOrcamento } from "../services/orcamentoPdf";
import { EMPRESAID } from "../config/empresa";
import { toast } from "sonner";

export default function DetalheOrcamento() {
  const navigate = useNavigate();
  const { empresaId, orcamentoId } = useParams();
  const eId = empresaId || EMPRESAID;

  const [orc, setOrc]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obterOrcamento(eId, orcamentoId)
      .then(setOrc)
      .catch(() => toast.error("Orçamento não encontrado"))
      .finally(() => setLoading(false));
  }, [eId, orcamentoId]);

  async function handleStatus(novoStatus) {
    try {
      await atualizarStatus(eId, orcamentoId, novoStatus);
      setOrc((prev) => ({ ...prev, status: novoStatus }));
      toast.success(`Status atualizado: ${labelStatus(novoStatus)}`);
    } catch {
      toast.error("Erro ao atualizar status");
    }
  }

  async function handleExcluir() {
    if (!confirm("Excluir este orçamento permanentemente?")) return;
    try {
      await excluirOrcamento(eId, orcamentoId);
      toast.success("Orçamento excluído");
      navigate(`/gestor/${eId}/orcamentos`);
    } catch {
      toast.error("Erro ao excluir");
    }
  }

  function handlePdf() {
    if (!orc) return;
    gerarPdfOrcamento(orc);
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Orçamento" />
      <div className="flex-grow flex items-center justify-center text-gray-400 text-sm">
        Carregando...
      </div>
    </div>
  );

  if (!orc) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Orçamento" />
      <div className="flex-grow flex items-center justify-center text-gray-400 text-sm">
        Orçamento não encontrado.
      </div>
    </div>
  );

  const total = orc.calculo?.totalGeral ?? orc.precoFinal ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title={`Orçamento ${orc.numero}`} />

      <main className="flex-grow p-4 max-w-lg mx-auto w-full">

        {/* Card principal */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs font-mono text-gray-400">{orc.numero}</span>
              <h2 className="text-base font-bold text-gray-800 mt-0.5">{orc.clienteNome}</h2>
              <p className="text-sm text-gray-500">{orc.servicoNome}</p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${corStatus(orc.status)}`}>
              {labelStatus(orc.status)}
            </span>
          </div>

          {/* Detalhes das variáveis */}
          {orc.variaveis && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                ["Quantidade",    `${orc.variaveis.quantidade} unid.`],
                ["Tubulação",     `${orc.variaveis.tubulacao}m`],
                ["Dificuldade",   orc.variaveis.dificuldade],
              ].map(([label, val]) => (
                <div key={label} className="bg-slate-50 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
                  <p className="text-xs font-semibold text-gray-700 capitalize">{val}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tabela de valores */}
          {(orc.calculo?.totalEquipamentos || orc.calculo?.totalInstalacao) && (
            <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
              {orc.calculo.totalEquipamentos > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Equipamentos</span>
                  <span>{fmtBRL(orc.calculo.totalEquipamentos)}</span>
                </div>
              )}
              {orc.calculo.totalInstalacao > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Instalação / Mão de obra</span>
                  <span>{fmtBRL(orc.calculo.totalInstalacao)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-base">
                <span>Total Geral</span>
                <span className="text-green-700">{fmtBRL(total)}</span>
              </div>
            </div>
          )}

          {/* Processo */}
          {orc.processo && (
            <p className="text-xs text-gray-400 mt-3">Processo: {orc.processo}</p>
          )}

          {/* Data */}
          {orc.criadoEm && (
            <p className="text-xs text-gray-400 mt-1">
              Criado em {new Date(orc.criadoEm.seconds * 1000).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>

        {/* Observações */}
        {orc.observacoes && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-1">Observações</p>
            <p className="text-sm text-gray-700">{orc.observacoes}</p>
          </div>
        )}

        {/* Ações de status */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
            Atualizar status
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleStatus(STATUS.ENVIADO)}
              disabled={orc.status === STATUS.ENVIADO}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-blue-200 text-blue-700 text-xs font-semibold bg-blue-50 disabled:opacity-40"
            >
              <Send size={13} /> Enviado
            </button>
            <button
              onClick={() => handleStatus(STATUS.APROVADO)}
              disabled={orc.status === STATUS.APROVADO}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-green-200 text-green-700 text-xs font-semibold bg-green-50 disabled:opacity-40"
            >
              <CheckCircle size={13} /> Aprovado
            </button>
            <button
              onClick={() => handleStatus(STATUS.RECUSADO)}
              disabled={orc.status === STATUS.RECUSADO}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold bg-red-50 disabled:opacity-40 col-span-2"
            >
              <XCircle size={13} /> Recusado
            </button>
          </div>
        </div>

        {/* Ações principais */}
        <button
          onClick={handlePdf}
          className="w-full flex items-center justify-center gap-2 bg-[#1a5ea8] text-white py-3 rounded-xl text-sm font-semibold mb-2 active:scale-95 transition-all"
        >
          <FileDown size={16} />
          Baixar PDF do Orçamento
        </button>

        <button
          onClick={() => navigate(`/gestor/${eId}/orcamentos/${orcamentoId}/editar`)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-[#1a5ea8] border border-[#1a5ea8] bg-white mb-2 active:scale-95 transition-all"
        >
          <Pencil size={14} /> Editar orçamento
        </button>

        <button
          onClick={handleExcluir}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-red-500 border border-red-100 bg-white"
        >
          <Trash2 size={14} /> Excluir orçamento
        </button>

        <button
          onClick={() => navigate(`/gestor/${eId}/orcamentos`)}
          className="w-full text-sm text-gray-400 py-3 mt-1"
        >
          ← Voltar para a lista
        </button>
      </main>
    </div>
  );
}
