import { db } from ".././config/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

// Técnicos são usuários cadastrados na coleção raiz `usuarios` com tipo "tecnico".
// Filtramos pelo empresaId para trazer só os técnicos desta empresa.
export async function getTecnicos(empresaId) {
    const q = query(
        collection(db, "usuarios"),
        where("tipo", "==", "tecnico"),
        where("empresaId", "==", empresaId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}