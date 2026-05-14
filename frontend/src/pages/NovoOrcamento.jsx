import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Plus, Trash2, FileText, Building2 } from "lucide-react";
import Header from "../components/Header";
import { listarClientes, criarCliente } from "../services/clienteService";
import { listarBiblioteca } from "../services/bibliotecaService";
import {
  criarOrcamento, atualizarOrcamento, obterOrcamento, fmtBRL,
} from "../services/orcamentoService";
import { EMPRESAID } from "../config/empresa";
import { listarFornecedores, criarFornecedor } from "../services/fornecedorService";
import { toast } from "sonner";

const STEPS = ["Cliente", "Serviço", "Itens", "Revisão"];

export default function NovoOrcamento() {
  const navigate = useNavigate();
  const { empresaId, orcamentoId } = useParams();
  const eId = empresaId || EMPRESAID;
  const modoEditar = !!orcamentoId;

  const [step, setStep]                       = useState(0);
  const [salvando, setSalvando]               = useState(false);
  const [carregando, setCarregando]           = useState(modoEditar);
  const [cliente, setCliente]                 = useState(null);
  const [servico, setServico]                 = useState(null);
  const [itensEquip, setItensEquip]           = useState([]);
  const [itensInst, setItensInst]             = useState([]);
  const [opcoesEquip, setOpcoesEquip]         = useState([]);
  const [opcaoIdx, setOpcaoIdx]               = useState(0);
  const [equipApenasRef, setEquipApenasRef]   = useState(false);
  const [precoFinal, setPrecoFinal]           = useState("");
  const [observacoes, setObservacoes]         = useState("");
  const [processo, setProcesso]               = useState("");
  const [descricaoObjeto, setDescricaoObjeto] = useState("");
  const [garantia, setGarantia]               = useState("12 meses peças / 36 meses compressor");
  const [pagamento, setPagamento]             = useState("15 DDL");
  const [validade, setValidade]               = useState("30 dias");
  const [prazoExecucao, setPrazoExecucao]     = useState("30 dias");
  const [exibirFornecedor, setExibirFornecedor] = useState(false);
  const [fornecedor, setFornecedor]             = useState(null);

  // Carrega orçamento existente ao editar
  useEffect(() => {
    if (!modoEditar) return;
    setCarregando(true);
    obterOrcamento(eId, orcamentoId)
      .then((orc) => {
        if (!orc) { toast.error("Orçamento não encontrado"); return; }
        setCliente({
          id: orc.clienteId,        nome: orc.clienteNome,
          cnpj: orc.clienteCnpj    || "", cpf: orc.clienteCpf      || "",
          email: orc.clienteEmail  || "", endereco: orc.clienteEndereco || "",
          telefone: orc.clienteTelefone || "",
        });
        setServico({ id: orc.servicoId, nome: orc.servicoNome });
        setItensEquip(orc.itensEquipamentos || []);
        setItensInst(orc.itensInstalacao   || []);
        setOpcoesEquip(orc.opcoesEquipamento || []);
        setOpcaoIdx(orc.opcaoEquipamentoIdx ?? 0);
        setEquipApenasRef(orc.equipApenasRef ?? false);
        setPrecoFinal(orc.precoFinalDigitado ?? "");
        setProcesso(orc.processo       || "");
        setObservacoes(orc.observacoes || "");
        setDescricaoObjeto(orc.descricaoObjeto || "");
        setGarantia(orc.garantia         || "12 meses peças / 36 meses compressor");
        setPagamento(orc.pagamento       || "15 DDL");
        setValidade(orc.validade         || "30 dias");
        setPrazoExecucao(orc.prazoExecucao || "30 dias");
        setExibirFornecedor(orc.exibirDadosFornecedor ?? false);
        setFornecedor(orc.fornecedor || null);
        setStep(2);
      })
      .catch(() => toast.error("Erro ao carregar orçamento"))
      .finally(() => setCarregando(false));
  }, [modoEditar, eId, orcamentoId]);

  function onSelectServico(s) {
    setServico(s);
    setItensEquip(
      (s.materiais || []).map((m) => ({
        descricao: m.nome || "",
        qtd: m.qtd || 1,
        vlUnit: m.valorUnit || 0,
      }))
    );
    setOpcoesEquip(s.opcoesEquipamento || []);
    setOpcaoIdx(0);
    setEquipApenasRef(false);
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
      // Apenas a opção selecionada entra no total — não a soma de todas
      // Se equipApenasRef = true, equipamentos são só referência e não somam
      const vlOpcao    = (!equipApenasRef && opcoesEquip.length > 0) ? (opcoesEquip[opcaoIdx]?.valorUnit || 0) : 0;
      const totalEquip = equipApenasRef
        ? 0
        : itensEquip.reduce((s, i) => s + (i.vlUnit || 0) * (i.qtd || 1), 0) + vlOpcao;
      const totalInst  = itensInst.reduce((s, i) => s + (i.vlUnit || 0) * (i.qtd || 1), 0);
      const totalGeral = parseFloat(precoFinal) || (totalEquip + totalInst);

      const dados = {
        clienteId: cliente.id,           clienteNome: cliente.nome,
        clienteCnpj: cliente.cnpj       || "", clienteCpf: cliente.cpf          || "",
        clienteEmail: cliente.email     || "", clienteEndereco: cliente.endereco || "",
        clienteTelefone: cliente.telefone || "",
        servicoId: servico.id, servicoNome: servico.nome,
        descricaoObjeto,
        itensEquipamentos: itensEquip,
        itensInstalacao: itensInst,
        opcoesEquipamento: opcoesEquip,
        opcaoEquipamentoIdx: opcaoIdx,
        opcaoEquipamentoSelecionada: opcoesEquip.length > 0 ? (opcoesEquip[opcaoIdx] || null) : null,
        equipApenasRef,
        calculo: { totalEquipamentos: totalEquip, totalInstalacao: totalInst, totalGeral },
        precoFinal: totalGeral,
        precoFinalDigitado: precoFinal,
        processo, observacoes,
        garantia, pagamento, validade, prazoExecucao,
        exibirDadosFornecedor: exibirFornecedor,
        fornecedor: fornecedor || null,
        status: rascunho ? "rascunho" : "enviado",
      };

      if (modoEditar) {
        await atualizarOrcamento(eId, orcamentoId, dados);
        toast.success("Orçamento atualizado!");
        navigate(`/gestor/${eId}/orcamentos/${orcamentoId}`);
      } else {
        await criarOrcamento(eId, dados);
        toast.success("Orçamento criado!");
        navigate(`/gestor/${eId}/orcamentos`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar orçamento");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Editar Orçamento" />
      <div className="flex-grow flex items-center justify-center text-gray-400 text-sm">
        Carregando orçamento...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title={modoEditar ? "Editar Orçamento" : "Novo Orçamento"} />

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
            itensInst={itensInst}   setItensInst={setItensInst}
            opcoesEquip={opcoesEquip} opcaoIdx={opcaoIdx} setOpcaoIdx={setOpcaoIdx}
            equipApenasRef={equipApenasRef} setEquipApenasRef={setEquipApenasRef}
            onAvancar={() => setStep(3)}
            onVoltar={() => setStep(1)} />
        )}
        {step === 3 && (
          <StepRevisao
            eId={eId}
            cliente={cliente} servico={servico}
            itensEquip={itensEquip} itensInst={itensInst}
            opcoesEquip={opcoesEquip} opcaoIdx={opcaoIdx}
            equipApenasRef={equipApenasRef}
            precoFinal={precoFinal} processo={processo} observacoes={observacoes}
            descricaoObjeto={descricaoObjeto} garantia={garantia}
            pagamento={pagamento} validade={validade} prazoExecucao={prazoExecucao}
            onPrecoChange={setPrecoFinal} onProcessoChange={setProcesso} onObsChange={setObservacoes}
            onDescChange={setDescricaoObjeto} onGarantiaChange={setGarantia}
            onPagamentoChange={setPagamento} onValidadeChange={setValidade}
            onPrazoChange={setPrazoExecucao}
            exibirFornecedor={exibirFornecedor} setExibirFornecedor={setExibirFornecedor}
            fornecedor={fornecedor} setFornecedor={setFornecedor}
            onVoltar={() => setStep(2)}
            onRascunho={() => handleSalvar(true)}
            onFinalizar={() => handleSalvar(false)}
            salvando={salvando}
            modoEditar={modoEditar} />
        )}
      </main>
    </div>
  );
}

