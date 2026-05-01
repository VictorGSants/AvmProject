import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

export async function contracts(empresaId) {
  const snap = await getDocs(collection(db, "empresas", empresaId, "contratos"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getContrato(empresaId, contratoId) {
  const snap = await getDoc(doc(db, "empresas", empresaId, "contratos", contratoId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Filtra contratos pelo UID do técnico.
// Se o contrato não tem campo `tecnicos` ou é vazio → acessível por todos.
// Se tem `tecnicos: [uid1, uid2]` → apenas esses técnicos acessam.
export async function getContratosDoTecnico(empresaId, uid) {
  const todos = await contracts(empresaId);
  return todos.filter(c => !c.tecnicos?.length || c.tecnicos.includes(uid));
}