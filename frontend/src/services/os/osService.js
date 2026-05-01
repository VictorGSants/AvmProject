import { db } from "../../config/firebaseConfig";
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";

// Cria uma OS (Ordem de Serviço) em empresas/{empresaId}/ordens
// chamado automaticamente ao finalizar um agendamento com assinatura
export async function createOS(empresaId, dados) {
  const ref = collection(db, "empresas", empresaId, "ordensServico");

  // Número legível da OS baseado nos últimos 6 dígitos do timestamp
  const numero = `OS-${Date.now().toString().slice(-6)}`;

  const docRef = await addDoc(ref, {
    numero,
    agendamentoId:        dados.agendamentoId,
    tecnicoNome:          dados.tecnicoNome     || "",
    clienteNome:          dados.clienteNome     || "",
    endereco:             dados.endereco        || "",
    tipoServico:          dados.tipoServico     || "",
    descricaoAgendamento: dados.descricaoAgendamento || "",
    servicoExecutado:     dados.servicoExecutado,
    materiaisUtilizados:  dados.materiaisUtilizados  || "",
    veiculo:              dados.veiculo         || "",
    fotos:                dados.fotos           || [],
    assinatura:           dados.assinatura      || null,
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
