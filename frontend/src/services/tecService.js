import { db } from ".././config/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

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