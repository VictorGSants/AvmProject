// ─────────────────────────────────────────────────────────────────────────
// seedBiblioteca.js
// Popula a coleção servicosBiblioteca com os serviços padrão da AVM.
//
// COMO USAR:
//   1. Cole este arquivo em frontend/src/scripts/seedBiblioteca.js
//   2. Crie uma página temporária no app que importe e chame seedar()
//      (ou execute via console do navegador)
//   3. Após executar, pode deletar o arquivo
// ─────────────────────────────────────────────────────────────────────────

import { addDoc } from "firebase/firestore";
import { bibliotecaRef } from "../config/firebasePaths";
import { EMPRESAID } from "../config/empresa";

const SERVICOS_PADRAO = [
  {
    nome: "Instalação Split Hi-Wall 9.000 BTU",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Hi-Wall 9.000 BTU/h, incluindo suporte metálico novo, tubulação de cobre nova e isolada, cabo PB/PP, dreno em PVC, vácuo, carga de gás R-410A e testes de comissionamento.",
    maoDeObra: 350,
    basePrice: 350,
    margemLucro: 30,
    valorPorMetroTubulacao: 35,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Suporte metálico", qtd: 1, valorUnit: 45 },
      { nome: "Abraçadeira", qtd: 4, valorUnit: 3 },
      { nome: "Fita isolante", qtd: 1, valorUnit: 8 },
      { nome: "Buchas/parafusos", qtd: 1, valorUnit: 12 },
    ],
  },
  {
    nome: "Instalação Split Hi-Wall 12.000 BTU",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Hi-Wall 12.000 BTU/h, incluindo suporte metálico novo, tubulação de cobre nova e isolada, cabo PB/PP, dreno em PVC, vácuo, carga de gás R-410A e testes de comissionamento.",
    maoDeObra: 400,
    basePrice: 400,
    margemLucro: 30,
    valorPorMetroTubulacao: 35,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Suporte metálico", qtd: 1, valorUnit: 45 },
      { nome: "Abraçadeira", qtd: 4, valorUnit: 3 },
      { nome: "Fita isolante", qtd: 1, valorUnit: 8 },
      { nome: "Buchas/parafusos", qtd: 1, valorUnit: 12 },
    ],
  },
  {
    nome: "Instalação Split Hi-Wall 18.000 BTU",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Hi-Wall 18.000 BTU/h, incluindo suporte metálico novo, tubulação de cobre nova e isolada, cabo PB/PP, dreno em PVC, vácuo, carga de gás R-410A e testes de comissionamento.",
    maoDeObra: 480,
    basePrice: 480,
    margemLucro: 30,
    valorPorMetroTubulacao: 38,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Suporte metálico reforçado", qtd: 1, valorUnit: 65 },
      { nome: "Abraçadeira", qtd: 6, valorUnit: 3 },
      { nome: "Fita isolante", qtd: 2, valorUnit: 8 },
      { nome: "Buchas/parafusos", qtd: 1, valorUnit: 15 },
    ],
  },
  {
    nome: "Instalação Split Hi-Wall 24.000 BTU",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Hi-Wall 24.000 BTU/h, incluindo suporte metálico novo, tubulação de cobre nova e isolada, cabo PB/PP, dreno em PVC, vácuo, carga de gás R-410A e testes de comissionamento.",
    maoDeObra: 550,
    basePrice: 550,
    margemLucro: 30,
    valorPorMetroTubulacao: 40,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Suporte metálico reforçado", qtd: 1, valorUnit: 75 },
      { nome: "Abraçadeira", qtd: 6, valorUnit: 3 },
      { nome: "Fita isolante", qtd: 2, valorUnit: 8 },
      { nome: "Buchas/parafusos", qtd: 1, valorUnit: 15 },
    ],
  },
  {
    nome: "Instalação Split Piso-Teto 36.000 BTU",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Piso-Teto 36.000 BTU/h, incluindo suporte metálico novo, tubulação de cobre nova e isolada, canaleta, cabo PB/PP, dreno PVC, bomba de condensado, vácuo, carga de gás R-410A e testes.",
    maoDeObra: 1200,
    basePrice: 1200,
    margemLucro: 28,
    valorPorMetroTubulacao: 45,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Suporte metálico", qtd: 1, valorUnit: 120 },
      { nome: "Bomba de condensado Elgin FP2210", qtd: 1, valorUnit: 180 },
      { nome: "Canaleta 100x50mm", qtd: 2, valorUnit: 35 },
      { nome: "Abraçadeira", qtd: 8, valorUnit: 3 },
    ],
  },
  {
    nome: "Instalação Split Piso-Teto 60.000 BTU",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Piso-Teto 60.000 BTU/h, incluindo suporte metálico novo, tubulação de cobre nova e isolada, canaleta, cabo PB/PP, dreno PVC, bomba de condensado, vácuo, carga de gás R-410A e testes.",
    maoDeObra: 2650,
    basePrice: 2650,
    margemLucro: 28,
    valorPorMetroTubulacao: 50,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Suporte metálico", qtd: 1, valorUnit: 150 },
      { nome: "Bomba de condensado Elgin FP2210", qtd: 1, valorUnit: 220 },
      { nome: "Canaleta 150x75mm", qtd: 3, valorUnit: 48 },
      { nome: "Abraçadeira reforçada", qtd: 8, valorUnit: 5 },
    ],
  },
  {
    nome: "Manutenção Preventiva",
    categoria: "manutencao",
    descricao: "Manutenção preventiva de ar-condicionado conforme ABNT NBR 16401 e Portaria 3.523/MS. Inclui limpeza dos filtros, evaporador, condensador, verificação de gás, dreno, tensões elétricas e emissão de relatório técnico.",
    maoDeObra: 180,
    basePrice: 180,
    margemLucro: 35,
    valorPorMetroTubulacao: 0,
    garantia: "90 dias",
    materiais: [
      { nome: "Produto limpeza evaporador", qtd: 1, valorUnit: 22 },
      { nome: "Produto limpeza condensador", qtd: 1, valorUnit: 18 },
    ],
  },
  {
    nome: "Higienização Completa",
    categoria: "higienizacao",
    descricao: "Higienização completa do ar-condicionado com desmontagem total, lavagem com produto bactericida/fungicida homologado pela ANVISA, secagem e remontagem. Emissão de laudo técnico.",
    maoDeObra: 280,
    basePrice: 280,
    margemLucro: 35,
    valorPorMetroTubulacao: 0,
    garantia: "90 dias",
    materiais: [
      { nome: "Bactericida/fungicida ANVISA", qtd: 1, valorUnit: 45 },
      { nome: "Desengordurante", qtd: 1, valorUnit: 20 },
    ],
  },
  {
    nome: "PMOC – Plano de Manutenção, Operação e Controle",
    categoria: "pmoc",
    descricao: "Elaboração e execução do PMOC conforme Portaria 3.523/98 do Ministério da Saúde e ABNT NBR 16401. Inclui inspeção de todos os equipamentos, emissão de relatório, registro no CREA e ART quando aplicável.",
    maoDeObra: 450,
    basePrice: 450,
    margemLucro: 30,
    valorPorMetroTubulacao: 0,
    garantia: "Vigência do contrato",
    materiais: [],
  },
  {
    nome: "Desinstalação de Equipamento",
    categoria: "instalacao",
    descricao: "Desinstalação de ar-condicionado com remoção e descarte adequado da tubulação e suportes antigos. Por unidade.",
    maoDeObra: 250,
    basePrice: 250,
    margemLucro: 30,
    valorPorMetroTubulacao: 0,
    garantia: "—",
    materiais: [],
  },
];

export async function seedar(empresaId = EMPRESAID) {
  console.log(`Iniciando seed para empresa: ${empresaId}`);
  let criados = 0;
  for (const servico of SERVICOS_PADRAO) {
    try {
      await addDoc(bibliotecaRef(empresaId), {
        ...servico,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      });
      console.log(`✓ ${servico.nome}`);
      criados++;
    } catch (e) {
      console.error(`✗ ${servico.nome}:`, e.message);
    }
  }
  console.log(`\nSeed concluído: ${criados}/${SERVICOS_PADRAO.length} serviços criados.`);
  return criados;
}
