import { addDoc, deleteDoc, doc, getDocs, updateDoc, query, where, getDoc, collection } from "firebase/firestore";
// Supondo que você tenha uma ref para o DB configurada em algum lugar
import { db } from "../config/firebaseConfig"; 
import { EMPRESAID } from "../config/empresa";

// --- REFERÊNCIAS ---
// Função auxiliar para obter a referência da subcoleção de equipamentos
const getEquipamentosRef = (contratoId) => {
    return collection(db, "empresas", EMPRESAID, "contratos", contratoId, "equipamentos");
};

// --- FUNÇÕES ---

export async function criarEquipamento(contratoId, dados) {
    // Adiciona o equipamento na subcoleção correta do contrato
    return await addDoc(
        getEquipamentosRef(contratoId), {
            ...dados,
            criadoEm: new Date()
        }
    )
}

// ALTERADO: Agora esta função precisa saber quem é o usuário
export async function listarEquipamentos(contratoId, user, isPatrao) {
    
    let q;
    const ref = getEquipamentosRef(contratoId);

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

export async function atualizarEquipamento(contratoId, equipamentoId, dados) {
    const ref = doc(getEquipamentosRef(contratoId), equipamentoId);
    return await updateDoc(ref, dados);
}

export async function deletarEquipamento(contratoId, equipamentoId) {
    const ref = doc(getEquipamentosRef(contratoId), equipamentoId);
    return await deleteDoc(ref);
}

export async function buscarEquipamento(contratoId, equipamentoId) {
    const ref = doc(getEquipamentosRef(contratoId), equipamentoId);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) return null;

    return {
        id: snapshot.id,
        ...snapshot.data()
    };
}