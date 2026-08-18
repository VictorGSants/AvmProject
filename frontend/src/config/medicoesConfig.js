// Mapeia o texto literal salvo em evento.tipo (TIPOS_SERVICO, em
// DetalheAgendamento.jsx) para a chave curta usada aqui. Tipos fora deste
// mapa (Revisão, Chamado emergencial, Outro) não têm formulário de medições.
export const TIPO_OS_CHAVE = {
  "Instalação":           "instalacao",
  "Manutenção preventiva": "preventiva",
  "Manutenção corretiva":  "corretiva",
};

// tipo: 'numero' | 'texto' | 'conforme'
// faixaMin/faixaMax: só para 'numero' — fora da faixa exige justificativa.
//
// ATENÇÃO: as faixas abaixo são valores de referência genéricos, não
// validados com o time técnico da empresa. Ajuste aqui antes de confiar
// neles operacionalmente — é o único lugar que precisa mudar.
// Reduzido ao básico (2026-08-17): tirados os campos que exigem instrumento
// específico (manifold, nameplate, comparação com faixa apertada) e que na
// prática ninguém preenche em campo — ex.: estanqueidade, corrente de placa,
// temp. de retorno, pressões de sucção/descarga, dados de fluido refrigerante.
export const MEDICOES_CONFIG = {
  instalacao: [
    { chave: "vacuoFinal",         rotulo: "Vácuo final",              unidade: "µm",  tipo: "numero", faixaMin: 0,   faixaMax: 500,  obrigatorio: true },
    { chave: "tempoVacuo",         rotulo: "Tempo de vácuo",           unidade: "min", tipo: "numero", faixaMin: 15,  faixaMax: 120,  obrigatorio: true },
    { chave: "tensao",             rotulo: "Tensão",                   unidade: "V",   tipo: "numero", faixaMin: 198, faixaMax: 242,  obrigatorio: true },
    { chave: "correnteMedida",     rotulo: "Corrente medida",          unidade: "A",   tipo: "numero", obrigatorio: true },
    { chave: "dreno",              rotulo: "Dreno",                    unidade: "",    tipo: "conforme", obrigatorio: true },
  ],
  preventiva: [
    { chave: "tensao",             rotulo: "Tensão",                   unidade: "V",   tipo: "numero", faixaMin: 198, faixaMax: 242, obrigatorio: true },
    { chave: "correnteCompressor", rotulo: "Corrente do compressor",   unidade: "A",   tipo: "numero", obrigatorio: true },
    { chave: "tempInsuflamento",   rotulo: "Temp. insuflamento",       unidade: "°C",  tipo: "numero", faixaMin: 12, faixaMax: 18, obrigatorio: true },
    { chave: "estadoFiltros",      rotulo: "Estado dos filtros",       unidade: "",    tipo: "conforme", obrigatorio: true },
    { chave: "indicioVazamento",   rotulo: "Indício de vazamento",     unidade: "",    tipo: "conforme", obrigatorio: true },
    { chave: "dreno",              rotulo: "Dreno",                    unidade: "",    tipo: "conforme", obrigatorio: true },
  ],
  corretiva: [
    { chave: "sintomaRelatado",    rotulo: "Sintoma relatado",         unidade: "",    tipo: "texto",  obrigatorio: true },
    { chave: "causaIdentificada",  rotulo: "Causa identificada",       unidade: "",    tipo: "texto",  obrigatorio: true },
    { chave: "tensao",             rotulo: "Tensão",                   unidade: "V",   tipo: "numero", faixaMin: 198, faixaMax: 242, obrigatorio: true },
    { chave: "corrente",           rotulo: "Corrente",                 unidade: "A",   tipo: "numero", obrigatorio: true },
    { chave: "pecasSubstituidas",  rotulo: "Peças substituídas",       unidade: "",    tipo: "texto",  obrigatorio: false },
  ],
};

export function camposParaTipo(tipoServico) {
  const chave = TIPO_OS_CHAVE[tipoServico];
  return chave ? MEDICOES_CONFIG[chave] : [];
}
