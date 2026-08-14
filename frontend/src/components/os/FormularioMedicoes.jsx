import { useEffect, useRef, useState, useCallback } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { camposParaTipo } from "../../config/medicoesConfig";
import { buscarOS } from "../../services/os/osService";
import { salvarMedicoes, criarNaoConformidade, listarNaoConformidades } from "../../services/os/medicaoService";

const AUTOSAVE_MS = 2000;

function foraDaFaixa(campo, valor) {
  if (campo.tipo === "conforme") return valor === "nao_conforme";
  if (campo.tipo === "numero" && (campo.faixaMin != null || campo.faixaMax != null)) {
    const n = parseFloat(valor);
    if (Number.isNaN(n)) return false;
    if (campo.faixaMin != null && n < campo.faixaMin) return true;
    if (campo.faixaMax != null && n > campo.faixaMax) return true;
  }
  return false;
}

function preenchido(valor) {
  return valor !== undefined && valor !== null && String(valor).trim() !== "";
}

export default function FormularioMedicoes({
  empresaId, osId, tipoServico, equipamentoId, autorId, autorNome,
  onValidoChange,
}) {
  const campos = camposParaTipo(tipoServico);
  const [valores, setValores] = useState({});
  const [justificativas, setJustificativas] = useState({});
  const [naoConformidadesSalvas, setNaoConformidadesSalvas] = useState(new Set());
  const [carregando, setCarregando] = useState(true);
  const autosaveRef = useRef(null);

  useEffect(() => {
    if (campos.length === 0) { setCarregando(false); return; }
    Promise.all([buscarOS(empresaId, osId), listarNaoConformidades(empresaId, osId)])
      .then(([os, naoConformidades]) => {
        setValores(os?.medicoes || {});
        setNaoConformidadesSalvas(new Set(naoConformidades.map(nc => nc.campo)));
      })
      .finally(() => setCarregando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId, osId]);

  useEffect(() => () => clearTimeout(autosaveRef.current), []);

  const validar = useCallback(() => {
    for (const campo of campos) {
      if (campo.obrigatorio && !preenchido(valores[campo.chave])) return false;
      if (foraDaFaixa(campo, valores[campo.chave]) && !naoConformidadesSalvas.has(campo.chave)) return false;
    }
    return true;
  }, [campos, valores, naoConformidadesSalvas]);

  useEffect(() => {
    if (!carregando) onValidoChange?.(validar());
  }, [carregando, validar, onValidoChange]);

  function atualizarValor(chave, valor) {
    const novosValores = { ...valores, [chave]: valor };
    setValores(novosValores);
    clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => {
      salvarMedicoes(empresaId, osId, novosValores).catch(err => console.warn("Autosave medições falhou:", err.message));
    }, AUTOSAVE_MS);
  }

  async function salvarJustificativa(campo) {
    const texto = (justificativas[campo.chave] || "").trim();
    if (texto.length < 5) return;
    await criarNaoConformidade(empresaId, osId, {
      campo: campo.chave,
      rotulo: campo.rotulo,
      valor: valores[campo.chave],
      unidade: campo.unidade,
      faixaEsperada: campo.faixaMin != null || campo.faixaMax != null
        ? `${campo.faixaMin ?? "—"} a ${campo.faixaMax ?? "—"} ${campo.unidade}`
        : "",
      justificativa: texto,
      autorId, autorNome, equipamentoId,
    });
    setNaoConformidadesSalvas(prev => new Set(prev).add(campo.chave));
  }

  if (campos.length === 0) return null;

  if (carregando) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 size={20} className="animate-spin text-[#7b8cd4]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
        Medições técnicas
      </p>

      {campos.map(campo => {
        const flagado = foraDaFaixa(campo, valores[campo.chave]);
        const jaJustificado = naoConformidadesSalvas.has(campo.chave);

        return (
          <div key={campo.chave}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {campo.rotulo} {campo.obrigatorio && <span className="text-red-500">*</span>}
              {campo.unidade && <span className="text-gray-400 font-normal"> ({campo.unidade})</span>}
            </label>

            {campo.tipo === "conforme" ? (
              <div className="grid grid-cols-2 gap-2">
                {[["conforme", "Conforme"], ["nao_conforme", "Não conforme"]].map(([valor, rotulo]) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => atualizarValor(campo.chave, valor)}
                    className={`py-2 rounded-xl text-sm font-semibold border transition-all active:scale-95 ${
                      valores[campo.chave] === valor
                        ? valor === "nao_conforme"
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-[#1a1a2e] text-white border-[#1a1a2e]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-[#7b8cd4]"
                    }`}
                  >
                    {rotulo}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type={campo.tipo === "numero" ? "number" : "text"}
                step={campo.tipo === "numero" ? "any" : undefined}
                value={valores[campo.chave] ?? ""}
                onChange={e => atualizarValor(campo.chave, e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  flagado ? "border-amber-300 focus:ring-amber-300" : "border-gray-300 focus:ring-[#7b8cd4]"
                }`}
              />
            )}

            {campo.tipo === "numero" && (campo.faixaMin != null || campo.faixaMax != null) && (
              <p className="text-[11px] text-gray-400 mt-1">
                Faixa esperada: {campo.faixaMin ?? "—"} a {campo.faixaMax ?? "—"} {campo.unidade}
              </p>
            )}

            {flagado && !jaJustificado && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                  <AlertTriangle size={13} /> Fora do esperado — justifique a não conformidade
                </p>
                <textarea
                  value={justificativas[campo.chave] || ""}
                  onChange={e => setJustificativas(prev => ({ ...prev, [campo.chave]: e.target.value }))}
                  onBlur={() => salvarJustificativa(campo)}
                  rows={2}
                  placeholder="Explique o motivo do valor fora da faixa..."
                  className="w-full border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
                />
              </div>
            )}

            {flagado && jaJustificado && (
              <p className="flex items-center gap-1.5 text-[11px] text-amber-600 mt-1">
                <AlertTriangle size={11} /> Registrado como não conformidade
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
