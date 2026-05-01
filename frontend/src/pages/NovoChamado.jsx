import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import { listarEquipamentos } from "../services/equipamentoService";
import { criarChamado } from "../services/contracts/chamadoService";
import { notificarNovoChamado } from "../services/emailService";
import { AlertTriangle, CheckCircle, Send } from "lucide-react";

const TIPOS = ["Corretiva", "Preventiva", "Emergência"];
const URGENCIAS = [
  { valor: "baixa",  label: "Baixa",  cor: "bg-slate-100 text-slate-700 border-slate-300" },
  { valor: "media",  label: "Média",  cor: "bg-amber-100 text-amber-700 border-amber-300" },
  { valor: "alta",   label: "Alta",   cor: "bg-red-100 text-red-700 border-red-300"       },
];

export default function NovoChamado() {
  const { empresaId, contratoId } = useParams();

  const [equipamentos, setEquipamentos] = useState([]);
  const [equipamentoId, setEquipamentoId] = useState("");
  const [tipo, setTipo] = useState("");
  const [urgencia, setUrgencia] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    if (!contratoId || !empresaId) return;
    listarEquipamentos(contratoId, empresaId).then(snap => {
      setEquipamentos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [contratoId, empresaId]);

  function validar() {
    const e = {};
    if (!tipo) e.tipo = "Selecione o tipo.";
    if (!urgencia) e.urgencia = "Selecione a urgência.";
    if (!descricao.trim()) e.descricao = "Descreva o problema.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const novosErros = validar();
    if (Object.keys(novosErros).length > 0) { setErros(novosErros); return; }

    setEnviando(true);
    try {
      await criarChamado(empresaId, {
        equipamentoId,
        tipo,
        urgencia,
        descricao,
        contratoId,
        criadoPor: localStorage.getItem("uid") || "",
      });

      // Notifica o gestor por e-mail (não bloqueia o fluxo se falhar)
      const eq = equipamentos.find(e => e.id === equipamentoId);
      notificarNovoChamado({
        urgencia,
        tipo,
        contratoId,
        equipamentoNome: eq ? `${eq.nome} — ${eq.local}` : null,
        descricao,
      }).catch(err => console.warn("E-mail não enviado:", err));

      setEnviado(true);
    } catch (err) {
      console.error(err);
      setErros({ geral: "Erro ao enviar chamado. Tente novamente." });
    } finally {
      setEnviando(false);
    }
  }

  function novoChamado() {
    setEquipamentoId("");
    setTipo("");
    setUrgencia("");
    setDescricao("");
    setErros({});
    setEnviado(false);
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Chamado enviado!</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Nossa equipe foi notificada e entrará em contato em breve.
          </p>
          <button
            onClick={novoChamado}
            className="px-6 py-2.5 bg-[#7b8cd4] text-white rounded-xl font-semibold text-sm hover:bg-[#6677be] transition-colors"
          >
            Abrir novo chamado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="p-4 md:p-6 max-w-lg mx-auto pb-10">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={22} className="text-[#7b8cd4]" />
          <h1 className="text-xl font-bold text-gray-800">Novo Chamado</h1>
        </div>
        <p className="text-sm text-gray-500 mb-5">Relate um problema ou solicite atendimento.</p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {erros.geral && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">
              {erros.geral}
            </div>
          )}

          {/* Equipamento (opcional) */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Equipamento <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <select
              value={equipamentoId}
              onChange={e => setEquipamentoId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]"
            >
              <option value="">Selecione o equipamento...</option>
              {equipamentos.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.nome} — {eq.local}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTipo(t); setErros(p => ({ ...p, tipo: null })); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                    tipo === t
                      ? "bg-[#7b8cd4] text-white border-[#7b8cd4]"
                      : "bg-white text-gray-600 border-gray-300 hover:border-[#7b8cd4]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {erros.tipo && <p className="text-red-500 text-xs mt-1">{erros.tipo}</p>}
          </div>

          {/* Urgência */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Urgência <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {URGENCIAS.map(u => (
                <button
                  key={u.valor}
                  type="button"
                  onClick={() => { setUrgencia(u.valor); setErros(p => ({ ...p, urgencia: null })); }}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                    urgencia === u.valor
                      ? u.cor + " shadow-sm"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
            {erros.urgencia && <p className="text-red-500 text-xs mt-1">{erros.urgencia}</p>}
          </div>

          {/* Descrição */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descrição do problema <span className="text-red-500">*</span>
            </label>
            <textarea
              value={descricao}
              onChange={e => { setDescricao(e.target.value); setErros(p => ({ ...p, descricao: null })); }}
              rows={4}
              placeholder="Descreva o problema com o máximo de detalhes possível..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b8cd4] resize-none"
            />
            {erros.descricao && <p className="text-red-500 text-xs mt-1">{erros.descricao}</p>}
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-[#7b8cd4] rounded-xl hover:bg-[#6677be] disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
            {enviando ? "Enviando..." : "Enviar Chamado"}
          </button>
        </form>
      </main>
    </div>
  );
}
