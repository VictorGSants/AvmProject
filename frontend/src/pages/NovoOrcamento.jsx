import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Plus, Trash2, FileText } from "lucide-react";
import Header from "../components/Header";
import { listarClientes, criarCliente } from "../services/clienteService";
import { listarBiblioteca } from "../services/bibliotecaService";
import { criarOrcamento, fmtBRL } from "../services/orcamentoService";
import { EMPRESAID } from "../config/empresa";
import { toast } from "sonner";

const STEPS = ["Cliente", "Serviço", "Itens", "Revisão"];

export default function NovoOrcamento() {
  const navigate = useNavigate();
  const { empresaId } = useParams();
  const eId = empresaId || EMPRESAID;

  const [step, setStep]                    = useState(0);
  const [salvando, setSalvando]            = useState(false);
  const [cliente, setCliente]              = useState(null);
  const [servico, setServico]              = useState(null);
  const [itensEquip, setItensEquip]        = useState([]);
  const [itensInst, setItensInst]          = useState([]);
  const [precoFinal, setPrecoFinal]        = useState("");
  const [observacoes, setObservacoes]      = useState("");
  const [processo, setProcesso]            = useState("");
  const [descricaoObjeto, setDescricaoObjeto] = useState("");
  const [garantia, setGarantia]            = useState("12 meses peças / 36 meses compressor");
  const [pagamento, setPagamento]          = useState("15 DDL");
  const [validade, setValidade]            = useState("30 dias");
  const [prazoExecucao, setPrazoExecucao]  = useState("30 dias");

  function onSelectServico(s) {
    setServico(s);
    setItensEquip(
      (s.materiais || []).map((m) => ({
        descricao: m.nome || "",
        qtd: m.qtd || 1,
        vlUnit: m.valorUnit || 0,
      }))
    );
    setItensInst(
      s.maoDeObra > 0
        ? [{ descricao: s.nome, qtd: 1, vlUnit: s.maoDeObra }]
        : [{ descricao: "", qtd: 1, vlUnit: 0 }]
    );
    setDescricaoObjeto(s.descricao || "");
    setGarantia(s.garantia || "12 meses peças / 36 meses compressor");
    setPagamento("15 DDL");
    setValidade("30 dias");
    setPrazoExecucao("30 dias");
    setPrecoFinal("");
    setStep(2);
  }

  async function handleSalvar(rascunho = false) {
    setSalvando(true);
    try {
      const totalEquip = itensEquip.reduce((s, i) => s + (i.vlUnit || 0) * (i.qtd || 1), 0);
      const totalInst  = itensInst.reduce((s, i) => s + (i.vlUnit || 0) * (i.qtd || 1), 0);
      const totalGeral = parseFloat(precoFinal) || (totalEquip + totalInst);

      await criarOrcamento(eId, {
        clienteId: cliente.id, clienteNome: cliente.nome,
        clienteCnpj: cliente.cnpj || "", clienteCpf: cliente.cpf || "",
        clienteEmail: cliente.email || "", clienteEndereco: cliente.endereco || "",
        clienteTelefone: cliente.telefone || "",
        servicoId: servico.id, servicoNome: servico.nome,
        descricaoObjeto,
        itensEquipamentos: itensEquip,
        itensInstalacao: itensInst,
        calculo: { totalEquipamentos: totalEquip, totalInstalacao: totalInst, totalGeral },
        precoFinal: totalGeral,
        processo, observacoes,
        garantia, pagamento, validade, prazoExecucao,
        status: rascunho ? "rascunho" : "enviado",
      });

      toast.success("Orçamento criado!");
      navigate(`/gestor/${eId}/orcamentos`);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar orçamento");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Novo Orçamento" />

      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`flex items-center gap-1.5 ${i <= step ? "opacity-100" : "opacity-40"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step ? "bg-green-500 text-white"
                  : i === step ? "bg-[#1a5ea8] text-white"
                  : "bg-gray-200 text-gray-400"}`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-[#1a5ea8]" : "text-gray-500"}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 sm:w-12 h-0.5 mx-1 ${i < step ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <main className="flex-grow p-4 max-w-lg mx-auto w-full">
        {step === 0 && (
          <StepCliente eId={eId} clienteSelecionado={cliente}
            onSelect={(c) => { setCliente(c); setStep(1); }} />
        )}
        {step === 1 && (
          <StepServico eId={eId} servicoSelecionado={servico}
            onSelect={onSelectServico}
            onVoltar={() => setStep(0)} />
        )}
        {step === 2 && (
          <StepItens
            itensEquip={itensEquip} setItensEquip={setItensEquip}
            itensInst={itensInst} setItensInst={setItensInst}
            onAvancar={() => setStep(3)}
            onVoltar={() => setStep(1)} />
        )}
        {step === 3 && (
          <StepRevisao
            cliente={cliente} servico={servico}
            itensEquip={itensEquip} itensInst={itensInst}
            precoFinal={precoFinal} processo={processo} observacoes={observacoes}
            descricaoObjeto={descricaoObjeto} garantia={garantia}
            pagamento={pagamento} validade={validade} prazoExecucao={prazoExecucao}
            onPrecoChange={setPrecoFinal} onProcessoChange={setProcesso} onObsChange={setObservacoes}
            onDescChange={setDescricaoObjeto} onGarantiaChange={setGarantia}
            onPagamentoChange={setPagamento} onValidadeChange={setValidade}
            onPrazoChange={setPrazoExecucao}
            onVoltar={() => setStep(2)}
            onRascunho={() => handleSalvar(true)}
            onFinalizar={() => handleSalvar(false)}
            salvando={salvando} />
        )}
      </main>
    </div>
  );
}

// ── Campo de texto reutilizável (fora dos componentes para evitar remount) ─
function InputField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
      <input type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]" />
    </div>
  );
}

