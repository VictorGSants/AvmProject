import { getDocs, addDoc, updateDoc, query, orderBy } from "firebase/firestore";
import { entidadesRef, entidadeDoc } from "../config/firebasePaths";

export async function listarEntidades(empresaId) {
  const snap = await getDocs(query(entidadesRef(empresaId), orderBy("nome")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function criarEntidade(empresaId, dados) {
  const ref = await addDoc(entidadesRef(empresaId), { ...dados, criadoEm: new Date() });
  return ref.id;
}

export async function atualizarEntidade(empresaId, entidadeId, dados) {
  await updateDoc(entidadeDoc(empresaId, entidadeId), dados);
}
