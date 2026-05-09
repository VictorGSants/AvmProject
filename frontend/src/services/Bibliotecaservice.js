import {
  getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { bibliotecaRef, bibliotecaDoc } from "../config/firebasePaths";

// ── Listar todos os serviços da biblioteca ─────────────────────────────────
export async function listarBiblioteca(empresaId) {
  const q = query(bibliotecaRef(empresaId), orderBy("nome"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Obter serviço por ID ───────────────────────────────────────────────────
export async function obterServico(empresaId, servicoId) {
  const snap = await getDoc(bibliotecaDoc(empresaId, servicoId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ── Criar serviço na biblioteca ────────────────────────────────────────────
export async function criarServico(empresaId, dados) {
  const ref = await addDoc(bibliotecaRef(empresaId), {
    ...dados,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
  return ref.id;
}

// ── Atualizar serviço ──────────────────────────────────────────────────────
export async function atualizarServico(empresaId, servicoId, dados) {
  await updateDoc(bibliotecaDoc(empresaId, servicoId), {
    ...dados,
    atualizadoEm: serverTimestamp(),
  });
}

// ── Excluir serviço ────────────────────────────────────────────────────────
export async function excluirServico(empresaId, servicoId) {
  await deleteDoc(bibliotecaDoc(empresaId, servicoId));
}

// ── Calcular orçamento a partir de um serviço + variáveis ─────────────────
// variáveis: { tubulacao: 5, dificuldade: "media", quantidade: 1 }
export function calcularOrcamento(servico, variaveis = {}) {
  const { tubulacao = 0, dificuldade = "baixa", quantidade = 1 } = variaveis;

  // Custo base dos materiais do serviço
  const custoMateriais = (servico.materiais || []).reduce(
    (acc, m) => acc + (m.valorUnit || 0) * (m.qtd || 1),
    0
  );

  // Adicional por metro de tubulação (padrão R$35/m de cobre + isolamento)
  const adicionalTubulacao = tubulacao * (servico.valorPorMetroTubulacao || 35);

  // Multiplicador de dificuldade
  const multDificuldade = { baixa: 1.0, media: 1.15, alta: 1.35 }[dificuldade] ?? 1.0;

  const custoMaoDeObra = (servico.maoDeObra || 0) * multDificuldade;
  const subtotalUnitario =
    (custoMateriais + adicionalTubulacao + custoMaoDeObra) * quantidade;

  const margem = servico.margemLucro || 30; // %
  const precoSugerido = subtotalUnitario * (1 + margem / 100);

  return {
    custoMateriais: custoMateriais * quantidade,
    adicionalTubulacao,
    custoMaoDeObra: custoMaoDeObra * quantidade,
    subtotalCusto: subtotalUnitario,
    margem,
    precoSugerido,
    quantidade,
  };
}