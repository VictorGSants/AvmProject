// pages/SeedEquipamentosPhotoUnicamp.jsx
// Importa os 18 equipamentos do contrato Photo Unicamp (6 evap + 12 cond) no Firestore.
//
// Como usar:
//   1. Acesse: /gestor/A.V.M-AR-CAMPINAS/<contratoId>/seedEquip
//   2. Clique em "Importar Equipamentos"
//   3. Após concluir, remova a rota e este arquivo.

import { useState } from "react";
import { useParams } from "react-router-dom";
import { addDoc } from "firebase/firestore";
import { equipamentosRef } from "../config/firebasePaths";
import { EMPRESAID } from "../config/empresa";
import Header from "../components/Header";
import { toast } from "sonner";

// Evaporadoras: 1º andar (CA01-CA03) | 2º andar (CA04-CA06)
// Condensadoras: todas no Terraço
// Cada evap está vinculada a 2 condensadoras conforme campo "observacoes"
const EQUIPAMENTOS = [

  // ══════════════════════════════════════════════════════════════════
  //  EVAPORADORAS — Hitachi Módulo Ventilador RVT100CXM
  // ══════════════════════════════════════════════════════════════════
  {
    codigo: "CA01",
    nome: "Hitachi Módulo Ventilador",
    tipo: "Módulo Ventilador",
    fabricante: "Hitachi",
    modelo: "RVT100CXM",
    numeroSerie: "RVT1601 000051",
    patrimonio: "08/30795",
    tensao: "220/380/440V",
    frequencia: "60Hz",
    faseamento: "Trifásico",
    protecao: "IPX4",
    fabricacao: "Jan/2016",
    bloco: "1º Andar",
    local: "",
    status: "Ativo",
    gas_refrigerante: "",
    capacidadeDeRefrigeracao: "",
    observacoes: "Evaporadora do conjunto CA01. Condensadoras vinculadas: CA01-2A (08/30801) e CA01-2B (08/30800)",
  },
  {
    codigo: "CA02",
    nome: "Hitachi Módulo Ventilador",
    tipo: "Módulo Ventilador",
    fabricante: "Hitachi",
    modelo: "RVT100CXM",
    numeroSerie: "RVT1601 000050",
    patrimonio: "08/30797",
    tensao: "220/380/440V",
    frequencia: "60Hz",
    faseamento: "Trifásico",
    protecao: "IPX4",
    fabricacao: "Jan/2016",
    bloco: "1º Andar",
    local: "",
    status: "Ativo",
    gas_refrigerante: "",
    capacidadeDeRefrigeracao: "",
    observacoes: "Evaporadora do conjunto CA02. Condensadoras vinculadas: CA02-2A (08/30807) e CA02-2B (08/30806)",
  },
  {
    codigo: "CA03",
    nome: "Hitachi Módulo Ventilador",
    tipo: "Módulo Ventilador",
    fabricante: "Hitachi",
    modelo: "RVT100CXM",
    numeroSerie: "RVT1601 000052",
    patrimonio: "08/30796",
    tensao: "220/380/440V",
    frequencia: "60Hz",
    faseamento: "Trifásico",
    protecao: "IPX4",
    fabricacao: "Jan/2016",
    bloco: "1º Andar",
    local: "",
    status: "Ativo",
    gas_refrigerante: "",
    capacidadeDeRefrigeracao: "",
    observacoes: "Evaporadora do conjunto CA03. Condensadoras vinculadas: CA03-3A (08/30805) e CA03-3B (08/30805)",
  },
  {
    codigo: "CA04",
    nome: "Hitachi Módulo Ventilador",
    tipo: "Módulo Ventilador",
    fabricante: "Hitachi",
    modelo: "RVT100CXM",
    numeroSerie: "RVT1601 000049",
    patrimonio: "08/30792",
    tensao: "220/380/440V",
    frequencia: "60Hz",
    faseamento: "Trifásico",
    protecao: "IPX4",
    fabricacao: "Jan/2016",
    bloco: "2º Andar",
    local: "",
    status: "Ativo",
    gas_refrigerante: "",
    capacidadeDeRefrigeracao: "",
    observacoes: "Evaporadora do conjunto CA04. Condensadoras vinculadas: CA04-2A (08/30799) e CA04-2B (08/30798)",
  },
  {
    codigo: "CA05",
    nome: "Hitachi Módulo Ventilador",
    tipo: "Módulo Ventilador",
    fabricante: "Hitachi",
    modelo: "RVT100CXM",
    numeroSerie: "RVT1511 062441",
    patrimonio: "08/30794",
    tensao: "220/380/440V",
    frequencia: "60Hz",
    faseamento: "Trifásico",
    protecao: "IPX4",
    fabricacao: "Dez/2015",
    bloco: "2º Andar",
    local: "",
    status: "Ativo",
    gas_refrigerante: "",
    capacidadeDeRefrigeracao: "",
    observacoes: "Evaporadora do conjunto CA05. Condensadoras vinculadas: CA05-2A (08/30803) e CA05-2B (08/30802)",
  },
  {
    codigo: "CA06",
    nome: "Hitachi Módulo Ventilador",
    tipo: "Módulo Ventilador",
    fabricante: "Hitachi",
    modelo: "RVT100CXM",
    numeroSerie: "RVT1601 000054",
    patrimonio: "08/30793",
    tensao: "220/380/440V",
    frequencia: "60Hz",
    faseamento: "Trifásico",
    protecao: "IPX4",
    fabricacao: "Jan/2016",
    bloco: "2º Andar",
    local: "",
    status: "Ativo",
    gas_refrigerante: "",
    capacidadeDeRefrigeracao: "",
    observacoes: "Evaporadora do conjunto CA06. Condensadoras vinculadas: CA06-2A (08/30808) e CA06-2B (08/30809)",
  },

  // ══════════════════════════════════════════════════════════════════
  //  CONDENSADORAS — Terraço
  // ══════════════════════════════════════════════════════════════════

  // — CA01 —
  {
    codigo: "CA01-2A",
    nome: "Hitachi Condensadora",
    tipo: "Condensadora",
    fabricante: "Hitachi",
    modelo: "RVT100CXM",
    numeroSerie: "",
    patrimonio: "08/30801",
    tensao: "220/380/440V",
    frequencia: "60Hz",
    faseamento: "Trifásico",
    protecao: "IPX4",
    fabricacao: "",
    bloco: "Terraço",
    local: "",
    status: "Ativo",
    gas_refrigerante: "",
    capacidadeDeRefrigeracao: "",
    observacoes: "Condensadora A do conjunto CA01. Evaporadora vinculada: CA01 (08/30795)",
  },
  {
    codigo: "CA01-2B",
    nome: "Hitachi Condensadora",
    tipo: "Condensadora",
    fabricante: "Hitachi",
    modelo: "RVT100CXM",
    numeroSerie: "",
    patrimonio: "08/30800",
    tensao: "220/380/440V",
    frequencia: "60Hz",
    faseamento: "Trifásico",
    protecao: "IPX4",
    fabricacao: "",
    bloco: "Terraço",
    local: "",
    status: "Ativo",
    gas_refrigerante: "",
    capacidadeDeRefrigeracao: "",
    observacoes: "Condensadora B do conjunto CA01. Evaporadora vinculada: CA01 (08/30795)",
  },

  // — CA02 —
  {
    codigo: "CA02-2A",
    nome: "Hitachi Condensadora",
    tipo: "Condensadora",
    fabricante: "Hitachi",
    modelo: "RVT100CXM",
    numeroSerie: "",
    patrimonio: "08/30807",
    tensao: "220/380/440V",
    frequencia: "60Hz",
    faseamento: "Trifásico",
    protecao: "IPX4",
    fabricacao: "",
    bloco: "Terraço",
    local: "",
    status: "Ativo",
    gas_refrigerante: "",
    capacidadeDeRefrigeracao: "",
    observacoes: "Condensadora A do conjunto CA02. Evaporadora vinculada: CA02 (08/30797)",
  },
  {
    codigo: "CA02-2B",
    nome: "Hitachi Condensadora",
    tipo: "Condensadora",
    fabricante: "Hitachi",
    modelo: "RVT100CXM",
    numeroSerie: "",
    patrimonio: "08/30806",
    tensao: "220/380/440V",
    frequencia: "60Hz",
    faseamento: "Trifásico",
    protecao: "IPX4",
    fabricacao: "",
    bloco: "Terraço",
    local: "",
    status: "Ativo",
    gas_refrigerante: "",
    capacidadeDeRefrigeracao: "",
    observacoes: "Condensadora B do conjunto CA02. Evaporadora vinculada: CA02 (08/30797)",
  },

  // — CA03 —
  {
    codigo: "CA03-3A",
    nome: "Hitachi Condensadora",
    tipo: "Condensadora",
    fabricante: "Hitachi",
    modelo: "RVT100CXM",
    numeroSerie: "",
    patrimonio: "08/30805",
    tensao: "220/380/440V",
    frequencia: "60Hz",
    faseamento: "Trifásico",
    protecao: "IPX4",
    fabricacao: "",
    bloco: "Terraço",
    local: "",
    status: "Ativo",
    gas_refrigerante: "",
    capacidadeDeRefrigeracao: "",
    observacoes: "Condensadora A do conjunto CA03. Evaporadora vinculada: CA03 (08/30796)",
  },
  {
    codigo: "CA03-3B",
    nome: "Hitachi Condensadora",
    tipo: "Condensadora",
    fabricante: "Hitachi",
    modelo: "RVT100CXM",
    numeroSerie: "",
    patrimonio: "08/30805",
    tensao: "220/380/440V",
    frequencia: "60Hz",
    faseamento: "Trifásico",
    protecao: "IPX4",
    fabricacao: "",
    bloco: "Terraço",
    local: "",
    status: "Ativo",
    gas_refrigerante: "",
    capacidadeDeRefrigeracao: "",
    observacoes: "Condensadora B do conjunto CA03. Evaporadora vinculada: CA03 (08/30796). Atenção: patrimônio igual à 3A — verificar in loco.",
  },

  // — CA04 —
  {
    codigo: "CA04-2A",
    nome: "Hitachi Condensadora",
    tipo: "Condensadora",
    fabricante: "Hitachi",
    modelo: "RVT100CXM",
    numeroSerie: "",
    patrimonio: "08/30799",
    tensao: "220/380/440V",
    frequencia: "60Hz",
    faseamento: "Trifásico",
    protecao: "IPX4",
    fabricacao: "",
    bloco: "Terraço",
    local: "",
    status: "Ativo",
    gas_refrigerante: "",
    capacidadeDeRefrigeracao: "",
    observacoes: "Condensadora A do conjunto CA04. Evaporadora vinculada: CA04 (08/30792)",
  },
  {
    codigo: "CA04-2B",
    nome: "Hitachi Condensadora",
    tipo: "Condensadora",
    fabricante: "Hitachi",
    modelo: "RVT100CXM",
    numeroSerie: "",
    patrimonio: "08/30798",
    tensao: "220/380/440V",
    frequencia: "60Hz",
    faseamento: "Trifásico",
    protecao: "IPX4",
    fabricacao: "",
    bloco: "Terraço",
    local: "",
    status: "Ativo",
    gas_refrigerante: "",
    capacidadeDeRefrigeracao: "",
    observacoes: "Condensadora B do conjunto CA04. Evaporadora vinculada: CA04 (08/30792)",
  },

  // — CA05 —
  {
    codigo: "CA05-2A",
    nome: "Hitachi Condensadora",
    tipo: "Condensadora",
    fabricante: "Hitachi",
    modelo: "RVT100CXM",
    numeroSerie: "",
    patrimonio: "08/30803",
    tensao: "220/380/440V",
    frequencia: "60Hz",
    faseamento: "Trifásico",
    protecao: "IPX4",
    fabricacao: "",
    bloco: "Terraço",
    local: "",
    status: "Ativo",
    gas_refrigerante: "",
    capacidadeDeRefrigeracao: "",
    observacoes: "Condensadora A do conjunto CA05. Evaporadora vinculada: CA05 (08/30794)",
  },
  {
    codigo: "CA05-2B",
    nome: "Hitachi Condensadora",
    tipo: "Condensadora",
    fabricante: "Hitachi",
    modelo: "RVT100CXM",
    numeroSerie: "",
    patrimonio: "08/30802",
    tensao: "220/380/440V",
    frequencia: "60Hz",
    faseamento: "Trifásico",
    protecao: "IPX4",
    fabricacao: "",
    bloco: "Terraço",
    local: "",
    status: "Ativo",
    gas_refrigerante: "",
    capacidadeDeRefrigeracao: "",
    observacoes: "Condensadora B do conjunto CA05. Evaporadora vinculada: CA05 (08/30794)",
  },

  // — CA06 —
  {
    codigo: "CA06-2A",
    nome: "Hitachi Condensadora",
    tipo: "Condensadora",
    fabricante: "Hitachi",
    modelo: "RVT100CXM",
    numeroSerie: "",
    patrimonio: "08/30808",
    tensao: "220/380/440V",
    frequencia: "60Hz",
    faseamento: "Trifásico",
    protecao: "IPX4",
    fabricacao: "",
    bloco: "Terraço",
    local: "",
    status: "Ativo",
    gas_refrigerante: "",
    capacidadeDeRefrigeracao: "",
    observacoes: "Condensadora A do conjunto CA06. Evaporadora vinculada: CA06 (08/30793)",
  },
  {
    codigo: "CA06-2B",
    nome: "Hitachi Condensadora",
    tipo: "Condensadora",
    fabricante: "Hitachi",
    modelo: "RVT100CXM",
    numeroSerie: "",
    patrimonio: "08/30809",
    tensao: "220/380/440V",
    frequencia: "60Hz",
    faseamento: "Trifásico",
    protecao: "IPX4",
    fabricacao: "",
    bloco: "Terraço",
    local: "",
    status: "Ativo",
    gas_refrigerante: "",
    capacidadeDeRefrigeracao: "",
    observacoes: "Condensadora B do conjunto CA06. Evaporadora vinculada: CA06 (08/30793)",
  },
];

