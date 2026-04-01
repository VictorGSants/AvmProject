import { db } from "../../config/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getStartOfWeek, getEndOfWeek } from "./weekRange";
import { Timestamp } from "firebase/firestore";
export async function getWeekAppointments(empresaId) {
   const inicio = Timestamp.fromDate(getStartOfWeek());
   const fim = Timestamp.fromDate(getEndOfWeek());
   
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