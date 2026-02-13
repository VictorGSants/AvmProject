import { collection } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const getContratoPath = (empresaId, contratoId) => {
    return `empresas/${empresaId}/contratos/${contratoId}`;
}

export const equipamentosRef = (empresaId, contratoId) => 
    collection(db, `${getContratoPath(empresaId, contratoId)}/equipamentos`);

export const ordensRef = (empresaId, contratoId) => 
    collection(db, `${getContratoPath(empresaId, contratoId)}/ordensServico`);

export const pmocRef = (empresaId, contratoId) => 
    collection(db, `${getContratoPath(empresaId, contratoId)}/pmoc`)
