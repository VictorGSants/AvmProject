import { storage } from "../../config/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Faz upload de um arquivo para Firebase Storage e retorna a URL pública.
// Caminho: fotos/{empresaId}/{agendamentoId}/{timestamp}_{nome_sanitizado}
export async function uploadFoto(empresaId, agendamentoId, arquivo) {
  const nomeSeguro = arquivo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const caminho = `fotos/${empresaId}/${agendamentoId}/${Date.now()}_${nomeSeguro}`;
  const storageRef = ref(storage, caminho);
  const snapshot = await uploadBytes(storageRef, arquivo);
  return await getDownloadURL(snapshot.ref);
}
