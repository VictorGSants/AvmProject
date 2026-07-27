import {
  getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, limit, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { orcamentosRef, orcamentoDoc } from "../config/firebasePaths";

// Status possíveis
export const STATUS = {
  RASCUNHO: "rascunho",
  ENVIADO:  "enviado",
  APROVADO: "aprovado",
  RECUSADO: "recusado",
};

// ── Listar orçamentos (mais recentes primeiro) ─────────────────────────────
export async function listarOrcamentos(empresaId) {
  const q = query(orcamentosRef(empresaId), orderBy("criadoEm", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Listar orçamentos de um cliente específico ─────────────────────────────
export async function listarOrcamentosCliente(empresaId, clienteId) {
  const q = query(
    orcamentosRef(empresaId),
    where("clienteId", "==", clienteId),
    orderBy("criadoEm", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Obter orçamento por ID ─────────────────────────────────────────────────
export async function obterOrcamento(empresaId, orcamentoId) {
  const snap = await getDoc(orcamentoDoc(empresaId, orcamentoId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ── Criar orçamento ────────────────────────────────────────────────────────
// dados: { clienteId, clienteNome, servicoId, servicoNome, itens[], 
//          variaveis{}, calculo{}, precoFinal, observacoes, status }
export async function criarOrcamento(empresaId, dados) {
  // Gera número sequencial simples baseado em timestamp
  const numero = `ORC-${Date.now().toString().slice(-6)}`;
  const ref = await addDoc(orcamentosRef(empresaId), {
    ...dados,
    numero,
    status: dados.status || STATUS.RASCUNHO,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
  return { id: ref.id, numero };
}

// ── Atualizar orçamento ────────────────────────────────────────────────────
export async function atualizarOrcamento(empresaId, orcamentoId, dados) {
  await updateDoc(orcamentoDoc(empresaId, orcamentoId), {
    ...dados,
    atualizadoEm: serverTimestamp(),
  });
}

// ── Atualizar status do orçamento ──────────────────────────────────────────
export async function atualizarStatus(empresaId, orcamentoId, novoStatus) {
  await updateDoc(orcamentoDoc(empresaId, orcamentoId), {
    status: novoStatus,
    atualizadoEm: serverTimestamp(),
  });
}

// ── Excluir orçamento ──────────────────────────────────────────────────────
export async function excluirOrcamento(empresaId, orcamentoId) {
  await deleteDoc(orcamentoDoc(empresaId, orcamentoId));
}

// ── Helper: cor do badge de status ────────────────────────────────────────
export function corStatus(status) {
  const map = {
    rascunho: "bg-gray-100 text-gray-600",
    enviado:  "bg-blue-100 text-blue-700",
    aprovado: "bg-green-100 text-green-700",
    recusado: "bg-red-100 text-red-600",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

export function labelStatus(status) {
  const map = {
    rascunho: "Rascunho",
    enviado:  "Enviado",
    aprovado: "Aprovado",
    recusado: "Recusado",
  };
  return map[status] ?? status;
}

// ── Helper: formatar valor em BRL ──────────────────────────────────────────
export function fmtBRL(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL",
  }).format(valor ?? 0);
}

// ── Helpers de data: Timestamp do Firestore ↔ exibição / <input type="date"> ──
// Aceita Timestamp do Firestore ({ seconds }) ou undefined.
export function fmtData(ts) {
  if (!ts?.seconds) return "—";
  return new Date(ts.seconds * 1000).toLocaleDateString("pt-BR");
}

// yyyy-mm-dd para popular um <input type="date">. Sem ts, usa hoje.
export function timestampParaInputDate(ts) {
  const data = ts?.seconds ? new Date(ts.seconds * 1000) : new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`;
}

// yyyy-mm-dd (de um <input type="date">) para Timestamp do Firestore.
// Usa meio-dia local para não sofrer com deslocamento de fuso na conversão.
export function inputDateParaTimestamp(str) {
  return Timestamp.fromDate(new Date(`${str}T12:00:00`));
}