export default function SeedEquipamentosPhotoUnicamp() {
  const { empresaId, contratoId } = useParams();
  const eId = empresaId || EMPRESAID;

  const [rodando, setRodando] = useState(false);
  const [log, setLog] = useState([]);
  const [concluido, setConcluido] = useState(false);

  async function handleSeed() {
    if (!contratoId) {
      toast.error("contratoId não encontrado na URL.");
      return;
    }

    setRodando(true);
    setLog([]);
    let ok = 0;

    for (const equip of EQUIPAMENTOS) {
      try {
        await addDoc(equipamentosRef(eId, contratoId), {
          ...equip,
          criadoEm: new Date(),
        });
        setLog((p) => [...p, { tipo: "ok", msg: `${equip.codigo} — ${equip.tipo}` }]);
        ok++;
      } catch (e) {
        setLog((p) => [...p, { tipo: "erro", msg: `${equip.codigo}: ${e.message}` }]);
      }
    }

    setConcluido(true);
    setRodando(false);
    toast.success(`${ok}/${EQUIPAMENTOS.length} equipamentos cadastrados!`);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Importar Equipamentos — Photo Unicamp" />
      <main className="flex-grow p-4 max-w-lg mx-auto w-full">

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <p className="text-sm font-semibold text-amber-800 mb-1">⚠️ Use apenas uma vez</p>
          <p className="text-xs text-amber-700">
            Este utilitário cadastra os 18 equipamentos do contrato Photo Unicamp (6 evaporadoras + 12 condensadoras).
            Rodar mais de uma vez vai duplicar os registros.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 mb-6 text-sm text-slate-600 space-y-1">
          <p><span className="font-semibold">Empresa:</span> {eId}</p>
          <p><span className="font-semibold">Contrato:</span> {contratoId || <span className="text-red-500">não encontrado na URL</span>}</p>
          <p><span className="font-semibold">Total:</span> {EQUIPAMENTOS.length} equipamentos (6 evap + 12 cond)</p>
        </div>

        {!concluido ? (
          <button
            onClick={handleSeed}
            disabled={rodando || !contratoId}
            className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {rodando ? "Importando..." : "Importar Equipamentos"}
          </button>
        ) : (
          <div className="w-full bg-green-600 text-white p-3 rounded-xl font-semibold text-center">
            ✓ Importação concluída
          </div>
        )}

        {log.length > 0 && (
          <div className="mt-4 bg-white rounded-2xl shadow p-4 space-y-1 max-h-80 overflow-y-auto">
            {log.map((item, i) => (
              <div key={i} className={`text-xs flex items-center gap-2 ${item.tipo === "ok" ? "text-green-700" : "text-red-600"}`}>
                <span>{item.tipo === "ok" ? "✓" : "✗"}</span>
                <span>{item.msg}</span>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
