// pages/SeedBiblioteca.jsx
// Página temporária para popular a biblioteca de serviços.
// Após rodar o seed, pode remover a rota e este arquivo.
//
// Como usar:
//   1. Adicione em routes.jsx:
//      import SeedBiblioteca from "../pages/SeedBiblioteca";
//      <Route path="/gestor/:empresaId/seed" element={<ProtectedRoutes><SeedBiblioteca /></ProtectedRoutes>} />
//   2. Acesse: /gestor/A.V.M-AR-CAMPINAS/seed
//   3. Clique em "Popular Biblioteca"
//   4. Após concluir, remova a rota e este arquivo.

import { useState } from "react";
import { useParams } from "react-router-dom";
import { addDoc } from "firebase/firestore";
import { bibliotecaRef } from "../config/firebasePaths";
import { EMPRESAID } from "../config/empresa";
import Header from "../components/Header";
import { toast } from "sonner";

// Cada serviço pré-preenche o wizard assim:
//   materiais  → tabela "Equipamentos" (o aparelho em si)
//   maoDeObra  → 1ª linha da tabela "Instalação / Serviço" (preço padrão por unid.)
// O usuário edita livremente no Step 3 do wizard antes de salvar.

const SERVICOS_FORNECIMENTO = [
  {
    nome: "Fornecimento Split Hi-Wall 9.000 BTU/h",
    categoria: "fornecimento",
    descricao: "Fornecimento de ar-condicionado Split Hi-Wall Só Fria 9.000 BTU/h, 220V/60Hz. Equipamento novo, em caixa lacrada, com Certificado INMETRO, Selo Procel A e Manual Técnico. Instalação não inclusa.",
    maoDeObra: 0, margemLucro: 30, valorPorMetroTubulacao: 0,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [],
    opcoesEquipamento: [
      { nome: "Midea Split Hi-Wall 9.000 BTU/h 220V – Inverter", valorUnit: 1850 },
      { nome: "Elgin Split Hi-Wall 9.000 BTU/h 220V – Inverter", valorUnit: 1780 },
      { nome: "Gree Split Hi-Wall 9.000 BTU/h 220V – Inverter", valorUnit: 1920 },
    ],
  },
  {
    nome: "Fornecimento Split Hi-Wall 12.000 BTU/h",
    categoria: "fornecimento",
    descricao: "Fornecimento de ar-condicionado Split Hi-Wall Só Fria 12.000 BTU/h, 220V/60Hz. Equipamento novo, em caixa lacrada, com Certificado INMETRO, Selo Procel A e Manual Técnico. Instalação não inclusa.",
    maoDeObra: 0, margemLucro: 30, valorPorMetroTubulacao: 0,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [],
    opcoesEquipamento: [
      { nome: "Midea Split Hi-Wall 12.000 BTU/h 220V – Inverter", valorUnit: 2100 },
      { nome: "Elgin Split Hi-Wall 12.000 BTU/h 220V – Inverter", valorUnit: 2050 },
      { nome: "Gree Split Hi-Wall 12.000 BTU/h 220V – Inverter", valorUnit: 2200 },
    ],
  },
  {
    nome: "Fornecimento Split Hi-Wall 18.000 BTU/h",
    categoria: "fornecimento",
    descricao: "Fornecimento de ar-condicionado Split Hi-Wall Só Fria 18.000 BTU/h, 220V/60Hz. Equipamento novo, em caixa lacrada, com Certificado INMETRO, Selo Procel A e Manual Técnico. Instalação não inclusa.",
    maoDeObra: 0, margemLucro: 30, valorPorMetroTubulacao: 0,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [],
    opcoesEquipamento: [
      { nome: "Midea Split Hi-Wall 18.000 BTU/h 220V – Inverter", valorUnit: 2750 },
      { nome: "Elgin Split Hi-Wall 18.000 BTU/h 220V – Inverter", valorUnit: 2680 },
      { nome: "Gree Split Hi-Wall 18.000 BTU/h 220V – Inverter", valorUnit: 2850 },
    ],
  },
  {
    nome: "Fornecimento Split Hi-Wall 24.000 BTU/h",
    categoria: "fornecimento",
    descricao: "Fornecimento de ar-condicionado Split Hi-Wall Só Fria 24.000 BTU/h, 220V/60Hz. Equipamento novo, em caixa lacrada, com Certificado INMETRO, Selo Procel A e Manual Técnico. Instalação não inclusa.",
    maoDeObra: 0, margemLucro: 30, valorPorMetroTubulacao: 0,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [],
    opcoesEquipamento: [
      { nome: "Midea Split Hi-Wall 24.000 BTU/h 220V – Inverter", valorUnit: 3450 },
      { nome: "Elgin Split Hi-Wall 24.000 BTU/h 220V – Inverter", valorUnit: 3380 },
      { nome: "Gree Split Hi-Wall 24.000 BTU/h 220V – Inverter", valorUnit: 3580 },
    ],
  },
  {
    nome: "Fornecimento Split Piso-Teto 36.000 BTU/h",
    categoria: "fornecimento",
    descricao: "Fornecimento de ar-condicionado Split Piso-Teto Só Fria 36.000 BTU/h, 220V/60Hz. Equipamento novo, em caixa lacrada, com Certificado INMETRO, Selo Procel A e Manual Técnico. Instalação não inclusa.",
    maoDeObra: 0, margemLucro: 28, valorPorMetroTubulacao: 0,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [],
    opcoesEquipamento: [
      { nome: "Midea Split Piso-Teto 36.000 BTU/h 220V – Inverter", valorUnit: 5500 },
      { nome: "Elgin Split Piso-Teto 36.000 BTU/h 220V – Inverter", valorUnit: 5350 },
      { nome: "Gree Split Piso-Teto 36.000 BTU/h 220V – Inverter", valorUnit: 5700 },
    ],
  },
  {
    nome: "Fornecimento Split Piso-Teto 48.000 BTU/h",
    categoria: "fornecimento",
    descricao: "Fornecimento de ar-condicionado Split Piso-Teto Só Fria 48.000 BTU/h, 220V/60Hz. Equipamento novo, em caixa lacrada, com Certificado INMETRO, Selo Procel A e Manual Técnico. Instalação não inclusa.",
    maoDeObra: 0, margemLucro: 28, valorPorMetroTubulacao: 0,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [],
    opcoesEquipamento: [
      { nome: "Midea Split Piso-Teto 48.000 BTU/h 220V – Inverter", valorUnit: 7000 },
      { nome: "Elgin Split Piso-Teto 48.000 BTU/h 220V – Inverter", valorUnit: 6800 },
      { nome: "Gree Split Piso-Teto 48.000 BTU/h 220V – Inverter", valorUnit: 7200 },
    ],
  },
  {
    nome: "Fornecimento Split Piso-Teto 60.000 BTU/h",
    categoria: "fornecimento",
    descricao: "Fornecimento de ar-condicionado Split Piso-Teto Só Fria 60.000 BTU/h, 220V/60Hz. Equipamento novo, em caixa lacrada, com Certificado INMETRO, Selo Procel A e Manual Técnico. Instalação não inclusa.",
    maoDeObra: 0, margemLucro: 28, valorPorMetroTubulacao: 0,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [],
    opcoesEquipamento: [
      { nome: "Midea Split Piso-Teto 60.000 BTU/h 220V – Inverter", valorUnit: 8825 },
      { nome: "Elgin Split Piso-Teto 60.000 BTU/h 220V – Inverter", valorUnit: 8600 },
      { nome: "Gree Split Piso-Teto 60.000 BTU/h 220V – Inverter", valorUnit: 9100 },
    ],
  },
];

