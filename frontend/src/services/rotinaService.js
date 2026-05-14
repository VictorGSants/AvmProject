import { addDoc, collection, serverTimestamp, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export async function registrarRotina(empresaId, { tecnicoId, tecnicoNome, veiculo, itensMarcados, totalItens, totalMarcado }) {
  await addDoc(collection(db, "empresas", empresaId, "rotinas"), {
    tecnicoId,
    tecnicoNome,
    veiculo,
    itensMarcados,
    totalItens,
    totalMarcado,
    completo: totalMarcado === totalItens,
    dataHora: serverTimestamp(),
  });
}

export async function listarRotinas(empresaId) {
  const q = query(
    collection(db, "empresas", empresaId, "rotinas"),
    orderBy("dataHora", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function excluirRotina(empresaId, rotinaId) {
  await deleteDoc(doc(db, "empresas", empresaId, "rotinas", rotinaId));
}
