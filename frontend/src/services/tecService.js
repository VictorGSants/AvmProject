import { db } from ".././config/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";


export async function getTecnicos(empresaId) {
    const ref = collection(db, "empresas", empresaId, "tecnicos");
    const snapshot = await getDocs(ref);
    const lista = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
   }))
    return lista;
}