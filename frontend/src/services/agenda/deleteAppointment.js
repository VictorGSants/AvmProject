import { db } from "../../config/firebaseConfig";
import { doc, deleteDoc } from "firebase/firestore";

export async function deleteAppointment(empresaId, agendamentoId) {
  const ref = doc(db, "empresas", empresaId, "agendamentos", agendamentoId);
  await deleteDoc(ref);
}
