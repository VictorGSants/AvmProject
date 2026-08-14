import { db } from "../../config/firebaseConfig";
import { doc, updateDoc, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";

export async function salvarMedicoes(empresaId, osId, medicoes) {
  const ref = doc(db, "empresas", empresaId, "ordensServico", osId);
  await updateDoc(ref, { medicoes });
}

export async function criarNaoConformidade(empresaId, osId, dados) {
  const ref = collection(db, "empresas", empresaId, "ordensServico", osId, "naoConformidades");
  await addDoc(ref, {
    campo:          dados.campo,
    rotulo:         dados.rotulo,
    valor:          dados.valor ?? null,
    unidade:        dados.unidade || "",
    faixaEsperada:  dados.faixaEsperada || "",
    justificativa:  dados.justificativa,
    autorId:        dados.autorId,
    autorNome:      dados.autorNome || "",
    equipamentoId:  dados.equipamentoId || null,
    criadoEm:       serverTimestamp(),
  });
}

export async function listarNaoConformidades(empresaId, osId) {
  const ref = collection(db, "empresas", empresaId, "ordensServico", osId, "naoConformidades");
  const q = query(ref, orderBy("criadoEm", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
