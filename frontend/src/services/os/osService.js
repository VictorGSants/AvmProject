import { db } from "../../config/firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, query, orderBy, Timestamp, serverTimestamp } from "firebase/firestore";

// Cria a OS já no início do atendimento (status "em_andamento"), antes de
// existir relatório/assinatura — é o que dá às fotos (e, futuramente,
// medições) um osId real para se vincular durante toda a execução.
export async function criarOSRascunho(empresaId, dados) {
  const ref = collection(db, "empresas", empresaId, "ordensServico");
  const numero = `OS-${Date.now().toString().slice(-6)}`;

  const docRef = await addDoc(ref, {
    numero,
    status:               "em_andamento",
    agendamentoId:        dados.agendamentoId,
    tecnicoNome:          dados.tecnicoNome          || "",
    tecnicoIds:           dados.tecnicoIds           || [],
    tecnicosNomes:        dados.tecnicosNomes        || [dados.tecnicoNome || ""],
    clienteNome:          dados.clienteNome          || "",
    endereco:             dados.endereco             || "",
    tipoServico:          dados.tipoServico          || "",
    descricaoAgendamento: dados.descricaoAgendamento || "",
    veiculo:              dados.veiculo              || "",
    contagemFotos:        { antes: 0, durante: 0, depois: 0 },
    dataServico:          Timestamp.fromDate(dados.dataServico),
    criadoEm:             serverTimestamp(),
  });

  return { id: docRef.id, numero };
}

// Fecha a OS aberta por criarOSRascunho, gravando o relatório do serviço.
export async function finalizarOS(empresaId, osId, dados) {
  const ref = doc(db, "empresas", empresaId, "ordensServico", osId);
  await updateDoc(ref, {
    status:              "concluido",
    servicoExecutado:    dados.servicoExecutado,
    materiaisUtilizados: dados.materiaisUtilizados || "",
    assinatura:          dados.assinatura || null,
    concluidoEm:         serverTimestamp(),
  });
}

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