// ── Campo de texto reutilizável ────────────────────────────────────────────
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

// ── Campo do formulário de novo cliente ────────────────────────────────────
// IMPORTANTE: definido FORA de StepCliente para não ser recriado a cada render
function ClienteField({ label, obrigatorio, ...props }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 block mb-1">
        {label}{" "}
        {obrigatorio
          ? <span className="text-red-400">*</span>
          : <span className="text-gray-400 font-normal">(opcional)</span>}
      </label>
      <input
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]"
        {...props}
      />
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
          <ClienteField label="Nome" obrigatorio type="text" placeholder="Nome completo ou razão social"
            value={novo.nome} onChange={(e) => campo("nome", e.target.value)} />
          <ClienteField label="Telefone" type="text" placeholder="(19) 99999-9999"
            value={novo.telefone} onChange={(e) => campo("telefone", e.target.value)} />
          <ClienteField label="E-mail" type="email" placeholder="contato@empresa.com.br"
            value={novo.email} onChange={(e) => campo("email", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <ClienteField label="CPF" type="text" placeholder="000.000.000-00"
              value={novo.cpf} onChange={(e) => campo("cpf", e.target.value)} />
            <ClienteField label="CNPJ" type="text" placeholder="00.000.000/0001-00"
              value={novo.cnpj} onChange={(e) => campo("cnpj", e.target.value)} />
          </div>
          <ClienteField label="Endereço" type="text" placeholder="Rua, nº – Bairro – Cidade/UF"
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

// ── Helpers de itens ───────────────────────────────────────────────────────
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

// Tabela de itens reutilizável — headerExtra permite colocar um botão extra no cabeçalho
function ItemSection({ label, items, setter, headerExtra }) {
  const subtotal = items.reduce((s, i) => s + (i.vlUnit || 0) * (i.qtd || 1), 0);
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{label}</p>
        <div className="flex items-center gap-2">
          {headerExtra}
          <button onClick={() => addItemRow(setter)}
            className="flex items-center gap-1 text-xs text-[#1a5ea8] font-semibold">
            <Plus size={12} /> Adicionar
          </button>
        </div>
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

// ── Seletor de opção de equipamento (escolha única) ────────────────────────
function OpcoesSection({ opcoes, opcaoIdx, setOpcaoIdx, apenasRef = false }) {
  if (opcoes.length === 0) return null;
  return (
    <div className="mb-5">
      <div className="mb-2">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Opção de Equipamento</p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {apenasRef
            ? "Equipamento listado apenas para referência — não soma no total"
            : "Selecione uma opção — apenas o valor selecionado entra no total"}
        </p>
      </div>
      <div className="space-y-2">
        {opcoes.map((o, i) => (
          <div
            key={i}
            onClick={() => setOpcaoIdx(i)}
            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              i === opcaoIdx ? "border-[#1a5ea8] bg-blue-50" : "border-gray-100 bg-white hover:border-[#7b8cd4]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                i === opcaoIdx ? "border-[#1a5ea8]" : "border-gray-300"
              }`}>
                {i === opcaoIdx && <div className="w-2 h-2 rounded-full bg-[#1a5ea8]" />}
              </div>
              <span className="text-sm text-gray-800">{o.nome}</span>
            </div>
            <span className="text-sm font-bold text-gray-700 ml-2 flex-shrink-0">{fmtBRL(o.valorUnit)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step 3: Itens ──────────────────────────────────────────────────────────
function StepItens({ itensEquip, setItensEquip, itensInst, setItensInst, opcoesEquip, opcaoIdx, setOpcaoIdx, equipApenasRef, setEquipApenasRef, onAvancar, onVoltar }) {
  const vlOpcao    = (!equipApenasRef && opcoesEquip.length > 0) ? (opcoesEquip[opcaoIdx]?.valorUnit || 0) : 0;
  const totalEquip = equipApenasRef
    ? 0
    : itensEquip.reduce((s, i) => s + (i.vlUnit || 0) * (i.qtd || 1), 0) + vlOpcao;
  const totalInst  = itensInst.reduce((s, i) => s + (i.vlUnit || 0) * (i.qtd || 1), 0);

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Adicione os itens do orçamento</p>

      <OpcoesSection opcoes={opcoesEquip} opcaoIdx={opcaoIdx} setOpcaoIdx={setOpcaoIdx} apenasRef={equipApenasRef} />

      <ItemSection
        label={opcoesEquip.length > 0 ? "Acessórios / Materiais" : "Equipamentos – Fornecimento"}
        items={itensEquip} setter={setItensEquip}
        headerExtra={
          <button
            onClick={() => setEquipApenasRef(!equipApenasRef)}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-colors ${
              equipApenasRef
                ? "bg-amber-50 border-amber-300 text-amber-700"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {equipApenasRef ? "⚠ Só referência" : "Incluir no total"}
          </button>
        }
      />
      {equipApenasRef && (
        <p className="text-[10px] text-amber-600 -mt-4 mb-4">
          Equipamentos listados para referência — <strong>não somam no total</strong>.
        </p>
      )}
      <ItemSection label="Instalação / Serviço" items={itensInst} setter={setItensInst} />

      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center mb-5">
        <span className="text-sm font-semibold text-green-800">Total Estimado</span>
        <span className="text-lg font-bold text-green-700">{fmtBRL(totalEquip + totalInst)}</span>
      </div>

      <div className="flex gap-3">
        <button onClick={onVoltar} className="text-sm text-gray-500 font-medium px-4 py-2.5">← Voltar</button>
        <button onClick={onAvancar}
          disabled={itensEquip.length === 0 && itensInst.length === 0 && opcoesEquip.length === 0}
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
  eId,
  cliente, servico, itensEquip, itensInst,
  opcoesEquip, opcaoIdx, equipApenasRef,
  precoFinal, processo, observacoes,
  descricaoObjeto, garantia, pagamento, validade, prazoExecucao,
  onPrecoChange, onProcessoChange, onObsChange,
  onDescChange, onGarantiaChange, onPagamentoChange, onValidadeChange, onPrazoChange,
  exibirFornecedor, setExibirFornecedor,
  fornecedor, setFornecedor,
  onVoltar, onRascunho, onFinalizar, salvando, modoEditar,
}) {
  const vlOpcao       = (!equipApenasRef && opcoesEquip.length > 0) ? (opcoesEquip[opcaoIdx]?.valorUnit || 0) : 0;
  const totalEquip    = equipApenasRef
    ? 0
    : itensEquip.reduce((s, i) => s + (i.vlUnit || 0) * (i.qtd || 1), 0) + vlOpcao;
  const totalInst     = itensInst.reduce((s, i) => s + (i.vlUnit || 0) * (i.qtd || 1), 0);
  const totalSugerido = totalEquip + totalInst;

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Revise e ajuste antes de finalizar</p>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 space-y-1 text-sm">
        <Row label="Cliente"   value={cliente?.nome} />
        {cliente?.cnpj     && <Row label="CNPJ"     value={cliente.cnpj} />}
        {cliente?.cpf      && <Row label="CPF"      value={cliente.cpf} />}
        {cliente?.email    && <Row label="E-mail"   value={cliente.email} />}
        {cliente?.telefone && <Row label="Telefone" value={cliente.telefone} />}
        {cliente?.endereco && <Row label="Endereço" value={cliente.endereco} />}
        <div className="border-t border-gray-100 pt-2 mt-1">
          <Row label="Serviço" value={servico?.nome} />
          {opcoesEquip.length > 0 && (
            <Row
              label={`Equipamento${equipApenasRef ? " (ref.)" : ""}`}
              value={equipApenasRef
                ? opcoesEquip[opcaoIdx]?.nome || "—"
                : `${opcoesEquip[opcaoIdx]?.nome || "—"} — ${fmtBRL(opcoesEquip[opcaoIdx]?.valorUnit || 0)}`}
            />
          )}
          {itensEquip.length > 0 && (
            <Row
              label={`Acessórios${equipApenasRef ? " (ref.)" : ""}`}
              value={equipApenasRef
                ? `${itensEquip.length} item(s) — não cobrado`
                : `${itensEquip.length} item(s) — ${fmtBRL(itensEquip.reduce((s,i) => s + (i.vlUnit||0)*(i.qtd||1), 0))}`}
            />
          )}
          <Row label="Instalação" value={`${itensInst.length} item(s) — ${fmtBRL(totalInst)}`} />
        </div>
      </div>

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

      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-600 block mb-1">
          Descrição do Objeto (aparece no PDF)
        </label>
        <textarea rows={4} value={descricaoObjeto} onChange={(e) => onDescChange(e.target.value)}
          placeholder="Descreva o objeto da proposta..."
          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4] resize-none" />
      </div>

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

      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <Building2 size={13} />
            Fornecedor no PDF
          </p>
          <button
            onClick={() => { setExibirFornecedor(!exibirFornecedor); if (exibirFornecedor) setFornecedor(null); }}
            className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors ${
              exibirFornecedor
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-gray-50 border-gray-200 text-gray-500"
            }`}
          >
            {exibirFornecedor ? "Incluído no PDF" : "Não incluir"}
          </button>
        </div>
        {exibirFornecedor && (
          <SeletorFornecedor
            eId={eId}
            fornecedorSelecionado={fornecedor}
            onSelect={setFornecedor}
          />
        )}
      </div>

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
          <FileText size={15} />
          {salvando ? "Salvando..." : (modoEditar ? "Salvar alterações" : "Criar orçamento")}
        </button>
        {!modoEditar && (
          <button onClick={onRascunho} disabled={salvando}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 bg-white disabled:opacity-50">
            Salvar como rascunho
          </button>
        )}
        <button onClick={onVoltar} className="w-full text-sm text-gray-400 py-2">← Voltar</button>
      </div>
    </div>
  );
}

// ── Seletor de Fornecedor (igual ao seletor de cliente) ───────────────────
const VAZIO_FORN = { nome: "", cnpj: "", banco: "" };

function SeletorFornecedor({ eId, fornecedorSelecionado, onSelect }) {
  const [fornecedores, setFornecedores]   = useState([]);
  const [busca, setBusca]                 = useState("");
  const [loading, setLoading]             = useState(true);
  const [mostrarNovo, setMostrarNovo]     = useState(false);
  const [novo, setNovo]                   = useState(VAZIO_FORN);
  const [criando, setCriando]             = useState(false);

  useEffect(() => {
    listarFornecedores(eId).then(setFornecedores).finally(() => setLoading(false));
  }, [eId]);

  const filtrados = fornecedores.filter(f =>
    !busca ||
    f.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    f.cnpj?.includes(busca)
  );

  function campo(k, v) { setNovo(p => ({ ...p, [k]: v })); }

  async function handleCriar() {
    if (!novo.nome.trim()) { toast.error("Nome é obrigatório"); return; }
    setCriando(true);
    try {
      const dados = { nome: novo.nome.trim() };
      if (novo.cnpj.trim())  dados.cnpj  = novo.cnpj.trim();
      if (novo.banco.trim()) dados.banco  = novo.banco.trim();
      const id = await criarFornecedor(eId, dados);
      toast.success("Fornecedor cadastrado!");
      const criado = { id, ...dados };
      setFornecedores(prev => [...prev, criado]);
      onSelect(criado);
      setMostrarNovo(false);
      setNovo(VAZIO_FORN);
    } catch { toast.error("Erro ao cadastrar fornecedor"); }
    finally { setCriando(false); }
  }

  if (fornecedorSelecionado) {
    return (
      <div className="flex items-start justify-between bg-blue-50 border border-blue-200 rounded-xl p-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">{fornecedorSelecionado.nome}</p>
          {fornecedorSelecionado.cnpj  && <p className="text-xs text-gray-500 mt-0.5">CNPJ {fornecedorSelecionado.cnpj}</p>}
          {fornecedorSelecionado.banco && <p className="text-xs text-gray-500">{fornecedorSelecionado.banco}</p>}
        </div>
        <button onClick={() => onSelect(null)}
          className="text-xs text-[#1a5ea8] font-semibold ml-3 flex-shrink-0">
          Trocar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Buscar fornecedor por nome ou CNPJ..."
          value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]" />
      </div>

      {loading ? <p className="text-sm text-gray-400 text-center py-4">Carregando...</p> : (
        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
          {filtrados.map(f => (
            <div key={f.id} onClick={() => onSelect(f)}
              className="p-3 rounded-xl border border-gray-100 bg-white cursor-pointer hover:border-[#7b8cd4] transition-all">
              <p className="text-sm font-semibold text-gray-800">{f.nome}</p>
              <div className="flex flex-wrap gap-x-3 mt-0.5">
                {f.cnpj  && <span className="text-xs text-gray-400">CNPJ {f.cnpj}</span>}
                {f.banco && <span className="text-xs text-gray-400">{f.banco}</span>}
              </div>
            </div>
          ))}
          {filtrados.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-3">Nenhum fornecedor encontrado</p>
          )}
        </div>
      )}

      <button onClick={() => setMostrarNovo(!mostrarNovo)}
        className="flex items-center gap-2 text-sm text-[#1a5ea8] font-semibold mb-3">
        <Plus size={15} /> {mostrarNovo ? "Cancelar" : "Cadastrar novo fornecedor"}
      </button>

      {mostrarNovo && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
          <ClienteField label="Nome" obrigatorio type="text" placeholder="Nome do fornecedor"
            value={novo.nome} onChange={e => campo("nome", e.target.value)} />
          <ClienteField label="CNPJ" type="text" placeholder="00.000.000/0001-00"
            value={novo.cnpj} onChange={e => campo("cnpj", e.target.value)} />
          <ClienteField label="Dados Bancários" type="text" placeholder="Ex: Itaú · Ag. 0000 · CC 00000-0"
            value={novo.banco} onChange={e => campo("banco", e.target.value)} />
          <button onClick={handleCriar} disabled={!novo.nome.trim() || criando}
            className="w-full bg-[#1a5ea8] text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all">
            {criando ? "Salvando..." : "Salvar e selecionar"}
          </button>
        </div>
      )}
    </div>
  );
}
