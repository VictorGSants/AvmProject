import { addDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export async function listarFornecedores(empresaId) {
  const q = query(
    collection(db, "empresas", empresaId, "fornecedores"),
    orderBy("nome", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function criarFornecedor(empresaId, dados) {
  const ref = await addDoc(
    collection(db, "empresas", empresaId, "fornecedores"),
    dados
  );
  return ref.id;
}
