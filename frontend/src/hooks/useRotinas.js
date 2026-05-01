import { useState, useEffect } from "react";

export const VEICULOS = ["Kombi", "Fiorino", "Strada", "Celta"];

// Itens comuns a todos os veículos
const CHECKLIST_BASE = [
  { id: "luvas",         categoria: "EPIs",         item: "Luvas de proteção" },
  { id: "oculos",        categoria: "EPIs",         item: "Óculos de segurança" },
  { id: "calcado",       categoria: "EPIs",         item: "Calçado de segurança" },
  { id: "uniforme",      categoria: "EPIs",         item: "Uniforme completo" },
  { id: "chave_fenda",   categoria: "Ferramentas",  item: "Chaves de fenda (jogo)" },
  { id: "alicate_corte", categoria: "Ferramentas",  item: "Alicate de corte" },
  { id: "alicate_univ",  categoria: "Ferramentas",  item: "Alicate universal" },
  { id: "chave_inglesa", categoria: "Ferramentas",  item: "Chave inglesa" },
  { id: "chave_allen",   categoria: "Ferramentas",  item: "Jogo de chaves allen" },
  { id: "chave_grifo",   categoria: "Ferramentas",  item: "Chave grifo" },
  { id: "parafusadeira", categoria: "Ferramentas",  item: "Parafusadeira" },
  { id: "manifold",      categoria: "Refrigeração", item: "Manifold (manômetro)" },
  { id: "bomba_vacuo",   categoria: "Refrigeração", item: "Bomba de vácuo" },
  { id: "balanca",       categoria: "Refrigeração", item: "Balança de refrigerante" },
  { id: "detector_vaz",  categoria: "Refrigeração", item: "Detector de vazamento" },
  { id: "multimetro",    categoria: "Medição",      item: "Multímetro" },
  { id: "termometro",    categoria: "Medição",      item: "Termômetro digital" },
  { id: "amperimetro",   categoria: "Medição",      item: "Alicate amperímetro" },
  { id: "fita_isolante", categoria: "Materiais",    item: "Fita isolante" },
  { id: "fita_veda",     categoria: "Materiais",    item: "Fita veda-rosca" },
  { id: "abraçadeiras",  categoria: "Materiais",    item: "Abraçadeiras (jogo)" },
  { id: "estanho",       categoria: "Materiais",    item: "Estanho para solda" },
  { id: "fluxo",         categoria: "Materiais",    item: "Fluxo para solda" },
  { id: "filtro_drier",  categoria: "Materiais",    item: "Filtro secador (reserva)" },
];

// Itens extras específicos por veículo — foco em organização e segurança de carga
const EXTRAS_POR_VEICULO = {
  Kombi: [
    { id: "kombi_grade",       categoria: "Veículo", item: "Grade divisória posicionada" },
    { id: "kombi_pneu",        categoria: "Veículo", item: "Estepe e pneus verificados" },
    { id: "kombi_combustivel", categoria: "Veículo", item: "Combustível abastecido" },
    { id: "kombi_limpeza",     categoria: "Veículo", item: "Interior limpo e organizado" },
  ],
  Fiorino: [
    { id: "fiorino_porta",       categoria: "Veículo", item: "Porta de carga travada corretamente" },
    { id: "fiorino_pneu",        categoria: "Veículo", item: "Estepe e pneus verificados" },
    { id: "fiorino_combustivel", categoria: "Veículo", item: "Combustível abastecido" },
    { id: "fiorino_limpeza",     categoria: "Veículo", item: "Interior limpo e organizado" },
  ],
  Strada: [
    { id: "strada_lona",        categoria: "Veículo", item: "Lona/capota protetora fixada" },
    { id: "strada_amarra",      categoria: "Veículo", item: "Cintas de amarração para equipamentos" },
    { id: "strada_pneu",        categoria: "Veículo", item: "Estepe e pneus verificados" },
    { id: "strada_combustivel", categoria: "Veículo", item: "Combustível abastecido" },
  ],
  Celta: [
    { id: "celta_malas",        categoria: "Veículo", item: "Porta-malas organizado e seguro" },
    { id: "celta_peso",         categoria: "Veículo", item: "Equipamentos dentro da capacidade do veículo" },
    { id: "celta_combustivel",  categoria: "Veículo", item: "Combustível abastecido" },
  ],
};

function chaveStorage(veiculo) {
  const uid = localStorage.getItem("uid") || "tecnico";
  const hoje = new Date().toDateString();
  return `rotinas_${uid}_${hoje}_${veiculo || "base"}`;
}

function chaveVeiculo() {
  return `veiculo_tecnico_${localStorage.getItem("uid") || "tec"}`;
}

export function useRotinas() {
  // Veículo persiste entre sessões (técnico costuma usar o mesmo veículo)
  const [veiculo, setVeiculoState] = useState(
    () => localStorage.getItem(chaveVeiculo()) || ""
  );

  const checklist = veiculo
    ? [...CHECKLIST_BASE, ...(EXTRAS_POR_VEICULO[veiculo] || [])]
    : CHECKLIST_BASE;

  const categorias = [...new Set(checklist.map(i => i.categoria))];

  // Marcados são salvos por dia + veículo: ao trocar o veículo ou no dia seguinte zera
  const [marcados, setMarcados] = useState(() => {
    try {
      const salvo = localStorage.getItem(chaveStorage(veiculo));
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(chaveStorage(veiculo), JSON.stringify(marcados));
  }, [marcados, veiculo]);

  function setVeiculo(novoVeiculo) {
    setVeiculoState(novoVeiculo);
    localStorage.setItem(chaveVeiculo(), novoVeiculo);
    // Carrega checklist salvo do novo veículo (ou começa do zero)
    try {
      const salvo = localStorage.getItem(chaveStorage(novoVeiculo));
      setMarcados(salvo ? JSON.parse(salvo) : []);
    } catch {
      setMarcados([]);
    }
  }

  function toggleItem(id) {
    setMarcados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  function resetar() {
    setMarcados([]);
  }

  return {
    checklist,
    categorias,
    marcados,
    veiculo,
    setVeiculo,
    total: checklist.length,
    totalMarcado: marcados.length,
    toggleItem,
    resetar,
  };
}
