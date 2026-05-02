import { db } from "../../config/firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, query, orderBy, Timestamp } from "firebase/firestore";

export async function createOS(empresaId, dados) {
  const ref = collection(db, "empresas", empresaId, "ordensServico");
  const numero = `OS-${Date.now().toString().slice(-6)}`;

  const docRef = await addDoc(ref, {
    numero,
    agendamentoId:        dados.agendamentoId,
    tecnicoNome:          dados.tecnicoNome          || "",
    tecnicoIds:           dados.tecnicoIds           || [],
    tecnicosNomes:        dados.tecnicosNomes        || [dados.tecnicoNome || ""],
    clienteNome:          dados.clienteNome          || "",
    endereco:             dados.endereco             || "",
    tipoServico:          dados.tipoServico          || "",
    descricaoAgendamento: dados.descricaoAgendamento || "",
    servicoExecutado:     dados.servicoExecutado,
    materiaisUtilizados:  dados.materiaisUtilizados  || "",
    veiculo:              dados.veiculo              || "",
    fotos:                dados.fotos                || [],
    assinatura:           dados.assinatura           || null,
    dataServico:          Timestamp.fromDate(dados.dataServico),
    criadoEm:             Timestamp.now(),
  });

  return { id: docRef.id, numero };
}

export async function getOrdens(empresaId) {
  const ref = collection(db, "empresas", empresaId, "ordensServico");
  const q = query(ref, orderBy("criadoEm", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Salva avaliações individuais por técnico.
// `avaliacao.avaliacoes` é um array: [{tecnicoId, tecnicoNome, desempenho, comissaoPct, comissaoValor, observacoes}]
export async function avaliarOS(empresaId, osId, avaliacao) {
  const ref = doc(db, "empresas", empresaId, "ordensServico", osId);
  await updateDoc(ref, {
    avaliada:      true,
    valorServico:  avaliacao.valorServico,
    comissaoTotal: avaliacao.comissaoTotal,
    avaliacoes:    avaliacao.avaliacoes,
    avaliadoPor:   avaliacao.avaliadoPor,
    avaliadoEm:    Timestamp.now(),
  });
}
