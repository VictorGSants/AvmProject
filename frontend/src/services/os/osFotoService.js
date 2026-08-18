import { db, storage } from "../../config/firebaseConfig";
import {
  collection, doc, getDocs, query, orderBy,
  runTransaction, serverTimestamp, increment,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

// antes/durante/depois removidas (2026-08-17) — ficou um espaço só de fotos.
const CATEGORIAS = ["geral"];

// Cria o doc da foto e incrementa o contador da OS na mesma transação —
// é o contagemFotos que a regra de segurança usa pra travar o encerramento
// sem depender só da UI.
export async function criarFotoOS(empresaId, osId, dadosFoto) {
  if (!CATEGORIAS.includes(dadosFoto.categoria)) {
    throw new Error(`Categoria de foto inválida: ${dadosFoto.categoria}`);
  }

  const osRef = doc(db, "empresas", empresaId, "ordensServico", osId);
  const fotoRef = doc(collection(osRef, "fotos"));

  await runTransaction(db, async (tx) => {
    tx.set(fotoRef, {
      osId,
      categoria:         dadosFoto.categoria,
      url:               dadosFoto.url,
      storagePath:       dadosFoto.storagePath,
      equipamentoId:     dadosFoto.equipamentoId || null,
      autorId:           dadosFoto.autorId,
      autorNome:         dadosFoto.autorNome || "",
      origem:            dadosFoto.origem || "camera",
      geolocalizacao:    dadosFoto.geolocalizacao || null,
      capturadoEmLocal:  dadosFoto.capturadoEmLocal || null,
      criadoEm:          serverTimestamp(),
    });
    tx.update(osRef, {
      [`contagemFotos.${dadosFoto.categoria}`]: increment(1),
    });
  });

  return fotoRef.id;
}

export async function listarFotosOS(empresaId, osId) {
  const ref = collection(db, "empresas", empresaId, "ordensServico", osId, "fotos");
  const q = query(ref, orderBy("criadoEm", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Só é permitido (por regra) enquanto a OS ainda está em_andamento —
// corrige uma foto tirada por engano antes do encerramento.
export async function removerFotoOS(empresaId, osId, fotoId, categoria, storagePath) {
  const osRef = doc(db, "empresas", empresaId, "ordensServico", osId);
  const fotoRef = doc(osRef, "fotos", fotoId);

  await runTransaction(db, async (tx) => {
    tx.delete(fotoRef);
    tx.update(osRef, {
      [`contagemFotos.${categoria}`]: increment(-1),
    });
  });

  if (storagePath) {
    await deleteObject(ref(storage, storagePath)).catch(() => {});
  }
}
