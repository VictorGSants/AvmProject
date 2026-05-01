import { db } from "../../config/firebaseConfig";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { getStartOfWeek, getEndOfWeek } from "./weekRange";

// `semanaBase` é passado pelo hook useAgenda para buscar qualquer semana,
// não apenas a atual.
export async function getWeekAppointments(empresaId, semanaBase) {
   const inicio = Timestamp.fromDate(getStartOfWeek(semanaBase));
   const fim = Timestamp.fromDate(getEndOfWeek(semanaBase));
   
   const ref = collection(db, "empresas", empresaId, "agendamentos");

 

   const q = query(
      ref,
      where("inicio", ">=", inicio),
      where("inicio", "<=", fim)
   );

   const snapshot = await getDocs(q);


   const agendamentos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
   }))

   return agendamentos;
}