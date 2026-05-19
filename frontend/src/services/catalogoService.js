import { getDocs, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { catalogoRef, catalogoDoc } from "../config/firebasePaths";

export async function listarCatalogo(empresaId) {
  const snap = await getDocs(catalogoRef(empresaId));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const m = (a.marca || "").localeCompare(b.marca || "");
      if (m !== 0) return m;
      return (a.capacidadeBtu || 0) - (b.capacidadeBtu || 0);
    });
}

export async function criarItemCatalogo(empresaId, dados) {
  const ref = await addDoc(catalogoRef(empresaId), {
    ...dados,
    atualizadoEm: new Date(),
  });
  return ref.id;
}

export async function atualizarItemCatalogo(empresaId, itemId, dados) {
  await updateDoc(catalogoDoc(empresaId, itemId), { ...dados, atualizadoEm: new Date() });
}

export async function excluirItemCatalogo(empresaId, itemId) {
  await deleteDoc(catalogoDoc(empresaId, itemId));
}
