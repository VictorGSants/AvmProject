import { v4 as uuidv4 } from "uuid";
import { uploadParaCaminho } from "../storage/uploadFotos";
import { criarFotoOS } from "../os/osFotoService";
import { salvarPendente, listarPendentes, removerPendente } from "./fotoQueueDB";

// Grava a foto (já comprimida) na fila local em IndexedDB. Usado quando o
// dispositivo está offline ou quando o upload direto falha.
export async function enfileirarFoto({
  empresaId, osId, categoria, blob, nomeArquivo,
  autorId, autorNome, origem, geolocalizacao, equipamentoId,
}) {
  const localId = uuidv4();
  await salvarPendente({
    localId, empresaId, osId, categoria, blob, nomeArquivo,
    autorId, autorNome, origem, geolocalizacao, equipamentoId,
    capturadoEmLocal: new Date().toISOString(),
  });
  return localId;
}

export async function listarPendentesDaOS(osId) {
  const todos = await listarPendentes();
  return todos.filter(item => item.osId === osId);
}

async function enviarPendente(item) {
  const nomeSeguro = item.nomeArquivo.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `fotos/${item.empresaId}/ordensServico/${item.osId}/${item.categoria}/${Date.now()}_${nomeSeguro}`;
  const url = await uploadParaCaminho(storagePath, item.blob);

  await criarFotoOS(item.empresaId, item.osId, {
    categoria:        item.categoria,
    url,
    storagePath,
    equipamentoId:    item.equipamentoId,
    autorId:          item.autorId,
    autorNome:        item.autorNome,
    origem:           item.origem,
    geolocalizacao:   item.geolocalizacao,
    capturadoEmLocal: item.capturadoEmLocal,
  });

  await removerPendente(item.localId);
}

// Tenta subir todas as fotos pendentes da OS informada. Falhas individuais
// não interrompem as demais — cada foto continua na fila até conseguir.
export async function sincronizarPendentes(osId) {
  const pendentes = await listarPendentesDaOS(osId);
  let sucesso = 0;
  for (const item of pendentes) {
    try {
      await enviarPendente(item);
      sucesso += 1;
    } catch (err) {
      console.warn("Falha ao sincronizar foto pendente:", err.message);
    }
  }
  return { total: pendentes.length, sucesso };
}
