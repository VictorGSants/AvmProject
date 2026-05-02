import { db } from "../../config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export async function getAppointment(empresaId, agendamentoId) {
  const snap = await getDoc(doc(db, "empresas", empresaId, "agendamentos", agendamentoId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
