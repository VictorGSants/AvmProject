import { collection, doc } from "firebase/firestore";
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

export const clientesRef = (empresaId) =>
  collection(db, `empresas/${empresaId}/clientes`);

export const clienteDoc = (empresaId, clienteId) =>
  doc(db, `empresas/${empresaId}/clientes/${clienteId}`);

export const bibliotecaRef = (empresaId) =>
  collection(db, `empresas/${empresaId}/servicosBiblioteca`);

export const bibliotecaDoc = (empresaId, servicoId) =>
  doc(db, `empresas/${empresaId}/servicosBiblioteca/${servicoId}`);

export const orcamentosRef = (empresaId) =>
  collection(db, `empresas/${empresaId}/orcamentos`);

export const orcamentoDoc = (empresaId, orcamentoId) =>
  doc(db, `empresas/${empresaId}/orcamentos/${orcamentoId}`);

export const catalogoRef = (empresaId) =>
  collection(db, `empresas/${empresaId}/catalogo`);

export const catalogoDoc = (empresaId, itemId) =>
  doc(db, `empresas/${empresaId}/catalogo/${itemId}`);

export const entidadesRef = (empresaId) =>
  collection(db, `empresas/${empresaId}/entidades`);

export const entidadeDoc = (empresaId, entidadeId) =>
  doc(db, `empresas/${empresaId}/entidades/${entidadeId}`);