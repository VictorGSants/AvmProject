import { addDoc, deleteDoc, doc, getDocs, updateDoc, query, where, getDoc, collection } from "firebase/firestore";
import { db } from "../config/firebaseConfig"; 

// --- REFERÊNCIAS ---
// Função auxiliar para obter a referência da subcoleção de equipamentos
const getEquipamentosRef = (contratoId, empresaId) => {
    return collection(db, "empresas", empresaId, "contratos", contratoId, "equipamentos");
};

// --- FUNÇÕES ---

export async function criarEquipamento(contratoId, empresaId, dados) {
    // Adiciona o equipamento na subcoleção correta do contrato
    return await addDoc(
        getEquipamentosRef(contratoId, empresaId), {
            ...dados,
            criadoEm: new Date()
        }
    )
}

// ALTERADO: Agora esta função precisa saber quem é o usuário
export async function listarEquipamentos(contratoId, empresaId ,user, isPatrao) {
    
    let q;
    const ref = getEquipamentosRef(contratoId, empresaId);

    // LÓGICA DE FILTRAGEM (Segurança no Front)
    if (isPatrao) {
        // Se for patrão, lista todos os equipamentos
        q = ref;
    } else {
        // Se for gestor/tecnico/visualizador, a segurança do Firestore
        // baseada nas regras que criamos já bloqueará a leitura de contratos 
        // aos quais ele não está vinculado. Aqui listamos os equipamentos do contrato.
        q = ref; 
    }

    const snapshot = await getDocs(q);
    return snapshot;
}

export async function atualizarEquipamento(contratoId,  empresaId, equipamentoId, dados) {
    const ref = doc(getEquipamentosRef(contratoId, empresaId), equipamentoId);
    return await updateDoc(ref, dados);
}

export async function deletarEquipamento(contratoId, empresaId , equipamentoId) {
    const ref = doc(getEquipamentosRef(contratoId, empresaId), equipamentoId);
    return await deleteDoc(ref);
}

export async function buscarEquipamento(contratoId, empresaId ,equipamentoId) {
    const ref = doc(getEquipamentosRef(contratoId, empresaId), equipamentoId);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) return null;

    return {
        id: snapshot.id,
        ...snapshot.data()
    };
}