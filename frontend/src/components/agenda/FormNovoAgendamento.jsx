import { useState } from "react";
import Modal from "../Modal";
import { VEICULOS } from "../../hooks/useRotinas";

const TIPOS_SERVICO = [
  "Instalação",
  "Manutenção preventiva",
  "Manutenção corretiva",
  "Revisão",
  "Chamado emergencial",
  "Outro",
];

const ESTADO_INICIAL = {
  tecnicosSelecionados: [],
  contratoId: "",
  data: "",
  horaInicio: "",
  horaFim: "",
  tipo: "",
  clienteNome: "",
  endereco: "",
  descricao: "",
  veiculos: [],
};

export default function FormNovoAgendamento({ aberto, onFechar, onSalvar, tecnicos, contratos = [] }) {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  function atualizar(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }));
    if (erros[campo]) setErros(prev => ({ ...prev, [campo]: null }));
  }

  function selecionarContrato(contratoId) {
    const contrato = contratos.find(c => c.id === contratoId);
    setForm(prev => ({
      ...prev,
      contratoId,
      clienteNome: contrato ? contrato.nome : "",
    }));
  }

  function toggleVeiculo(v) {
    setForm(prev => ({
      ...prev,
      veiculos: prev.veiculos.includes(v)
        ? prev.veiculos.filter(x => x !== v)
        : [...prev.veiculos, v],
    }));
  }

  function toggleTecnico(id) {
    setForm(prev => ({
      ...prev,
      tecnicosSelecionados: prev.tecnicosSelecionados.includes(id)
        ? prev.tecnicosSelecionados.filter(t => t !== id)
        : [...prev.tecnicosSelecionados, id],
    }));
    if (erros.tecnicosSelecionados) setErros(prev => ({ ...prev, tecnicosSelecionados: null }));
  }

  function validar() {
    const e = {};
    if (form.tecnicosSelecionados.length === 0) e.tecnicosSelecionados = "Selecione ao menos um técnico.";
    if (!form.data) e.data = "Informe a data.";
    if (!form.horaInicio) e.horaInicio = "Informe a hora de início.";
    if (!form.horaFim) e.horaFim = "Informe a hora de fim.";
    if (form.horaInicio && form.horaFim && form.horaFim <= form.horaInicio)
      e.horaFim = "O horário de fim deve ser após o início.";
    if (!form.tipo) e.tipo = "Selecione o tipo de serviço.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const novosErros = validar();
    if (Object.keys(novosErros).length > 0) { setErros(novosErros); return; }

    setSalvando(true);
    try {
      await onSalvar({
        tecnicos: form.tecnicosSelecionados,
        contratoId: form.contratoId || null,
        inicio: new Date(`${form.data}T${form.horaInicio}`),
        fim: new Date(`${form.data}T${form.horaFim}`),
        tipo: form.tipo,
        clienteNome: form.clienteNome,
        endereco: form.endereco,
        descricao: form.descricao,
        veiculos: form.veiculos,
      });
      setForm(ESTADO_INICIAL);
      onFechar();
    } catch (err) {
      // Erros de conflito de horário chegam aqui via throw no hook
      setErros({ geral: err.message });
    } finally {
      setSalvando(false);
    }
  }

  function handleFechar() {
    setForm(ESTADO_INICIAL);
    setErros({});
    onFechar();
  }

  return (
    <Modal aberto={aberto} onClose={handleFechar} titulo="Novo Agendamento">
      <div className="max-h-[70vh] overflow-y-auto pr-1">
        <form onSubmit={handleSubmit} className="space-y-4">

          {erros.geral && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
              {erros.geral}
            </div>
          )}

          {/* Técnicos como botões toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Técnico(s) <span className="text-red-500">*</span>
            </label>
            {tecnicos.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum técnico cadastrado.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tecnicos.map(tec => (
                  <button
                    key={tec.id}
                    type="button"
                    onClick={() => toggleTecnico(tec.id)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      form.tecnicosSelecionados.includes(tec.id)
                        ? "bg-[#7b8cd4] text-white border-[#7b8cd4]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#7b8cd4]"
                    }`}
                  >
                    {tec.nome}
                  </button>
                ))}
              </div>
            )}
            {erros.tecnicosSelecionados && <p className="text-red-500 text-xs mt-1">{erros.tecnicosSelecionados}</p>}
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data <span className="text-red-500">*</span>
            </label>
            <input type="date" value={form.data} onChange={e => atualizar("data", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]" />
            {erros.data && <p className="text-red-500 text-xs mt-1">{erros.data}</p>}
          </div>

          {/* Horários */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Início <span className="text-red-500">*</span></label>
              <input type="time" value={form.horaInicio} onChange={e => atualizar("horaInicio", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]" />
              {erros.horaInicio && <p className="text-red-500 text-xs mt-1">{erros.horaInicio}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fim <span className="text-red-500">*</span></label>
              <input type="time" value={form.horaFim} onChange={e => atualizar("horaFim", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]" />
              {erros.horaFim && <p className="text-red-500 text-xs mt-1">{erros.horaFim}</p>}
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de serviço <span className="text-red-500">*</span></label>
            <select value={form.tipo} onChange={e => atualizar("tipo", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]">
              <option value="">Selecione...</option>
              {TIPOS_SERVICO.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {erros.tipo && <p className="text-red-500 text-xs mt-1">{erros.tipo}</p>}
          </div>

          {/* Contrato */}
          {contratos.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contrato</label>
              <select
                value={form.contratoId}
                onChange={e => selecionarContrato(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]"
              >
                <option value="">— Selecione um contrato —</option>
                {contratos.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          )}

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente / Local</label>
            <input type="text" value={form.clienteNome} onChange={e => atualizar("clienteNome", e.target.value)}
              placeholder="Nome do cliente ou local"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]" />
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <input type="text" value={form.endereco} onChange={e => atualizar("endereco", e.target.value)}
              placeholder="Rua, número, bairro, cidade"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b8cd4]" />
          </div>

          {/* Veículos — seleção múltipla */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Veículo(s)
              {form.veiculos.length > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  {form.veiculos.join(", ")}
                </span>
              )}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VEICULOS.map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggleVeiculo(v)}
                  className={`py-2 rounded-xl text-sm font-semibold border transition-all active:scale-95 ${
                    form.veiculos.includes(v)
                      ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#7b8cd4]"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea value={form.descricao} onChange={e => atualizar("descricao", e.target.value)}
              rows={3} placeholder="Detalhes do serviço, equipamentos, etc."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b8cd4] resize-none" />
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleFechar}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={salvando}
              className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-[#7b8cd4] rounded-lg hover:bg-[#6677be] transition-colors disabled:opacity-50">
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
