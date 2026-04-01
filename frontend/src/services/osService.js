import { collection, addDoc, getDocs, doc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { EMPRESAID } from "../config/empresa";



const getOsRef = (empresaId) => {
  return collection(db, "empresas", empresaId, "ordensServico");
};

export async function criarOs(empresaId, dados) {
  return await addDoc(getOsRef(empresaId), {
    ...dados,
    criadoEm: new Date()
  });
}

export async function getOs(empresaId) {
  
  const snapshot = await getDocs(getOsRef(empresaId));
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })); 
}