const SERVICOS = [
  {
    nome: "Instalação Split Hi-Wall 9.000 BTU/h",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Hi-Wall Só Fria 9.000 BTU/h, 220V/60Hz. Inclui suporte metálico novo, tubulação de cobre nova e isolada, cabo PB/PP, dreno em PVC, vácuo, carga de gás R-410A e testes de comissionamento. Execução conforme ABNT e NRs aplicáveis.",
    maoDeObra: 550, margemLucro: 30, valorPorMetroTubulacao: 35,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Split Hi-Wall Só Fria 9.000 BTU/h 220V/60Hz", qtd: 1, valorUnit: 1850 },
    ],
  },
  {
    nome: "Instalação Split Hi-Wall 12.000 BTU/h",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Hi-Wall Só Fria 12.000 BTU/h, 220V/60Hz. Inclui suporte metálico novo, tubulação de cobre nova e isolada, cabo PB/PP, dreno em PVC, vácuo, carga de gás R-410A e testes de comissionamento. Execução conforme ABNT e NRs aplicáveis.",
    maoDeObra: 650, margemLucro: 30, valorPorMetroTubulacao: 35,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Split Hi-Wall Só Fria 12.000 BTU/h 220V/60Hz", qtd: 1, valorUnit: 2100 },
    ],
  },
  {
    nome: "Instalação Split Hi-Wall 18.000 BTU/h",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Hi-Wall Só Fria 18.000 BTU/h, 220V/60Hz. Inclui suporte metálico novo, tubulação de cobre nova e isolada, cabo PB/PP, dreno em PVC, vácuo, carga de gás R-410A e testes de comissionamento. Execução conforme ABNT e NRs aplicáveis.",
    maoDeObra: 800, margemLucro: 30, valorPorMetroTubulacao: 38,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Split Hi-Wall Só Fria 18.000 BTU/h 220V/60Hz", qtd: 1, valorUnit: 2750 },
    ],
  },
  {
    nome: "Instalação Split Hi-Wall 24.000 BTU/h",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Hi-Wall Só Fria 24.000 BTU/h, 220V/60Hz. Inclui suporte metálico novo, tubulação de cobre nova e isolada, cabo PB/PP, dreno em PVC, vácuo, carga de gás R-410A e testes de comissionamento. Execução conforme ABNT e NRs aplicáveis.",
    maoDeObra: 950, margemLucro: 30, valorPorMetroTubulacao: 40,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Split Hi-Wall Só Fria 24.000 BTU/h 220V/60Hz", qtd: 1, valorUnit: 3450 },
    ],
  },
  {
    nome: "Instalação Split Piso-Teto 36.000 BTU/h",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Piso-Teto Só Fria 36.000 BTU/h, 220V/60Hz. Inclui suporte metálico novo, tubulação de cobre nova e isolada, canaleta, cabo PB/PP, dreno em PVC, bomba de condensado, vácuo, carga de gás R-410A e testes de comissionamento. Execução conforme ABNT e NRs aplicáveis.",
    maoDeObra: 1800, margemLucro: 28, valorPorMetroTubulacao: 45,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Split Piso-Teto Só Fria 36.000 BTU/h 220V/60Hz", qtd: 1, valorUnit: 5500 },
    ],
  },
  {
    nome: "Instalação Split Piso-Teto 48.000 BTU/h",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Piso-Teto Só Fria 48.000 BTU/h, 220V/60Hz. Inclui suporte metálico novo, tubulação de cobre nova e isolada, canaleta, cabo PB/PP, dreno em PVC, bomba de condensado, vácuo, carga de gás R-410A e testes de comissionamento. Execução conforme ABNT e NRs aplicáveis.",
    maoDeObra: 2200, margemLucro: 28, valorPorMetroTubulacao: 48,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Split Piso-Teto Só Fria 48.000 BTU/h 220V/60Hz", qtd: 1, valorUnit: 7000 },
    ],
  },
  {
    nome: "Instalação Split Piso-Teto 60.000 BTU/h",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Piso-Teto Só Fria 60.000 BTU/h, 220V/60Hz. Inclui suporte metálico novo, tubulação de cobre nova e isolada, canaleta, cabo PB/PP, dreno em PVC, bomba de condensado Elgin FP2210, vácuo, carga de gás R-410A e testes de comissionamento. Execução conforme ABNT (NBR 5410, 14136 e 16401) e NRs aplicáveis, com visita técnica prévia e APR/PT quando necessário. Equipe uniformizada com crachá DSTr/Unicamp.",
    maoDeObra: 2650, margemLucro: 28, valorPorMetroTubulacao: 50,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Split Piso-Teto Só Fria 60.000 BTU/h 220V/60Hz", qtd: 1, valorUnit: 8824.50 },
    ],
  },
  {
    nome: "Manutenção Preventiva",
    categoria: "manutencao",
    descricao: "Manutenção preventiva conforme ABNT NBR 16401 e Portaria 3.523/MS. Inclui limpeza de filtros, evaporador, condensador, verificação de gás, dreno, tensões elétricas e relatório técnico.",
    maoDeObra: 180, margemLucro: 35, valorPorMetroTubulacao: 0,
    garantia: "90 dias",
    materiais: [],
  },
  {
    nome: "Higienização Completa",
    categoria: "higienizacao",
    descricao: "Higienização completa com desmontagem total, lavagem com bactericida/fungicida homologado pela ANVISA, secagem e remontagem. Emissão de laudo técnico.",
    maoDeObra: 280, margemLucro: 35, valorPorMetroTubulacao: 0,
    garantia: "90 dias",
    materiais: [],
  },
  {
    nome: "PMOC – Plano de Manutenção, Operação e Controle",
    categoria: "pmoc",
    descricao: "Elaboração e execução do PMOC conforme Portaria 3.523/98 MS e ABNT NBR 16401. Inspeção de todos os equipamentos, relatório, registro CREA e ART quando aplicável.",
    maoDeObra: 450, margemLucro: 30, valorPorMetroTubulacao: 0,
    garantia: "Vigência do contrato",
    materiais: [],
  },
];

