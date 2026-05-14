import { storage } from "../../config/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const TIMEOUT_MS = 30_000;

// Faz upload de um arquivo para Firebase Storage e retorna a URL pública.
// Caminho: fotos/{empresaId}/{agendamentoId}/{timestamp}_{nome_sanitizado}
export async function uploadFoto(empresaId, agendamentoId, arquivo) {
  const nomeSeguro = arquivo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const caminho = `fotos/${empresaId}/${agendamentoId}/${Date.now()}_${nomeSeguro}`;
  const storageRef = ref(storage, caminho);

  const uploadPromise = uploadBytes(storageRef, arquivo)
    .then(snap => getDownloadURL(snap.ref));

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("Tempo limite excedido. Verifique sua conexão ou se o Storage está ativado no Firebase Console.")),
      TIMEOUT_MS
    )
  );

  return Promise.race([uploadPromise, timeoutPromise]);
}
