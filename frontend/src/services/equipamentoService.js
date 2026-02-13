import { addDoc, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { equipamentosRef } from "../config/firebasePaths";
import { EMPRESAID } from "../config/empresa";


export async function criarEquipamento(contratoId, dados) {
    return await addDoc(
        equipamentosRef(EMPRESAID, contratoId), {
            ...dados,
            criadoEm: new Date()
        }
    )
}

export async function listarEquipamentos(contratoId) {
    const snapshot = await getDocs(
        equipamentosRef(EMPRESAID, contratoId)
    );

    return snapshot;
}

export async function atualizarEquipamento( contratoId, equipamentoId, dados) {
    const ref = doc(
        equipamentosRef(EMPRESAID, contratoId), equipamentoId);
    
    return await updateDoc(ref,dados)
}

export async function deletarEquipamento( contratoId, equipamentoId) {
    const ref = doc(
        equipamentosRef(EMPRESAID, contratoId), equipamentoId);
    
    return await deleteDoc(ref)
}

export async function buscarEquipamento(
  empresaId,
  contratoId,
  equipamentoId
) {
  const ref = doc(
    db,
    "empresas",
    empresaId,
    "contratos",
    contratoId,
    "equipamentos",
    equipamentoId
  );

  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
}