export default function SeedBiblioteca() {
  const { empresaId } = useParams();
  const eId = empresaId || EMPRESAID;

  const [rodando, setRodando]           = useState(false);
  const [log, setLog]                   = useState([]);
  const [concluido, setConcluido]       = useState(false);
  const [rodandoForn, setRodandoForn]   = useState(false);
  const [logForn, setLogForn]           = useState([]);
  const [concluidoForn, setConcluidoForn] = useState(false);

  async function handleSeed() {
    setRodando(true);
    setLog([]);
    let ok = 0;

    for (const s of SERVICOS) {
      try {
        await addDoc(bibliotecaRef(eId), { ...s, criadoEm: new Date(), atualizadoEm: new Date() });
        setLog((p) => [...p, { tipo: "ok", msg: s.nome }]);
        ok++;
      } catch (e) {
        setLog((p) => [...p, { tipo: "erro", msg: `${s.nome}: ${e.message}` }]);
      }
    }

    setConcluido(true);
    setRodando(false);
    toast.success(`${ok}/${SERVICOS.length} serviços criados na biblioteca!`);
  }

  async function handleSeedFornecimento() {
    setRodandoForn(true);
    setLogForn([]);
    let ok = 0;
    for (const s of SERVICOS_FORNECIMENTO) {
      try {
        await addDoc(bibliotecaRef(eId), { ...s, criadoEm: new Date(), atualizadoEm: new Date() });
        setLogForn((p) => [...p, { tipo: "ok", msg: s.nome }]);
        ok++;
      } catch (e) {
        setLogForn((p) => [...p, { tipo: "erro", msg: `${s.nome}: ${e.message}` }]);
      }
    }
    setConcluidoForn(true);
    setRodandoForn(false);
    toast.success(`${ok}/${SERVICOS_FORNECIMENTO.length} serviços de fornecimento criados!`);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Popular Biblioteca" />
      <main className="flex-grow p-4 max-w-lg mx-auto w-full">

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <p className="text-sm font-semibold text-amber-800 mb-1">⚠️ Use apenas uma vez</p>
          <p className="text-xs text-amber-700">
            Este utilitário cria os 10 serviços padrão AVM no Firestore. Se rodar mais de uma vez, irá duplicar os registros.
            Após concluir, remova a rota <code>/seed</code> do routes.jsx.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Serviços que serão criados:</p>
          <div className="space-y-1">
            {SERVICOS.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-4 h-4 rounded-full bg-gray-100 text-gray-400 text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                {s.nome}
              </div>
            ))}
          </div>
        </div>

        {log.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 space-y-1 max-h-48 overflow-y-auto">
            {log.map((l, i) => (
              <div key={i} className={`text-xs flex items-center gap-2 ${l.tipo === "ok" ? "text-green-700" : "text-red-600"}`}>
                <span>{l.tipo === "ok" ? "✓" : "✗"}</span>
                <span>{l.msg}</span>
              </div>
            ))}
          </div>
        )}

        {concluido ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-green-800 mb-1">✓ Biblioteca populada com sucesso!</p>
            <p className="text-xs text-green-700">
              Agora vá em <strong>Biblioteca de Serviços</strong> para conferir e ajustar os valores.
            </p>
          </div>
        ) : (
          <button onClick={handleSeed} disabled={rodando}
            className="w-full bg-[#1a5ea8] text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all">
            {rodando ? `Criando serviços... (${log.length}/${SERVICOS.length})` : "Popular Biblioteca Agora"}
          </button>
        )}

        {/* ── Seção de Fornecimento ── */}
        <div className="mt-8 mb-3">
          <p className="text-sm font-bold text-gray-700">Serviços de Fornecimento</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Pode rodar mesmo que a biblioteca já tenha sido populada — adiciona apenas os modelos de "Fornecimento apenas" (sem instalação), com opções de marca por BTU.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
          <div className="space-y-1">
            {SERVICOS_FORNECIMENTO.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-400 text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                {s.nome}
              </div>
            ))}
          </div>
        </div>

        {logForn.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 space-y-1 max-h-40 overflow-y-auto">
            {logForn.map((l, i) => (
              <div key={i} className={`text-xs flex items-center gap-2 ${l.tipo === "ok" ? "text-green-700" : "text-red-600"}`}>
                <span>{l.tipo === "ok" ? "✓" : "✗"}</span>
                <span>{l.msg}</span>
              </div>
            ))}
          </div>
        )}

        {concluidoForn ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-green-800">✓ Serviços de fornecimento adicionados!</p>
            <p className="text-xs text-green-700 mt-1">
              Agora ao criar um orçamento, escolha um desses serviços no Step 2 — a seção de instalação some automaticamente.
            </p>
          </div>
        ) : (
          <button onClick={handleSeedFornecimento} disabled={rodandoForn}
            className="w-full bg-[#1a7a3a] text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all">
            {rodandoForn
              ? `Criando... (${logForn.length}/${SERVICOS_FORNECIMENTO.length})`
              : "Adicionar Serviços de Fornecimento"}
          </button>
        )}
      </main>
    </div>
  );
}