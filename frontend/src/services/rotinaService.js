import { addDoc, collection, serverTimestamp } from "firebase/firestore";
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
