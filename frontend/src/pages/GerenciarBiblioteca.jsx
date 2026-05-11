import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Header from "../components/Header";
import {
  listarBiblioteca, criarServico,
  atualizarServico, excluirServico,
} from "../services/bibliotecaService";
import { fmtBRL } from "../services/orcamentoService";
import { EMPRESAID } from "../config/empresa";
import { toast } from "sonner";

const EMPTY = {
  nome: "", categoria: "instalacao", descricao: "",
  maoDeObra: 0, basePrice: 0, margemLucro: 30,
  valorPorMetroTubulacao: 35, garantia: "12 meses peças / 36 meses compressor",
  materiais: [],
  opcoesEquipamento: [],
};

export default function GerenciarBiblioteca() {
  const { empresaId } = useParams();
  const eId = empresaId || EMPRESAID;

  const [servicos, setServicos] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editando, setEditando] = useState(null); // null = fechado, {} = novo, obj = editar
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    carregar();
  }, [eId]);

  async function carregar() {
    setLoading(true);
    listarBiblioteca(eId)
      .then(setServicos)
      .catch((err) => {
        console.error("Erro ao carregar biblioteca:", err);
        toast.error("Erro ao carregar biblioteca: " + err.message);
      })
      .finally(() => setLoading(false));
  }

  async function handleSalvar(dados) {
    try {
      if (dados.id) {
        const { id, ...rest } = dados;
        await atualizarServico(eId, id, rest);
        toast.success("Serviço atualizado");
      } else {
        await criarServico(eId, dados);
        toast.success("Serviço adicionado");
      }
      setEditando(null);
      carregar();
    } catch {
      toast.error("Erro ao salvar serviço");
    }
  }

  async function handleExcluir(id) {
    if (!confirm("Excluir este serviço da biblioteca?")) return;
    try {
      await excluirServico(eId, id);
      setServicos((prev) => prev.filter((s) => s.id !== id));
      toast.success("Serviço removido");
    } catch {
      toast.error("Erro ao excluir");
    }
  }

  const categorias = {
    instalacao:  "Instalação",
    manutencao:  "Manutenção",
    higienizacao:"Higienização",
    pmoc:        "PMOC",
    outro:       "Outro",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Biblioteca de Serviços" />

      <main className="flex-grow p-4 max-w-lg mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            {servicos.length} serviço(s) cadastrado(s)
          </p>
          <button
            onClick={() => setEditando({ ...EMPTY })}
            className="flex items-center gap-1.5 bg-[#1a5ea8] text-white px-3 py-2 rounded-xl text-sm font-semibold"
          >
            <Plus size={15} /> Novo
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Carregando...</p>
        ) : servicos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm mb-4">Nenhum serviço na biblioteca ainda.</p>
            <button
              onClick={() => setEditando({ ...EMPTY })}
              className="text-[#1a5ea8] text-sm font-semibold"
            >
              Adicionar primeiro serviço →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {servicos.map((s) => (
              <div key={s.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => setExpandido(expandido === s.id ? null : s.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{s.nome}</p>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {categorias[s.categoria] ?? s.categoria}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-sm font-bold text-gray-600">{fmtBRL(s.maoDeObra)}</span>
                    {expandido === s.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>

                {expandido === s.id && (
                  <div className="border-t border-gray-100 px-4 pb-4">
                    {s.descricao && (
                      <p className="text-xs text-gray-500 mt-3 mb-2">{s.descricao}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-gray-400">Mão de obra</p>
                        <p className="font-semibold text-gray-700">{fmtBRL(s.maoDeObra)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-gray-400">Margem de lucro</p>
                        <p className="font-semibold text-gray-700">{s.margemLucro ?? 30}%</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-gray-400">R$/metro tubulação</p>
                        <p className="font-semibold text-gray-700">{fmtBRL(s.valorPorMetroTubulacao ?? 35)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-gray-400">Garantia</p>
                        <p className="font-semibold text-gray-700 text-[10px]">{s.garantia || "—"}</p>
                      </div>
                    </div>

                    {(s.materiais?.length > 0) && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Materiais padrão</p>
                        <div className="space-y-1">
                          {s.materiais.map((m, i) => (
                            <div key={i} className="flex justify-between text-xs text-gray-600">
                              <span>{m.nome} × {m.qtd}</span>
                              <span>{fmtBRL(m.valorUnit)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditando({ ...s })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600"
                      >
                        <Pencil size={12} /> Editar
                      </button>
                      <button
                        onClick={() => handleExcluir(s.id)}
                        className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-red-100 text-xs font-semibold text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de edição / criação */}
      {editando !== null && (
        <FormServico
          dados={editando}
          categorias={categorias}
          onSalvar={handleSalvar}
          onFechar={() => setEditando(null)}
        />
      )}
    </div>
  );
}

// ── Formulário modal ───────────────────────────────────────────────────────
function FormServico({ dados, categorias, onSalvar, onFechar }) {
  const [form, setForm]       = useState(dados);
  const [materiais, setMateriais] = useState(dados.materiais || []);
  const [opcoes, setOpcoes]   = useState(dados.opcoesEquipamento || []);

  function set(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function addMaterial() {
    setMateriais((prev) => [...prev, { nome: "", qtd: 1, valorUnit: 0 }]);
  }
  function setMat(i, campo, valor) {
    setMateriais((prev) => {
      const copia = [...prev];
      copia[i] = { ...copia[i], [campo]: valor };
      return copia;
    });
  }
  function removeMat(i) {
    setMateriais((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addOpcao() {
    setOpcoes((prev) => [...prev, { nome: "", valorUnit: 0 }]);
  }
  function setOpc(i, campo, valor) {
    setOpcoes((prev) => {
      const copia = [...prev];
      copia[i] = { ...copia[i], [campo]: valor };
      return copia;
    });
  }
  function removeOpc(i) {
    setOpcoes((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit() {
    if (!form.nome?.trim()) {
      toast.error("Informe o nome do serviço");
      return;
    }
    onSalvar({ ...form, materiais, opcoesEquipamento: opcoes });
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-800">
            {form.id ? "Editar serviço" : "Novo serviço"}
          </h3>
          <button onClick={onFechar} className="text-gray-400 text-xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Nome *</label>
            <input
              type="text"
              placeholder="Ex: Instalação Split 12.000 BTU"
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Categoria</label>
            <select
              value={form.categoria}
              onChange={(e) => set("categoria", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4] bg-white"
            >
              {Object.entries(categorias).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Descrição (texto do orçamento)</label>
            <textarea
              rows={3}
              value={form.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Mão de obra (R$)</label>
              <input type="number" step="0.01" value={form.maoDeObra}
                onChange={(e) => set("maoDeObra", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Margem de lucro (%)</label>
              <input type="number" step="1" value={form.margemLucro}
                onChange={(e) => set("margemLucro", parseFloat(e.target.value) || 30)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">R$/metro tubulação</label>
              <input type="number" step="0.01" value={form.valorPorMetroTubulacao}
                onChange={(e) => set("valorPorMetroTubulacao", parseFloat(e.target.value) || 35)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Garantia</label>
              <input type="text" value={form.garantia}
                onChange={(e) => set("garantia", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]"
              />
            </div>
          </div>

          {/* Opções de Equipamento */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <div>
                <label className="text-xs font-semibold text-gray-600">Opções de Equipamento</label>
                <p className="text-[10px] text-gray-400">Cliente escolhe UMA opção — só o valor selecionado entra no total</p>
              </div>
              <button onClick={addOpcao} className="text-xs text-[#1a5ea8] font-semibold flex items-center gap-1 flex-shrink-0 ml-2">
                <Plus size={12} /> Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {opcoes.map((o, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text" placeholder="Ex: Midea Split 12.000 BTU – Só Fria"
                    value={o.nome}
                    onChange={(e) => setOpc(i, "nome", e.target.value)}
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7b8cd4]"
                  />
                  <input
                    type="number" placeholder="R$" step="0.01" min={0}
                    value={o.valorUnit}
                    onChange={(e) => setOpc(i, "valorUnit", parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7b8cd4]"
                  />
                  <button onClick={() => removeOpc(i)} className="text-red-400 p-1">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {opcoes.length === 0 && (
                <p className="text-[10px] text-gray-400 py-1">Nenhuma opção — use para serviços onde o cliente escolhe a marca/modelo.</p>
              )}
            </div>
          </div>

          {/* Materiais */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div>
                <label className="text-xs font-semibold text-gray-600">Materiais / Acessórios padrão</label>
                <p className="text-[10px] text-gray-400">Itens sempre incluídos (suporte, abraçadeiras, etc.)</p>
              </div>
              <button onClick={addMaterial} className="text-xs text-[#1a5ea8] font-semibold flex items-center gap-1 flex-shrink-0 ml-2">
                <Plus size={12} /> Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {materiais.map((m, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text" placeholder="Nome do material"
                    value={m.nome}
                    onChange={(e) => setMat(i, "nome", e.target.value)}
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7b8cd4]"
                  />
                  <input
                    type="number" placeholder="Qtd" min={1}
                    value={m.qtd}
                    onChange={(e) => setMat(i, "qtd", parseInt(e.target.value) || 1)}
                    className="w-14 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7b8cd4] text-center"
                  />
                  <input
                    type="number" placeholder="R$" step="0.01"
                    value={m.valorUnit}
                    onChange={(e) => setMat(i, "valorUnit", parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7b8cd4]"
                  />
                  <button onClick={() => removeMat(i)} className="text-red-400 p-1">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
          <button onClick={onFechar} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl bg-[#1a5ea8] text-white text-sm font-semibold">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
