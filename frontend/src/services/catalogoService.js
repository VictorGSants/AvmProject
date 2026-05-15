import {
  getDocs, addDoc, updateDoc, deleteDoc, query, orderBy,
} from "firebase/firestore";
import { catalogoRef, catalogoDoc } from "../config/firebasePaths";

export async function listarCatalogo(empresaId) {
  const snap = await getDocs(query(catalogoRef(empresaId), orderBy("marca"), orderBy("capacidadeBtu")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
