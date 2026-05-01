import { db } from "../../config/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export async function createAppointment(empresaId, dados) {
  const ref = collection(db, "empresas", empresaId, "agendamentos");

  const docRef = await addDoc(ref, {
    inicio: Timestamp.fromDate(dados.inicio),
    fim: Timestamp.fromDate(dados.fim),
    tecnicos: dados.tecnicos,
    tipo: dados.tipo,
    clienteNome: dados.clienteNome || "",
    endereco: dados.endereco || "",
    descricao: dados.descricao || "",
    veiculo: dados.veiculo || "",
    status: "agendado",
    assinatura: null,
    criadoEm: Timestamp.now(),
  });

  return docRef.id;
}
