import { getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, where } from "firebase/firestore";
import { entidadesRef, entidadeDoc } from "../config/firebasePaths";

export async function listarEntidades(empresaId) {
  const snap = await getDocs(query(entidadesRef(empresaId), orderBy("nome")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Retorna apenas as entidades vinculadas a um cliente específico
export async function listarEntidadesPorCliente(empresaId, clienteId) {
  const snap = await getDocs(
    query(entidadesRef(empresaId), where("clienteId", "==", clienteId))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function criarEntidade(empresaId, dados) {
  const ref = await addDoc(entidadesRef(empresaId), { ...dados, criadoEm: new Date() });
  return ref.id;
}

export async function atualizarEntidade(empresaId, entidadeId, dados) {
  await updateDoc(entidadeDoc(empresaId, entidadeId), dados);
}

export async function excluirEntidade(empresaId, entidadeId) {
  await deleteDoc(entidadeDoc(empresaId, entidadeId));
}
