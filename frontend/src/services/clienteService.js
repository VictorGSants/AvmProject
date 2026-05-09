import {
  getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, serverTimestamp,
} from "firebase/firestore";
import { clientesRef, clienteDoc } from "../config/firebasePaths";

// ── Listar todos os clientes ───────────────────────────────────────────────
export async function listarClientes(empresaId) {
  const q = query(clientesRef(empresaId), orderBy("nome"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Buscar cliente por texto (nome ou telefone) ────────────────────────────
export async function buscarClientes(empresaId, texto) {
  // Busca local após carregar todos (Firestore não suporta LIKE nativo)
  const todos = await listarClientes(empresaId);
  const t = texto.toLowerCase();
  return todos.filter(
    (c) =>
      c.nome?.toLowerCase().includes(t) ||
      c.telefone?.includes(t) ||
      c.email?.toLowerCase().includes(t)
  );
}

// ── Obter cliente por ID ───────────────────────────────────────────────────
export async function obterCliente(empresaId, clienteId) {
  const snap = await getDoc(clienteDoc(empresaId, clienteId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ── Criar cliente ──────────────────────────────────────────────────────────
export async function criarCliente(empresaId, dados) {
  const ref = await addDoc(clientesRef(empresaId), {
    ...dados,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
  return ref.id;
}

// ── Atualizar cliente ──────────────────────────────────────────────────────
export async function atualizarCliente(empresaId, clienteId, dados) {
  await updateDoc(clienteDoc(empresaId, clienteId), {
    ...dados,
    atualizadoEm: serverTimestamp(),
  });
}

// ── Excluir cliente ────────────────────────────────────────────────────────
export async function excluirCliente(empresaId, clienteId) {
  await deleteDoc(clienteDoc(empresaId, clienteId));
}