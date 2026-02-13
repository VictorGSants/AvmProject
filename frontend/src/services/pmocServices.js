import { getDocs, updateDoc, doc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { equipamentosRef } from "../config/firebasePaths";
import { db } from "../config/firebaseConfig";

export async function listarEquipamentosPMOC(empresaId, contratoId) {
  const snap = await getDocs(equipamentosRef(empresaId, contratoId));

  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

export function calcularProximaManutencao(data, periodicidade) {
  const nova = new Date(data);

  if (periodicidade === "mensal")
    nova.setMonth(nova.getMonth() + 1);

  if (periodicidade === "trimestral")
    nova.setMonth(nova.getMonth() + 3);

  if (periodicidade === "semestral")
    nova.setMonth(nova.getMonth() + 6);

  return nova;
}

export async function registrarPMOC(
  empresaId,
  contratoId,
  equipamento,
  descricao,
  observacao
) {

  const refEquip = doc(
    equipamentosRef(empresaId, contratoId),
    equipamento.id
  );

  const agora = new Date();

  const proxima = calcularProximaManutencao(
    agora,
    equipamento.periodicidade || "mensal"
  );

  // salva histórico
  await addDoc(
    collection(refEquip, "manutencoes"),
    {
      tipo: "PMOC",
      descricao,
      observacao,
      data: serverTimestamp()
    }
  );

  // atualiza equipamento
  await updateDoc(refEquip, {
    ultimaManutencao: serverTimestamp(),
    proximaManutencao: proxima
  });
}
