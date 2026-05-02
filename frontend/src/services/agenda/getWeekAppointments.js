import { db } from "../../config/firebaseConfig";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { getStartOfWeek, getEndOfWeek } from "./weekRange";

// tecnicoId: passado quando o usuário logado é técnico.
// Com ele, a query filtra só os agendamentos onde ele está na lista `tecnicos`.
// Gestor passa null e recebe todos os agendamentos da semana.
export async function getWeekAppointments(empresaId, semanaBase, tecnicoId = null) {
  const inicio = Timestamp.fromDate(getStartOfWeek(semanaBase));
  const fim    = Timestamp.fromDate(getEndOfWeek(semanaBase));

  const ref = collection(db, "empresas", empresaId, "agendamentos");

  const filtros = [
    where("inicio", ">=", inicio),
    where("inicio", "<=", fim),
  ];

  if (tecnicoId) {
    filtros.push(where("tecnicos", "array-contains", tecnicoId));
  }

  const snapshot = await getDocs(query(ref, ...filtros));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
