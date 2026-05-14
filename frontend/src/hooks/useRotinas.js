import { useState, useEffect } from "react";

export const VEICULOS = ["Kombi", "Fiorino", "Strada", "Celta"];

// EPIs sempre aparecem em qualquer veículo
export const EPIS = [
  { id: "luvas",    categoria: "EPIs", item: "Luvas de proteção" },
  { id: "oculos",   categoria: "EPIs", item: "Óculos de segurança" },
  { id: "calcado",  categoria: "EPIs", item: "Calçado de segurança" },
  { id: "uniforme", categoria: "EPIs", item: "Uniforme completo" },
];

export const FERRAMENTAS_POR_VEICULO = {
  Kombi: [
    // Ferramentas
    { id: "k_molas",         categoria: "Ferramentas", item: "Molas 3/8, 1/4, 1/4, 5/16" },
    { id: "k_expansor",      categoria: "Ferramentas", item: "Expansor" },
    { id: "k_flangeador",    categoria: "Ferramentas", item: "Flangeador" },
    { id: "k_torquimetro",   categoria: "Ferramentas", item: "Torquímetro" },
    { id: "k_martelo",       categoria: "Ferramentas", item: "Martelo de borracha" },
    { id: "k_parafusadeira", categoria: "Ferramentas", item: "Parafusadeira Dewalt" },
    { id: "k_baterias",      categoria: "Ferramentas", item: "Baterias Dewalt (03 un.)" },
    { id: "k_carregador",    categoria: "Ferramentas", item: "Carregador Dewalt" },
    { id: "k_esmeril",       categoria: "Ferramentas", item: "Esmerilhadeira" },
    { id: "k_makita",        categoria: "Ferramentas", item: "Makita" },
    { id: "k_serracopo",     categoria: "Ferramentas", item: "Serra copo Bosch" },
    { id: "k_lixadeira",     categoria: "Ferramentas", item: "Lixadeira" },
    { id: "k_bits",          categoria: "Ferramentas", item: "Jogo de bits" },
    { id: "k_brocas",        categoria: "Ferramentas", item: "Jogo de brocas e soquetes" },
    { id: "k_boca_catraca",  categoria: "Ferramentas", item: "Jogo boca/catraca" },
    // Refrigeração
    { id: "k_bomba",         categoria: "Refrigeração", item: "Bomba de vácuo" },
    { id: "k_manometro",     categoria: "Refrigeração", item: "Manômetro" },
    { id: "k_mangueiras",    categoria: "Refrigeração", item: "Mangueiras (manômetro, vácuo, dreno)" },
    { id: "k_bujoes",        categoria: "Refrigeração", item: "Bujões de limpeza" },
    // Elétrico
    { id: "k_multimetro",    categoria: "Elétrico", item: "Multímetro" },
    { id: "k_fios",          categoria: "Elétrico", item: "Fios diversos" },
    { id: "k_ronda",         categoria: "Elétrico", item: "Ronda verde/vermelho" },
    { id: "k_controles",     categoria: "Elétrico", item: "Controles (04 un.)" },
    // Limpeza
    { id: "k_maq_evap",      categoria: "Limpeza", item: "Máquina de limpeza de evaporador" },
    { id: "k_garrafa",       categoria: "Limpeza", item: "Garrafa de limpeza" },
    { id: "k_silicone",      categoria: "Limpeza", item: "Aplicador de silicone" },
    { id: "k_k2pilco",       categoria: "Limpeza", item: "K2 / Pilco" },
    { id: "k_tocha",         categoria: "Limpeza", item: "Tubo de tocha" },
    // Veículo
    { id: "k_nivel",         categoria: "Veículo", item: "Nível Dexter" },
    { id: "k_lanterna",      categoria: "Veículo", item: "Lanterna de cabeça" },
    { id: "k_pneu",          categoria: "Veículo", item: "Estepe e pneus verificados" },
    { id: "k_combustivel",   categoria: "Veículo", item: "Combustível abastecido" },
    { id: "k_limpeza",       categoria: "Veículo", item: "Interior limpo e organizado" },
  ],

  Fiorino: [
    // Ferramentas
    { id: "f_molas",         categoria: "Ferramentas", item: "Molas (02 No, 5/16, 3/4)" },
    { id: "f_torquimetro",   categoria: "Ferramentas", item: "Torquímetro" },
    { id: "f_martelo",       categoria: "Ferramentas", item: "Martelo c/ fio" },
    { id: "f_hex",           categoria: "Ferramentas", item: "Jogo HEX" },
    { id: "f_parafusadeira", categoria: "Ferramentas", item: "Parafusadeira (02 un.)" },
    { id: "f_baterias",      categoria: "Ferramentas", item: "Baterias Dewalt (03 un.)" },
    { id: "f_carregador",    categoria: "Ferramentas", item: "Carregador Dewalt" },
    { id: "f_arrocho",       categoria: "Ferramentas", item: "Jogo de arrocho" },
    { id: "f_dobrador",      categoria: "Ferramentas", item: "Dobrador de tubo" },
    { id: "f_bits",          categoria: "Ferramentas", item: "Jogo ponta bits" },
    { id: "f_spin",          categoria: "Ferramentas", item: "Spin driver" },
    { id: "f_crimpador",     categoria: "Ferramentas", item: "Crimpador" },
    { id: "f_allen",         categoria: "Ferramentas", item: "Jogo chave allen" },
    { id: "f_boca_catraca",  categoria: "Ferramentas", item: "Jogo chave boca/catraca" },
    { id: "f_lixadeira",     categoria: "Ferramentas", item: "Lixadeira pequena" },
    // Refrigeração
    { id: "f_bomba",         categoria: "Refrigeração", item: "Bomba de vácuo" },
    { id: "f_balanca",       categoria: "Refrigeração", item: "Balança de refrigerante" },
    { id: "f_manometro",     categoria: "Refrigeração", item: "Manômetro" },
    { id: "f_valvula",       categoria: "Refrigeração", item: "Válvula 5/16 / R22" },
    { id: "f_wap",           categoria: "Refrigeração", item: "WAP de água" },
    { id: "f_dreno",         categoria: "Refrigeração", item: "Rolo de dreno" },
    { id: "f_tocha",         categoria: "Refrigeração", item: "Tubo de tocha" },
    // Elétrico
    { id: "f_multimetro",    categoria: "Elétrico", item: "Multímetro" },
    { id: "f_termometro",    categoria: "Elétrico", item: "Termômetro bimetal (220V)" },
    // Limpeza
    { id: "f_maq_evap",      categoria: "Limpeza", item: "Máquina de limpeza de evaporador" },
    { id: "f_garrafa",       categoria: "Limpeza", item: "Garrafa de limpeza" },
    { id: "f_silicone",      categoria: "Limpeza", item: "Aplicador de silicone" },
    { id: "f_dds",           categoria: "Limpeza", item: "Produto limpa evap. DDS (verde)" },
    // Veículo
    { id: "f_lanterna",      categoria: "Veículo", item: "Lanterna de cabeça" },
    { id: "f_porta",         categoria: "Veículo", item: "Porta de carga travada corretamente" },
    { id: "f_pneu",          categoria: "Veículo", item: "Estepe e pneus verificados" },
    { id: "f_combustivel",   categoria: "Veículo", item: "Combustível abastecido" },
    { id: "f_limpeza",       categoria: "Veículo", item: "Interior limpo e organizado" },
  ],

  Strada: [
    { id: "s_parafusadeira", categoria: "Ferramentas", item: "Parafusadeira" },
    { id: "s_baterias",      categoria: "Ferramentas", item: "Baterias Dewalt" },
    { id: "s_carregador",    categoria: "Ferramentas", item: "Carregador Dewalt" },
    { id: "s_bits",          categoria: "Ferramentas", item: "Jogo de bits" },
    { id: "s_boca_catraca",  categoria: "Ferramentas", item: "Jogo boca/catraca" },
    { id: "s_bomba",         categoria: "Refrigeração", item: "Bomba de vácuo" },
    { id: "s_manometro",     categoria: "Refrigeração", item: "Manômetro" },
    { id: "s_balanca",       categoria: "Refrigeração", item: "Balança de refrigerante" },
    { id: "s_multimetro",    categoria: "Elétrico", item: "Multímetro" },
    { id: "s_garrafa",       categoria: "Limpeza", item: "Garrafa de limpeza" },
    { id: "s_silicone",      categoria: "Limpeza", item: "Aplicador de silicone" },
    { id: "s_lona",          categoria: "Veículo", item: "Lona/capota protetora fixada" },
    { id: "s_amarras",       categoria: "Veículo", item: "Cintas de amarração" },
    { id: "s_pneu",          categoria: "Veículo", item: "Estepe e pneus verificados" },
    { id: "s_combustivel",   categoria: "Veículo", item: "Combustível abastecido" },
  ],

  Celta: [
    { id: "c_parafusadeira", categoria: "Ferramentas", item: "Parafusadeira" },
    { id: "c_baterias",      categoria: "Ferramentas", item: "Baterias Dewalt" },
    { id: "c_carregador",    categoria: "Ferramentas", item: "Carregador Dewalt" },
    { id: "c_bits",          categoria: "Ferramentas", item: "Jogo de bits" },
    { id: "c_boca_catraca",  categoria: "Ferramentas", item: "Jogo boca/catraca" },
    { id: "c_bomba",         categoria: "Refrigeração", item: "Bomba de vácuo" },
    { id: "c_manometro",     categoria: "Refrigeração", item: "Manômetro" },
    { id: "c_multimetro",    categoria: "Elétrico", item: "Multímetro" },
    { id: "c_garrafa",       categoria: "Limpeza", item: "Garrafa de limpeza" },
    { id: "c_silicone",      categoria: "Limpeza", item: "Aplicador de silicone" },
    { id: "c_malas",         categoria: "Veículo", item: "Porta-malas organizado" },
    { id: "c_peso",          categoria: "Veículo", item: "Peso dentro da capacidade" },
    { id: "c_pneu",          categoria: "Veículo", item: "Estepe e pneus verificados" },
    { id: "c_combustivel",   categoria: "Veículo", item: "Combustível abastecido" },
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
  const [veiculo, setVeiculoState] = useState(
    () => localStorage.getItem(chaveVeiculo()) || ""
  );

  const checklist = veiculo
    ? [...EPIS, ...(FERRAMENTAS_POR_VEICULO[veiculo] || [])]
    : EPIS;

  const categorias = [...new Set(checklist.map(i => i.categoria))];

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