// ── Step 1: Cliente ────────────────────────────────────────────────────────
const VAZIO = { nome: "", telefone: "", email: "", cpf: "", cnpj: "", endereco: "" };

function StepCliente({ eId, clienteSelecionado, onSelect }) {
  const [clientes, setClientes]       = useState([]);
  const [busca, setBusca]             = useState("");
  const [loading, setLoading]         = useState(true);
  const [mostrarNovo, setMostrarNovo] = useState(false);
  const [novo, setNovo]               = useState(VAZIO);
  const [criando, setCriando]         = useState(false);

  useEffect(() => { listarClientes(eId).then(setClientes).finally(() => setLoading(false)); }, [eId]);

  const filtrados = clientes.filter((c) =>
    !busca ||
    c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    c.telefone?.includes(busca) ||
    c.cpf?.includes(busca) ||
    c.cnpj?.includes(busca)
  );

  function campo(k, v) { setNovo((p) => ({ ...p, [k]: v })); }

  async function handleCriar() {
    if (!novo.nome.trim()) { toast.error("Nome é obrigatório"); return; }
    setCriando(true);
    try {
      const dados = { nome: novo.nome.trim() };
      if (novo.telefone.trim()) dados.telefone = novo.telefone.trim();
      if (novo.email.trim())    dados.email    = novo.email.trim();
      if (novo.cpf.trim())      dados.cpf      = novo.cpf.trim();
      if (novo.cnpj.trim())     dados.cnpj     = novo.cnpj.trim();
      if (novo.endereco.trim()) dados.endereco = novo.endereco.trim();
      const id = await criarCliente(eId, dados);
      toast.success("Cliente cadastrado!");
      onSelect({ id, ...dados });
    } catch { toast.error("Erro ao cadastrar cliente"); }
    finally { setCriando(false); }
  }

  const Field = ({ label, obrigatorio, ...props }) => (
    <div>
      <label className="text-xs font-semibold text-gray-600 block mb-1">
        {label} {obrigatorio
          ? <span className="text-red-400">*</span>
          : <span className="text-gray-400 font-normal">(opcional)</span>}
      </label>
      <input className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]" {...props} />
    </div>
  );

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Selecione ou cadastre o cliente</p>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input autoFocus type="text" placeholder="Buscar por nome, telefone, CPF ou CNPJ..."
          value={busca} onChange={(e) => setBusca(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]" />
      </div>

      {loading ? <p className="text-sm text-gray-400 text-center py-6">Carregando...</p> : (
        <div className="space-y-2 mb-4 max-h-56 overflow-y-auto">
          {filtrados.map((c) => (
            <div key={c.id} onClick={() => onSelect(c)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${clienteSelecionado?.id === c.id ? "border-[#1a5ea8] bg-blue-50" : "border-gray-100 bg-white hover:border-[#7b8cd4]"}`}>
              <p className="text-sm font-semibold text-gray-800">{c.nome}</p>
              <div className="flex flex-wrap gap-x-3 mt-0.5">
                {c.telefone && <span className="text-xs text-gray-400">{c.telefone}</span>}
                {c.cpf      && <span className="text-xs text-gray-400">CPF {c.cpf}</span>}
                {c.cnpj     && <span className="text-xs text-gray-400">CNPJ {c.cnpj}</span>}
              </div>
            </div>
          ))}
          {filtrados.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nenhum cliente encontrado</p>}
        </div>
      )}

      <button onClick={() => setMostrarNovo(!mostrarNovo)}
        className="flex items-center gap-2 text-sm text-[#1a5ea8] font-semibold mb-3">
        <Plus size={15} /> {mostrarNovo ? "Cancelar" : "Cadastrar novo cliente"}
      </button>

      {mostrarNovo && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
          <Field label="Nome" obrigatorio type="text" placeholder="Nome completo ou razão social"
            value={novo.nome} onChange={(e) => campo("nome", e.target.value)} />
          <Field label="Telefone" type="text" placeholder="(19) 99999-9999"
            value={novo.telefone} onChange={(e) => campo("telefone", e.target.value)} />
          <Field label="E-mail" type="email" placeholder="contato@empresa.com.br"
            value={novo.email} onChange={(e) => campo("email", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="CPF" type="text" placeholder="000.000.000-00"
              value={novo.cpf} onChange={(e) => campo("cpf", e.target.value)} />
            <Field label="CNPJ" type="text" placeholder="00.000.000/0001-00"
              value={novo.cnpj} onChange={(e) => campo("cnpj", e.target.value)} />
          </div>
          <Field label="Endereço" type="text" placeholder="Rua, nº – Bairro – Cidade/UF"
            value={novo.endereco} onChange={(e) => campo("endereco", e.target.value)} />
          <button onClick={handleCriar} disabled={!novo.nome.trim() || criando}
            className="w-full bg-[#1a5ea8] text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all">
            {criando ? "Salvando..." : "Salvar e selecionar"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Step 2: Serviço ────────────────────────────────────────────────────────
function StepServico({ eId, servicoSelecionado, onSelect, onVoltar }) {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading]   = useState(true);
  useEffect(() => { listarBiblioteca(eId).then(setServicos).finally(() => setLoading(false)); }, [eId]);

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Selecione o tipo de serviço</p>
      {loading ? <p className="text-sm text-gray-400 text-center py-6">Carregando...</p>
      : servicos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400 mb-2">Biblioteca vazia.</p>
          <p className="text-xs text-gray-400">Acesse <strong>Configurações → Biblioteca de Serviços</strong> para adicionar seus serviços padrão.</p>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {servicos.map((s) => (
            <div key={s.id} onClick={() => onSelect(s)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${servicoSelecionado?.id === s.id ? "border-[#1a5ea8] bg-blue-50" : "border-gray-100 bg-white hover:border-[#7b8cd4]"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{s.nome}</p>
                  {s.categoria && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">{s.categoria}</span>}
                </div>
                {s.maoDeObra > 0 && (
                  <span className="text-xs font-semibold text-gray-400">M.O. {fmtBRL(s.maoDeObra)}</span>
                )}
              </div>
              {s.descricao && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{s.descricao}</p>}
            </div>
          ))}
        </div>
      )}
      <button onClick={onVoltar} className="text-sm text-gray-500 font-medium">← Voltar</button>
    </div>
  );
}

// ── Helpers de itens (fora dos componentes para evitar remount a cada render) ─
function addItemRow(setter) {
  setter((prev) => [...prev, { descricao: "", qtd: 1, vlUnit: 0 }]);
}
function updateItemRow(setter, idx, campo, valor) {
  setter((prev) => {
    const copy = [...prev];
    copy[idx] = { ...copy[idx], [campo]: valor };
    return copy;
  });
}
function removeItemRow(setter, idx) {
  setter((prev) => prev.filter((_, i) => i !== idx));
}

// Tabela de itens reutilizável (equipamentos ou instalação)
function ItemSection({ label, items, setter }) {
  const subtotal = items.reduce((s, i) => s + (i.vlUnit || 0) * (i.qtd || 1), 0);
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{label}</p>
        <button onClick={() => addItemRow(setter)}
          className="flex items-center gap-1 text-xs text-[#1a5ea8] font-semibold">
          <Plus size={12} /> Adicionar
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-xl">
          Nenhum item — clique em Adicionar
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-3">
              <div className="flex gap-2 mb-2">
                <input
                  type="text" placeholder="Descrição do item"
                  value={item.descricao}
                  onChange={(e) => updateItemRow(setter, i, "descricao", e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7b8cd4]"
                />
                <button onClick={() => removeItemRow(setter, i)} className="text-red-400 p-1 flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">Quantidade</label>
                  <input
                    type="number" min={0} step={1}
                    value={item.qtd}
                    onChange={(e) => updateItemRow(setter, i, "qtd", parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7b8cd4]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">Valor unitário (R$)</label>
                  <input
                    type="number" min={0} step={0.01}
                    value={item.vlUnit}
                    onChange={(e) => updateItemRow(setter, i, "vlUnit", parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7b8cd4]"
                  />
                </div>
              </div>
              {item.descricao && item.qtd > 0 && item.vlUnit > 0 && (
                <p className="text-[10px] text-gray-400 mt-1.5 text-right">
                  Subtotal: {fmtBRL(item.vlUnit * item.qtd)}
                </p>
              )}
            </div>
          ))}
          <p className="text-xs font-semibold text-gray-600 text-right pr-1">
            Subtotal: {fmtBRL(subtotal)}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Step 3: Itens ──────────────────────────────────────────────────────────
function StepItens({ itensEquip, setItensEquip, itensInst, setItensInst, onAvancar, onVoltar }) {
  const totalEquip = itensEquip.reduce((s, i) => s + (i.vlUnit || 0) * (i.qtd || 1), 0);
  const totalInst  = itensInst.reduce((s, i) => s + (i.vlUnit || 0) * (i.qtd || 1), 0);

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Adicione os itens do orçamento</p>

      <ItemSection label="Equipamentos – Fornecimento" items={itensEquip} setter={setItensEquip} />
      <ItemSection label="Instalação / Serviço"         items={itensInst}  setter={setItensInst} />

      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center mb-5">
        <span className="text-sm font-semibold text-green-800">Total Estimado</span>
        <span className="text-lg font-bold text-green-700">{fmtBRL(totalEquip + totalInst)}</span>
      </div>

      <div className="flex gap-3">
        <button onClick={onVoltar} className="text-sm text-gray-500 font-medium px-4 py-2.5">← Voltar</button>
        <button onClick={onAvancar}
          disabled={itensEquip.length === 0 && itensInst.length === 0}
          className="flex-1 bg-[#1a5ea8] text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
          Revisar →
        </button>
      </div>
    </div>
  );
}

// ── Step 4: Revisão ────────────────────────────────────────────────────────
function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800 text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

function StepRevisao({
  cliente, servico, itensEquip, itensInst,
  precoFinal, processo, observacoes,
  descricaoObjeto, garantia, pagamento, validade, prazoExecucao,
  onPrecoChange, onProcessoChange, onObsChange,
  onDescChange, onGarantiaChange, onPagamentoChange, onValidadeChange, onPrazoChange,
  onVoltar, onRascunho, onFinalizar, salvando,
}) {
  const totalEquip    = itensEquip.reduce((s, i) => s + (i.vlUnit || 0) * (i.qtd || 1), 0);
  const totalInst     = itensInst.reduce((s, i) => s + (i.vlUnit || 0) * (i.qtd || 1), 0);
  const totalSugerido = totalEquip + totalInst;

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Revise e ajuste antes de finalizar</p>

      {/* Resumo cliente + valores */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 space-y-1 text-sm">
        <Row label="Cliente"   value={cliente?.nome} />
        {cliente?.cnpj     && <Row label="CNPJ"     value={cliente.cnpj} />}
        {cliente?.cpf      && <Row label="CPF"      value={cliente.cpf} />}
        {cliente?.email    && <Row label="E-mail"   value={cliente.email} />}
        {cliente?.telefone && <Row label="Telefone" value={cliente.telefone} />}
        {cliente?.endereco && <Row label="Endereço" value={cliente.endereco} />}
        <div className="border-t border-gray-100 pt-2 mt-1">
          <Row label="Serviço"      value={servico?.nome} />
          <Row label="Equipamentos" value={`${itensEquip.length} item(s) — ${fmtBRL(totalEquip)}`} />
          <Row label="Instalação"   value={`${itensInst.length} item(s) — ${fmtBRL(totalInst)}`} />
        </div>
      </div>

      {/* Processo + Preço */}
      <div className="space-y-3 mb-4">
        <InputField label="Nº do Processo (opcional)" placeholder="Ex: 37120-26"
          value={processo} onChange={onProcessoChange} />

        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">
            Preço final (R$){" "}
            <span className="text-gray-400 font-normal">— calculado: {fmtBRL(totalSugerido)}</span>
          </label>
          <input type="number" step="0.01" value={precoFinal}
            onChange={(e) => onPrecoChange(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-white border border-[#1a5ea8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4] font-bold text-gray-800" />
        </div>
      </div>

      {/* Descrição do objeto */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-600 block mb-1">
          Descrição do Objeto (aparece no PDF)
        </label>
        <textarea rows={4} value={descricaoObjeto} onChange={(e) => onDescChange(e.target.value)}
          placeholder="Descreva o objeto da proposta..."
          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4] resize-none" />
      </div>

      {/* Condições comerciais */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Condições Comerciais</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <InputField label="Pagamento"   value={pagamento}     onChange={onPagamentoChange} placeholder="15 DDL" />
          <InputField label="Validade"    value={validade}      onChange={onValidadeChange}  placeholder="30 dias" />
          <InputField label="Prazo exec." value={prazoExecucao} onChange={onPrazoChange}     placeholder="30 dias" />
        </div>
        <InputField label="Garantia" value={garantia} onChange={onGarantiaChange}
          placeholder="12 meses peças / 36 meses compressor" />
      </div>

      {/* Observações */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-600 block mb-1">Observações internas (opcional)</label>
        <textarea rows={2} placeholder="Observações técnicas, condições especiais..."
          value={observacoes} onChange={(e) => onObsChange(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4] resize-none" />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center mb-5">
        <span className="text-sm font-semibold text-green-800">Total Geral</span>
        <span className="text-xl font-bold text-green-700">
          {fmtBRL(parseFloat(precoFinal) || totalSugerido)}
        </span>
      </div>

      <div className="space-y-2">
        <button onClick={onFinalizar} disabled={salvando}
          className="w-full flex items-center justify-center gap-2 bg-[#1a5ea8] text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all">
          <FileText size={15} /> {salvando ? "Salvando..." : "Criar orçamento"}
        </button>
        <button onClick={onRascunho} disabled={salvando}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 bg-white disabled:opacity-50">
          Salvar como rascunho
        </button>
        <button onClick={onVoltar} className="w-full text-sm text-gray-400 py-2">← Voltar</button>
      </div>
    </div>
  );
}
