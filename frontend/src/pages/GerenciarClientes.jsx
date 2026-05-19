import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Plus, Search, ChevronRight, Building2, ArrowLeft,
  Edit2, Trash2, Check, X, User, Users, ChevronDown, ChevronUp,
} from "lucide-react";
import Header from "../components/Header";
import { listarClientes, criarCliente, atualizarCliente, excluirCliente } from "../services/clienteService";
import {
  listarEntidadesPorCliente, criarEntidade, atualizarEntidade, excluirEntidade,
} from "../services/entidadeService";
import { EMPRESAID } from "../config/empresa";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function GerenciarClientes() {
  const { empresaId } = useParams();
  const eId = empresaId || EMPRESAID;

  const [clientes, setClientes]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [busca, setBusca]               = useState("");
  const [selecionado, setSelecionado]   = useState(null);
  const [mostrarNovo, setMostrarNovo]   = useState(false);

  useEffect(() => { carregar(); }, [eId]);

  async function carregar() {
    setLoading(true);
    try {
      setClientes(await listarClientes(eId));
    } catch {
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }

  const filtrados = clientes.filter((c) =>
    !busca ||
    c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    c.cnpj?.includes(busca) ||
    c.cpf?.includes(busca) ||
    c.telefone?.includes(busca)
  );

  // ── Vista de detalhe do cliente ──────────────────────────────────────────
  if (selecionado) {
    return (
      <DetalheCliente
        eId={eId}
        cliente={selecionado}
        onVoltar={() => setSelecionado(null)}
        onAtualizado={(c) => {
          setClientes((prev) => prev.map((x) => (x.id === c.id ? c : x)));
          setSelecionado(c);
        }}
        onExcluido={() => {
          setClientes((prev) => prev.filter((x) => x.id !== selecionado.id));
          setSelecionado(null);
        }}
      />
    );
  }

  // ── Lista de clientes ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Clientes" />

      <main className="flex-grow p-4 max-w-2xl mx-auto w-full">
        {/* Busca + Novo */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ ou telefone..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]"
            />
          </div>
          <button
            onClick={() => setMostrarNovo(true)}
            className="flex items-center gap-1.5 bg-[#1a5ea8] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#154e8f] active:scale-95 transition-all"
          >
            <Plus size={16} /> Novo
          </button>
        </div>

        {/* Formulário novo cliente */}
        {mostrarNovo && (
          <FormCliente
            eId={eId}
            onSalvar={(c) => {
              setClientes((prev) => [...prev, c]);
              setMostrarNovo(false);
              setSelecionado(c);
            }}
            onCancelar={() => setMostrarNovo(false)}
          />
        )}

        {/* Lista */}
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-12">Carregando...</p>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-12">
            <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">
              {busca ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelecionado(c)}
                className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.nome}</p>
                    <div className="flex flex-wrap gap-x-3 mt-0.5">
                      {c.cnpj     && <span className="text-xs text-gray-400">CNPJ {c.cnpj}</span>}
                      {c.cpf      && <span className="text-xs text-gray-400">CPF {c.cpf}</span>}
                      {c.telefone && <span className="text-xs text-gray-400">{c.telefone}</span>}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DETALHE DO CLIENTE
// ─────────────────────────────────────────────────────────────────────────────
function DetalheCliente({ eId, cliente, onVoltar, onAtualizado, onExcluido }) {
  const [editando, setEditando]         = useState(false);
  const [form, setForm]                 = useState({ ...cliente });
  const [salvando, setSalvando]         = useState(false);
  const [entidades, setEntidades]       = useState([]);
  const [loadingEnt, setLoadingEnt]     = useState(true);

  useEffect(() => {
    listarEntidadesPorCliente(eId, cliente.id)
      .then(setEntidades)
      .catch(() => toast.error("Erro ao carregar institutos"))
      .finally(() => setLoadingEnt(false));
  }, [eId, cliente.id]);

  function campo(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  async function salvarCliente() {
    if (!form.nome?.trim()) { toast.error("Nome é obrigatório"); return; }
    setSalvando(true);
    try {
      const dados = {
        nome: form.nome.trim(),
        ...(form.telefone?.trim() && { telefone: form.telefone.trim() }),
        ...(form.email?.trim()    && { email:    form.email.trim() }),
        ...(form.cnpj?.trim()     && { cnpj:     form.cnpj.trim() }),
        ...(form.cpf?.trim()      && { cpf:      form.cpf.trim() }),
        ...(form.endereco?.trim() && { endereco: form.endereco.trim() }),
      };
      await atualizarCliente(eId, cliente.id, dados);
      toast.success("Cliente atualizado");
      onAtualizado({ ...cliente, ...dados });
      setEditando(false);
    } catch {
      toast.error("Erro ao atualizar cliente");
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir() {
    if (!confirm(`Excluir "${cliente.nome}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await excluirCliente(eId, cliente.id);
      toast.success("Cliente excluído");
      onExcluido();
    } catch {
      toast.error("Erro ao excluir cliente");
    }
  }

  function onEntidadeAtualizada(ent) {
    setEntidades((prev) => {
      const existe = prev.find((e) => e.id === ent.id);
      return existe ? prev.map((e) => e.id === ent.id ? ent : e) : [...prev, ent];
    });
  }

  function onEntidadeExcluida(id) {
    setEntidades((prev) => prev.filter((e) => e.id !== id));
  }

  const Field = ({ label, k, placeholder, type = "text" }) => (
    <div>
      <label className="text-xs font-semibold text-gray-500 block mb-0.5">{label}</label>
      {editando ? (
        <input
          type={type}
          value={form[k] || ""}
          placeholder={placeholder}
          onChange={(e) => campo(k, e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]"
        />
      ) : (
        <p className="text-sm text-gray-800 py-1">
          {cliente[k] || <span className="text-gray-300 italic">—</span>}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title={cliente.nome} />

      <main className="flex-grow p-4 max-w-2xl mx-auto w-full space-y-4">
        {/* Botão voltar */}
        <button
          onClick={onVoltar}
          className="flex items-center gap-1.5 text-sm text-gray-500 font-medium"
        >
          <ArrowLeft size={15} /> Todos os clientes
        </button>

        {/* ── Dados básicos ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dados do cliente</p>
            {editando ? (
              <div className="flex gap-2">
                <button
                  onClick={salvarCliente}
                  disabled={salvando}
                  className="flex items-center gap-1 text-xs bg-[#1a5ea8] text-white px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
                >
                  <Check size={12} /> {salvando ? "Salvando..." : "Salvar"}
                </button>
                <button
                  onClick={() => { setForm({ ...cliente }); setEditando(false); }}
                  className="flex items-center gap-1 text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg"
                >
                  <X size={12} /> Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditando(true)}
                className="flex items-center gap-1 text-xs text-[#1a5ea8] font-semibold"
              >
                <Edit2 size={12} /> Editar
              </button>
            )}
          </div>

          <div className="space-y-2">
            <Field label="Nome / Razão Social" k="nome" placeholder="Nome completo ou razão social" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="CNPJ" k="cnpj" placeholder="00.000.000/0001-00" />
              <Field label="CPF" k="cpf" placeholder="000.000.000-00" />
            </div>
            <Field label="Telefone" k="telefone" placeholder="(19) 99999-9999" />
            <Field label="E-mail" k="email" placeholder="contato@empresa.com.br" type="email" />
            <Field label="Endereço" k="endereco" placeholder="Rua, nº – Bairro – Cidade/UF" />
          </div>
        </div>

        {/* ── Institutos / Hierarquia de órgãos ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-[#7b8cd4]" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Institutos / Órgãos
            </p>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Pré-cadastre os institutos e responsáveis para agilizar a criação de orçamentos.
          </p>

          {loadingEnt ? (
            <p className="text-xs text-gray-400 py-2">Carregando...</p>
          ) : entidades.length === 0 ? (
            <EntidadeVazia
              eId={eId}
              clienteId={cliente.id}
              clienteNome={cliente.nome}
              onCriada={onEntidadeAtualizada}
            />
          ) : (
            <div className="space-y-4">
              {entidades.map((ent) => (
                <EntidadeCard
                  key={ent.id}
                  eId={eId}
                  entidade={ent}
                  onAtualizada={onEntidadeAtualizada}
                  onExcluida={() => onEntidadeExcluida(ent.id)}
                />
              ))}
              <BotaoNovaEntidade
                eId={eId}
                clienteId={cliente.id}
                clienteNome={cliente.nome}
                onCriada={onEntidadeAtualizada}
              />
            </div>
          )}
        </div>

        {/* ── Zona de perigo ── */}
        <div className="pt-2 pb-6">
          <button
            onClick={handleExcluir}
            className="flex items-center gap-1.5 text-sm text-red-400 font-semibold"
          >
            <Trash2 size={14} /> Excluir cliente
          </button>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTIDADE VAZIA — primeiro cadastro
// ─────────────────────────────────────────────────────────────────────────────
function EntidadeVazia({ eId, clienteId, clienteNome, onCriada }) {
  const [criando, setCriando] = useState(false);
  const [nome, setNome]       = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleCriar() {
    const n = nome.trim() || clienteNome.trim();
    setSalvando(true);
    try {
      const id = await criarEntidade(eId, { nome: n, clienteId, orgaos: [] });
      onCriada({ id, nome: n, clienteId, orgaos: [] });
      toast.success("Entidade criada!");
    } catch {
      toast.error("Erro ao criar entidade");
    } finally {
      setSalvando(false);
    }
  }

  if (criando) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-500">
          Nome da entidade no PDF (ex: <strong>FUNCAMP</strong>):
        </p>
        <input
          autoFocus
          type="text"
          value={nome}
          placeholder={clienteNome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleCriar(); }}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]"
        />
        <div className="flex gap-2">
          <button
            onClick={handleCriar}
            disabled={salvando}
            className="flex-1 bg-[#1a5ea8] text-white py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
          >
            {salvando ? "Criando..." : "Criar e adicionar institutos"}
          </button>
          <button
            onClick={() => setCriando(false)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setCriando(true)}
      className="flex items-center gap-2 text-sm text-[#1a5ea8] font-semibold"
    >
      <Plus size={15} /> Configurar institutos
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BOTÃO PARA NOVA ENTIDADE ADICIONAL
// ─────────────────────────────────────────────────────────────────────────────
function BotaoNovaEntidade({ eId, clienteId, clienteNome, onCriada }) {
  const [aberto, setAberto]     = useState(false);
  const [nome, setNome]         = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleCriar() {
    if (!nome.trim()) return;
    setSalvando(true);
    try {
      const id = await criarEntidade(eId, { nome: nome.trim(), clienteId, orgaos: [] });
      onCriada({ id, nome: nome.trim(), clienteId, orgaos: [] });
      setNome("");
      setAberto(false);
      toast.success("Entidade adicionada!");
    } catch {
      toast.error("Erro ao criar entidade");
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="flex items-center gap-1.5 text-xs text-gray-400 border border-dashed border-gray-300 px-3 py-1.5 rounded-xl hover:border-gray-400 transition-colors"
      >
        <Plus size={11} /> Nova entidade
      </button>
    );
  }

  return (
    <div className="flex gap-1.5">
      <input
        autoFocus
        type="text"
        value={nome}
        placeholder="Nome da entidade"
        onChange={(e) => setNome(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleCriar(); if (e.key === "Escape") setAberto(false); }}
        className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7b8cd4]"
      />
      <button
        onClick={handleCriar}
        disabled={!nome.trim() || salvando}
        className="text-xs px-2.5 py-1.5 bg-[#1a5ea8] text-white rounded-lg disabled:opacity-40"
      >
        OK
      </button>
      <button
        onClick={() => setAberto(false)}
        className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg text-gray-400"
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD DE UMA ENTIDADE — mostra orgãos e responsáveis
// ─────────────────────────────────────────────────────────────────────────────
function EntidadeCard({ eId, entidade, onAtualizada, onExcluida }) {
  const [expandido, setExpandido]       = useState(true);
  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNome, setNovoNome]         = useState(entidade.nome);
  const [salvando, setSalvando]         = useState(false);

  const orgaos = entidade.orgaos || [];

  async function salvarNome() {
    if (!novoNome.trim()) return;
    setSalvando(true);
    try {
      await atualizarEntidade(eId, entidade.id, { nome: novoNome.trim() });
      onAtualizada({ ...entidade, nome: novoNome.trim() });
      setEditandoNome(false);
      toast.success("Nome atualizado");
    } catch {
      toast.error("Erro ao atualizar");
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluirEntidade() {
    if (!confirm(`Excluir entidade "${entidade.nome}" e todos os seus institutos?`)) return;
    try {
      await excluirEntidade(eId, entidade.id);
      onExcluida();
      toast.success("Entidade excluída");
    } catch {
      toast.error("Erro ao excluir entidade");
    }
  }

  async function adicionarOrgao(nome) {
    const novo = { nome: nome.trim(), responsaveis: [] };
    const novosOrgaos = [...orgaos, novo];
    try {
      await atualizarEntidade(eId, entidade.id, { orgaos: novosOrgaos });
      onAtualizada({ ...entidade, orgaos: novosOrgaos });
      toast.success("Instituto adicionado");
    } catch {
      toast.error("Erro ao adicionar instituto");
    }
  }

  async function removerOrgao(nome) {
    if (!confirm(`Remover o instituto "${nome}"?`)) return;
    const novosOrgaos = orgaos.filter((o) => o.nome !== nome);
    try {
      await atualizarEntidade(eId, entidade.id, { orgaos: novosOrgaos });
      onAtualizada({ ...entidade, orgaos: novosOrgaos });
      toast.success("Instituto removido");
    } catch {
      toast.error("Erro ao remover instituto");
    }
  }

  // Atualiza campos de contato (e nome) de um órgão
  async function editarOrgao(nomeOriginal, novosDados) {
    const novosOrgaos = orgaos.map((o) =>
      o.nome === nomeOriginal ? { ...o, ...novosDados } : o
    );
    try {
      await atualizarEntidade(eId, entidade.id, { orgaos: novosOrgaos });
      onAtualizada({ ...entidade, orgaos: novosOrgaos });
      toast.success("Instituto atualizado");
    } catch {
      toast.error("Erro ao atualizar instituto");
    }
  }

  async function adicionarResponsavel(orgaoNome, respNome) {
    const novosOrgaos = orgaos.map((o) =>
      o.nome === orgaoNome
        ? { ...o, responsaveis: [...(o.responsaveis || []), respNome.trim()] }
        : o
    );
    try {
      await atualizarEntidade(eId, entidade.id, { orgaos: novosOrgaos });
      onAtualizada({ ...entidade, orgaos: novosOrgaos });
    } catch {
      toast.error("Erro ao adicionar responsável");
    }
  }

  async function removerResponsavel(orgaoNome, respNome) {
    const novosOrgaos = orgaos.map((o) =>
      o.nome === orgaoNome
        ? { ...o, responsaveis: (o.responsaveis || []).filter((r) => r !== respNome) }
        : o
    );
    try {
      await atualizarEntidade(eId, entidade.id, { orgaos: novosOrgaos });
      onAtualizada({ ...entidade, orgaos: novosOrgaos });
    } catch {
      toast.error("Erro ao remover responsável");
    }
  }

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Cabeçalho da entidade */}
      <div className="bg-gray-50 px-3 py-2 flex items-center justify-between gap-2">
        {editandoNome ? (
          <div className="flex gap-1.5 flex-1">
            <input
              autoFocus
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") salvarNome(); if (e.key === "Escape") setEditandoNome(false); }}
              className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7b8cd4]"
            />
            <button onClick={salvarNome} disabled={salvando} className="text-xs px-2 py-1 bg-[#1a5ea8] text-white rounded-lg disabled:opacity-40">
              OK
            </button>
            <button onClick={() => setEditandoNome(false)} className="text-xs px-1.5 py-1 border border-gray-200 rounded-lg text-gray-400">
              <X size={11} />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setExpandido(!expandido)}
              className="flex items-center gap-1.5 flex-1 text-left"
            >
              {expandido ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
              <span className="text-xs font-bold text-gray-700">{entidade.nome}</span>
              <span className="text-[10px] text-gray-400">
                ({orgaos.length} instituto{orgaos.length !== 1 ? "s" : ""})
              </span>
            </button>
            <div className="flex gap-1">
              <button onClick={() => setEditandoNome(true)} className="p-1 text-gray-400 hover:text-gray-600">
                <Edit2 size={12} />
              </button>
              <button onClick={handleExcluirEntidade} className="p-1 text-gray-400 hover:text-red-400">
                <Trash2 size={12} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Corpo: lista de orgãos */}
      {expandido && (
        <div className="divide-y divide-gray-50">
          {orgaos.length === 0 && (
            <p className="text-xs text-gray-400 px-3 py-3 text-center italic">
              Nenhum instituto ainda — adicione abaixo
            </p>
          )}
          {orgaos.map((o) => (
            <OrgaoRow
              key={o.nome}
              orgao={o}
              onAtualizarOrgao={(nomeOriginal, novosDados) => editarOrgao(nomeOriginal, novosDados)}
              onAdicionarResp={(nome) => adicionarResponsavel(o.nome, nome)}
              onRemoverResp={(nome)   => removerResponsavel(o.nome, nome)}
              onRemoverOrgao={() => removerOrgao(o.nome)}
            />
          ))}

          {/* Adicionar instituto */}
          <NovoOrgaoRow onAdicionar={adicionarOrgao} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LINHA DE UM ÓRGÃO/INSTITUTO — com dados de contato próprios
// ─────────────────────────────────────────────────────────────────────────────
function OrgaoRow({ orgao, onAtualizarOrgao, onAdicionarResp, onRemoverResp, onRemoverOrgao }) {
  const [editando, setEditando] = useState(false);
  const [form, setForm]         = useState({
    nome:      orgao.nome      || "",
    telefone:  orgao.telefone  || "",
    email:     orgao.email     || "",
    endereco:  orgao.endereco  || "",
    cnpj:      orgao.cnpj      || "",
  });
  const [novoResp, setNovoResp] = useState("");
  const [abrirResp, setAbrirResp] = useState(false);
  const responsaveis = orgao.responsaveis || [];

  function abrirEdicao() {
    setForm({
      nome:     orgao.nome      || "",
      telefone: orgao.telefone  || "",
      email:    orgao.email     || "",
      endereco: orgao.endereco  || "",
      cnpj:     orgao.cnpj      || "",
    });
    setEditando(true);
  }

  function salvarInfo() {
    if (!form.nome.trim()) return;
    onAtualizarOrgao(orgao.nome, {
      nome:      form.nome.trim(),
      telefone:  form.telefone.trim()  || null,
      email:     form.email.trim()     || null,
      endereco:  form.endereco.trim()  || null,
      cnpj:      form.cnpj.trim()      || null,
      responsaveis,
    });
    setEditando(false);
  }

  function handleAdicionarResp() {
    if (!novoResp.trim()) return;
    onAdicionarResp(novoResp.trim());
    setNovoResp("");
  }

  const temContato = orgao.telefone || orgao.email || orgao.endereco;

  return (
    <div className="px-3 py-2.5">
      {/* ── Cabeçalho do instituto ── */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Building2 size={12} className="text-[#7b8cd4] flex-shrink-0" />
          <span className="text-xs font-semibold text-gray-700 truncate">{orgao.nome}</span>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={abrirEdicao} className="p-0.5 text-gray-300 hover:text-[#1a5ea8] transition-colors" title="Editar dados">
            <Edit2 size={11} />
          </button>
          <button onClick={onRemoverOrgao} className="p-0.5 text-gray-300 hover:text-red-400 transition-colors" title="Remover">
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* ── Modo edição: campos de contato ── */}
      {editando ? (
        <div className="ml-5 space-y-1.5 mb-2 bg-blue-50 border border-blue-100 rounded-lg p-2.5">
          <div>
            <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">Nome do instituto</label>
            <input
              autoFocus
              type="text"
              value={form.nome}
              onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7b8cd4] bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">Telefone</label>
              <input
                type="text"
                value={form.telefone}
                placeholder="(19) 3788-0000"
                onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7b8cd4] bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">CNPJ (opcional)</label>
              <input
                type="text"
                value={form.cnpj}
                placeholder="00.000.000/0001-00"
                onChange={(e) => setForm((p) => ({ ...p, cnpj: e.target.value }))}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7b8cd4] bg-white"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">E-mail</label>
            <input
              type="email"
              value={form.email}
              placeholder="contato@instituto.edu.br"
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7b8cd4] bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">Endereço</label>
            <input
              type="text"
              value={form.endereco}
              placeholder="Rua, nº – Bairro – Cidade/UF"
              onChange={(e) => setForm((p) => ({ ...p, endereco: e.target.value }))}
              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7b8cd4] bg-white"
            />
          </div>
          <div className="flex gap-2 pt-0.5">
            <button
              onClick={salvarInfo}
              disabled={!form.nome.trim()}
              className="flex items-center gap-1 text-[11px] bg-[#1a5ea8] text-white px-3 py-1.5 rounded-lg font-semibold disabled:opacity-40"
            >
              <Check size={11} /> Salvar
            </button>
            <button
              onClick={() => setEditando(false)}
              className="text-[11px] border border-gray-200 text-gray-400 px-2.5 py-1.5 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        /* ── Modo visualização: exibe contato se houver ── */
        <div className="ml-5 mb-1.5">
          {temContato ? (
            <div className="space-y-0.5">
              {orgao.telefone && (
                <p className="text-[11px] text-gray-400">📞 {orgao.telefone}</p>
              )}
              {orgao.email && (
                <p className="text-[11px] text-gray-400">✉ {orgao.email}</p>
              )}
              {orgao.endereco && (
                <p className="text-[11px] text-gray-400">📍 {orgao.endereco}</p>
              )}
              {orgao.cnpj && (
                <p className="text-[11px] text-gray-400">CNPJ {orgao.cnpj}</p>
              )}
            </div>
          ) : (
            <button
              onClick={abrirEdicao}
              className="text-[11px] text-gray-300 hover:text-[#1a5ea8] transition-colors"
            >
              + Dados de contato
            </button>
          )}
        </div>
      )}

      {/* ── Responsáveis ── */}
      <div className="ml-5 space-y-1 mt-1">
        {responsaveis.length > 0 && (
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Responsáveis</p>
        )}
        {responsaveis.map((r) => (
          <div key={r} className="flex items-center justify-between group">
            <div className="flex items-center gap-1.5">
              <User size={10} className="text-gray-300" />
              <span className="text-xs text-gray-600">{r}</span>
            </div>
            <button
              onClick={() => onRemoverResp(r)}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-300 hover:text-red-400 transition-all"
            >
              <X size={10} />
            </button>
          </div>
        ))}

        {/* Adicionar responsável */}
        {abrirResp ? (
          <div className="flex gap-1 mt-1">
            <input
              autoFocus
              type="text"
              value={novoResp}
              placeholder="Nome do responsável"
              onChange={(e) => setNovoResp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { handleAdicionarResp(); setAbrirResp(false); }
                if (e.key === "Escape") setAbrirResp(false);
              }}
              className="flex-1 px-2 py-1 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7b8cd4]"
            />
            <button
              onClick={() => { handleAdicionarResp(); setAbrirResp(false); }}
              disabled={!novoResp.trim()}
              className="text-[11px] px-2 py-1 bg-[#1a5ea8] text-white rounded-lg disabled:opacity-40"
            >
              OK
            </button>
            <button onClick={() => setAbrirResp(false)} className="px-1.5 py-1 border border-gray-200 rounded-lg">
              <X size={10} className="text-gray-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAbrirResp(true)}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#1a5ea8] transition-colors mt-0.5"
          >
            <Plus size={10} /> Responsável
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LINHA PARA ADICIONAR NOVO ÓRGÃO/INSTITUTO
// ─────────────────────────────────────────────────────────────────────────────
function NovoOrgaoRow({ onAdicionar }) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome]     = useState("");

  function handleAdicionar() {
    if (!nome.trim()) return;
    onAdicionar(nome.trim());
    setNome("");
    setAberto(false);
  }

  return (
    <div className="px-3 py-2.5 bg-gray-50">
      {aberto ? (
        <div className="flex gap-1.5">
          <input
            autoFocus
            type="text"
            value={nome}
            placeholder="Ex: Instituto de Biologia"
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdicionar(); if (e.key === "Escape") setAberto(false); }}
            className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7b8cd4]"
          />
          <button
            onClick={handleAdicionar}
            disabled={!nome.trim()}
            className="text-xs px-2.5 py-1.5 bg-[#1a5ea8] text-white rounded-lg disabled:opacity-40"
          >
            OK
          </button>
          <button onClick={() => setAberto(false)} className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg text-gray-400">
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAberto(true)}
          className="flex items-center gap-1.5 text-xs text-[#1a5ea8] font-semibold"
        >
          <Plus size={12} /> Novo instituto
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMULÁRIO DE NOVO CLIENTE
// ─────────────────────────────────────────────────────────────────────────────
const VAZIO = { nome: "", telefone: "", email: "", cnpj: "", cpf: "", endereco: "" };

function FormCliente({ eId, onSalvar, onCancelar }) {
  const [form, setForm]         = useState(VAZIO);
  const [salvando, setSalvando] = useState(false);

  function campo(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleSalvar() {
    if (!form.nome.trim()) { toast.error("Nome é obrigatório"); return; }
    setSalvando(true);
    try {
      const dados = { nome: form.nome.trim() };
      if (form.telefone.trim()) dados.telefone = form.telefone.trim();
      if (form.email.trim())    dados.email    = form.email.trim();
      if (form.cnpj.trim())     dados.cnpj     = form.cnpj.trim();
      if (form.cpf.trim())      dados.cpf      = form.cpf.trim();
      if (form.endereco.trim()) dados.endereco = form.endereco.trim();
      const id = await criarCliente(eId, dados);
      toast.success("Cliente cadastrado!");
      onSalvar({ id, ...dados });
    } catch {
      toast.error("Erro ao cadastrar cliente");
    } finally {
      setSalvando(false);
    }
  }

  const F = ({ label, k, placeholder, type = "text" }) => (
    <div>
      <label className="text-xs font-semibold text-gray-500 block mb-0.5">{label}</label>
      <input
        type={type}
        value={form[k]}
        placeholder={placeholder}
        onChange={(e) => campo(k, e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]"
      />
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Novo cliente</p>
      <F label="Nome / Razão Social *" k="nome" placeholder="Nome ou razão social" />
      <F label="Telefone" k="telefone" placeholder="(19) 99999-9999" />
      <F label="E-mail" k="email" placeholder="contato@empresa.com.br" type="email" />
      <div className="grid grid-cols-2 gap-3">
        <F label="CNPJ" k="cnpj" placeholder="00.000.000/0001-00" />
        <F label="CPF" k="cpf" placeholder="000.000.000-00" />
      </div>
      <F label="Endereço" k="endereco" placeholder="Rua, nº – Bairro – Cidade/UF" />
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSalvar}
          disabled={!form.nome.trim() || salvando}
          className="flex-1 bg-[#1a5ea8] text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all"
        >
          {salvando ? "Salvando..." : "Salvar cliente"}
        </button>
        <button
          onClick={onCancelar}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
