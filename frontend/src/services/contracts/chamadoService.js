import {
  addDoc, getDocs, updateDoc, doc, collection,
  query, orderBy, where, serverTimestamp, onSnapshot,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

const ref = (empresaId) => collection(db, "empresas", empresaId, "chamados");

export async function criarChamado(empresaId, dados) {
  return await addDoc(ref(empresaId), {
    ...dados,
    status: "aberto",
    criadoEm: serverTimestamp(),
  });
}

export async function getChamados(empresaId) {
  const q = query(ref(empresaId), orderBy("criadoEm", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function atualizarChamado(empresaId, chamadoId, dados) {
  await updateDoc(doc(ref(empresaId), chamadoId), {
    ...dados,
    atualizadoEm: serverTimestamp(),
  });
}

// Retorna unsubscribe — chame no cleanup do useEffect
export function escutarChamadosAbertos(empresaId, callback) {
  const q = query(ref(empresaId), where("status", "==", "aberto"));
  return onSnapshot(q, snap => callback(snap.size));
}
