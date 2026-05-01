import { db } from "../../config/firebaseConfig";
import { doc, updateDoc, Timestamp } from "firebase/firestore";

export async function updateAppointment(empresaId, agendamentoId, dados) {
  const ref = doc(db, "empresas", empresaId, "agendamentos", agendamentoId);
  await updateDoc(ref, { ...dados, atualizadoEm: Timestamp.now() });
}
