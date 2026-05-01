import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import { listarEquipamentosPMOC } from "../services/pmocServices";
import { getContrato } from "../services/contracts/contractsService";
import { ClipboardList, Loader2, CheckCircle, AlertTriangle, XCircle, AirVent } from "lucide-react";

function statusEquipamento(eq) {
  if (!eq.proximaManutencao) return "pendente";
  const hoje = new Date();
  const prox = eq.proximaManutencao.toDate
    ? eq.proximaManutencao.toDate()
    : new Date(eq.proximaManutencao);
  if (prox < hoje) return "atrasado";
  if (prox.getMonth() === hoje.getMonth() && prox.getFullYear() === hoje.getFullYear())
    return "vence";
  return "ok";
}

function formatarData(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function StatCard({ label, valor, corFundo, corTexto, Icone }) {
  return (
    <div className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-1 ${corFundo}`}>
      <Icone size={20} className={corTexto} />
      <p className={`text-2xl font-extrabold ${corTexto}`}>{valor}</p>
      <p className={`text-xs font-semibold text-center ${corTexto} opacity-80`}>{label}</p>
    </div>
  );
}

export default function PmocCliente() {
  const { empresaId, contratoId } = useParams();
  const [equipamentos, setEquipamentos] = useState([]);
  const [contrato, setContrato] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!empresaId || !contratoId) return;
    Promise.all([
      listarEquipamentosPMOC(empresaId, contratoId),
      getContrato(empresaId, contratoId),
    ]).then(([equips, cont]) => {
      setEquipamentos(equips || []);
      setContrato(cont);
    }).finally(() => setCarregando(false));
  }, [empresaId, contratoId]);

  const total = equipamentos.length;
  const emDia = equipamentos.filter(e => statusEquipamento(e) === "ok").length;
  const fazEsseMes = equipamentos.filter(e => statusEquipamento(e) === "vence").length;
  const atrasados = equipamentos.filter(e => statusEquipamento(e) === "atrasado" || statusEquipamento(e) === "pendente").length;
  const porcentagem = total > 0 ? Math.round((emDia / total) * 100) : 0;

  const blocos = {};
  equipamentos.forEach(eq => {
    const bloco = eq.bloco || "SEM BLOCO";
    if (!blocos[bloco]) blocos[bloco] = [];
    blocos[bloco].push(eq);
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="p-4 md:p-6 max-w-4xl mx-auto pb-10">

        {/* Cabeçalho */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={22} className="text-[#7b8cd4]" />
            <h1 className="text-xl font-bold text-gray-800">PMOC</h1>
          </div>
          {contrato && (
            <p className="text-base font-semibold text-gray-600">{contrato.nome}</p>
          )}
          <p className="text-sm text-gray-400">Acompanhamento de manutenções preventivas</p>
        </div>

        {carregando && (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#7b8cd4]" />
          </div>
        )}

        {!carregando && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <StatCard
                label="Total"
                valor={total}
                corFundo="bg-[#f0f2ff]"
                corTexto="text-[#7b8cd4]"
                Icone={AirVent}
              />
              <StatCard
                label="Em dia"
                valor={emDia}
                corFundo="bg-green-50"
                corTexto="text-green-700"
                Icone={CheckCircle}
              />
              <StatCard
                label="Fazer este mês"
                valor={fazEsseMes}
                corFundo="bg-amber-50"
                corTexto="text-amber-700"
                Icone={AlertTriangle}
              />
              <StatCard
                label="Atrasados"
                valor={atrasados}
                corFundo="bg-red-50"
                corTexto="text-red-700"
                Icone={XCircle}
              />
            </div>

            {/* Barra de progresso */}
            <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">
                  {emDia} <span className="text-gray-400 font-normal">de {total} em conformidade</span>
                </span>
                <span className={`font-bold ${porcentagem === 100 ? "text-green-600" : "text-[#7b8cd4]"}`}>
                  {porcentagem}%
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${porcentagem === 100 ? "bg-green-500" : "bg-[#7b8cd4]"}`}
                  style={{ width: `${porcentagem}%` }}
                />
              </div>
              {porcentagem === 100 && (
                <p className="text-center text-xs text-green-600 font-semibold mt-2">
                  ✅ Todos os equipamentos estão em dia!
                </p>
              )}
            </div>

            {/* Equipamentos por bloco */}
            <div className="space-y-6">
              {Object.keys(blocos).sort().map(bloco => (
                <div key={bloco} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-[#1a1a2e] px-5 py-3 flex items-center justify-between">
                    <h2 className="font-bold text-white text-sm">🏢 Bloco {bloco}</h2>
                    <span className="text-xs text-white/60 font-medium">
                      {blocos[bloco].length} equipamentos
                    </span>
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {blocos[bloco].sort((a, b) => a.codigo.localeCompare(b.codigo)).map(eq => {
                      const status = statusEquipamento(eq);
                      const corBorda = status === "atrasado" ? "border-l-red-500" : status === "vence" ? "border-l-amber-400" : status === "pendente" ? "border-l-gray-400" : "border-l-green-500";
                      const corBadge = status === "atrasado" ? "bg-red-100 text-red-700" : status === "vence" ? "bg-amber-100 text-amber-700" : status === "pendente" ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700";
                      const labelStatus = status === "atrasado" ? "🚨 Atrasado" : status === "vence" ? "⚠️ Fazer este mês" : status === "pendente" ? "📋 Pendente" : "✅ Em dia";

                      return (
                        <div
                          key={eq.id}
                          className={`border border-gray-100 border-l-4 rounded-xl p-4 ${corBorda}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="font-semibold text-gray-800 text-sm leading-tight">{eq.nome}</p>
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 flex-shrink-0">
                              {eq.codigo}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-3">📍 {eq.local || "Local não informado"}</p>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${corBadge}`}>
                              {labelStatus}
                            </span>
                            {eq.ultimaManutencao && (
                              <span className="text-xs text-gray-400">
                                Última: {formatarData(eq.ultimaManutencao)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {total === 0 && (
              <div className="text-center py-16 text-gray-400">
                <AirVent size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum equipamento cadastrado neste contrato.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
