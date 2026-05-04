import { getDocs, updateDoc, doc, addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
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
  observacao,
  assinatura = null
) {
  const refEquip = doc(equipamentosRef(empresaId, contratoId), equipamento.id);
  const agora = new Date();
  const proxima = calcularProximaManutencao(agora, equipamento.periodicidade || "mensal");

  await addDoc(collection(refEquip, "manutencoes"), {
    tipo: "PMOC",
    descricao,
    observacao,
    assinatura,
    data: serverTimestamp(),
  });

  await updateDoc(refEquip, {
    ultimaManutencao: serverTimestamp(),
    proximaManutencao: proxima,
  });
}

export async function registrarPMOCComData(
  empresaId,
  contratoId,
  equipamento,
  descricao,
  data,
  observacao = ""
) {
  const refEquip = doc(equipamentosRef(empresaId, contratoId), equipamento.id);
  const proxima = calcularProximaManutencao(data, equipamento.periodicidade || "mensal");
  const tsData = Timestamp.fromDate(data);

  await addDoc(collection(refEquip, "manutencoes"), {
    tipo: "PMOC",
    descricao,
    observacao,
    assinatura: null,
    data: tsData,
  });

  await updateDoc(refEquip, {
    ultimaManutencao: tsData,
    proximaManutencao: proxima,
  });
}

export async function registrarLotePMOC(empresaId, contratoId, equipamentos, descricao, data, onProgress) {
  for (let i = 0; i < equipamentos.length; i++) {
    await registrarPMOCComData(empresaId, contratoId, equipamentos[i], descricao, data);
    if (onProgress) onProgress(i + 1, equipamentos.length);
  }
}
