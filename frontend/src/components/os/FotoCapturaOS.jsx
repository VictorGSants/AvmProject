import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, ImagePlus, Loader2, Clock, RefreshCw, X } from "lucide-react";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { uploadParaCaminho } from "../../services/storage/uploadFotos";
import { criarFotoOS, listarFotosOS, removerFotoOS } from "../../services/os/osFotoService";
import { enfileirarFoto, listarPendentesDaOS, sincronizarPendentes } from "../../services/offline/fotoSyncManager";
import { removerPendente } from "../../services/offline/fotoQueueDB";
import VisualizadorFoto from "./VisualizadorFoto";

const CATEGORIAS = [
  { chave: "antes",   rotulo: "Antes" },
  { chave: "durante", rotulo: "Durante" },
  { chave: "depois",  rotulo: "Depois" },
];

// useWebWorker desligado: em alguns setups (Vite dev server, iOS Safari
// mais antigo) o worker da lib nunca sobe nem falha — só fica pendurado
// sem resolver nem rejeitar, travando a foto pra sempre.
// Tamanho reduzido pra encurtar o upload em sinal fraco (o cenário normal
// de campo) — ainda dá evidência legível, só não é foto de alta resolução.
const OPCOES_COMPRESSAO = { maxWidthOrHeight: 1280, maxSizeMB: 0.5, useWebWorker: false };
const TIMEOUT_GEO_MS = 8000;
const TIMEOUT_COMPRESSAO_MS = 15_000;

function obterGeolocalizacao() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
      () => resolve(null),
      { timeout: TIMEOUT_GEO_MS, maximumAge: 60_000 }
    );
  });
}

async function comprimirComTimeout(arquivo) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Compressão demorou demais")), TIMEOUT_COMPRESSAO_MS)
  );
  return Promise.race([imageCompression(arquivo, OPCOES_COMPRESSAO), timeoutPromise]);
}

async function enviarDireto({ empresaId, osId, categoria, blob, nomeArquivo, autorId, autorNome, origem, geolocalizacao, equipamentoId }) {
  const nomeSeguro = nomeArquivo.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `fotos/${empresaId}/ordensServico/${osId}/${categoria}/${Date.now()}_${nomeSeguro}`;
  const url = await uploadParaCaminho(storagePath, blob);
  await criarFotoOS(empresaId, osId, {
    categoria, url, storagePath, equipamentoId, autorId, autorNome, origem, geolocalizacao,
    capturadoEmLocal: new Date().toISOString(),
  });
}

export default function FotoCapturaOS({
  empresaId, osId, autorId, autorNome, equipamentoId,
  onContagemChange, somenteLeitura = false,
}) {
  const [fotos, setFotos] = useState([]);
  const [pendentes, setPendentes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviandoCategoria, setEnviandoCategoria] = useState(null);
  const [excluindo, setExcluindo] = useState(null);
  const [fotoAmpliada, setFotoAmpliada] = useState(null);
  const inputsRef = useRef({});
  // Cada chamada de carregar() ganha um id crescente. Em sinal ruim de celular
  // é comum a consulta disparada por uma foto mais antiga responder DEPOIS da
  // consulta disparada pela foto seguinte — sem essa trava, a resposta atrasada
  // sobrescreve o estado mais novo e a foto recém-enviada "some" da tela.
  const cargaIdRef = useRef(0);

  const carregar = useCallback(async () => {
    const idDestaCarga = ++cargaIdRef.current;
    let listaFotos, listaPendentes;
    try {
      [listaFotos, listaPendentes] = await Promise.all([
        listarFotosOS(empresaId, osId),
        listarPendentesDaOS(osId),
      ]);
    } catch (err) {
      console.warn("Falha ao carregar fotos da OS:", err.message);
      if (idDestaCarga === cargaIdRef.current) {
        toast.error(`Não consegui atualizar a lista de fotos (${err.message}).`);
        setCarregando(false);
      }
      return;
    }
    if (idDestaCarga !== cargaIdRef.current) return; // resposta antiga — ignora
    setFotos(listaFotos);
    setPendentes(listaPendentes);
    setCarregando(false);
  }, [empresaId, osId]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    const contagem = { antes: 0, durante: 0, depois: 0 };
    fotos.forEach(f => { if (contagem[f.categoria] !== undefined) contagem[f.categoria] += 1; });
    onContagemChange?.(contagem);
  }, [fotos, onContagemChange]);

  const tentarSincronizar = useCallback(async () => {
    const { total, sucesso } = await sincronizarPendentes(osId);
    if (total > 0) await carregar();
    if (sucesso > 0 && sucesso < total) {
      toast.info(`${sucesso} de ${total} fotos pendentes enviadas — o restante será tentado automaticamente.`);
    } else if (sucesso > 0) {
      toast.success(`${sucesso} foto(s) pendente(s) enviada(s).`);
    }
  }, [osId, carregar]);

  useEffect(() => {
    if (somenteLeitura) return;
    tentarSincronizar();
    const aoConectar = () => tentarSincronizar();
    window.addEventListener("online", aoConectar);
    const intervalo = setInterval(() => {
      if (navigator.onLine) tentarSincronizar();
    }, 20_000);
    return () => {
      window.removeEventListener("online", aoConectar);
      clearInterval(intervalo);
    };
  }, [somenteLeitura, tentarSincronizar]);

  async function handleArquivos(categoria, origem, e) {
    const arquivos = [...e.target.files];
    e.target.value = "";
    if (!arquivos.length) return;

    setEnviandoCategoria(categoria);
    const geolocalizacao = await obterGeolocalizacao();

    for (const arquivo of arquivos) {
      let blobComprimido;
      try {
        blobComprimido = await comprimirComTimeout(arquivo);
      } catch (err) {
        console.warn("Compressão falhou/expirou, enviando original:", err.message);
        blobComprimido = arquivo;
      }

      const dados = {
        empresaId, osId, categoria, blob: blobComprimido, nomeArquivo: arquivo.name,
        autorId, autorNome, origem, geolocalizacao, equipamentoId,
      };

      try {
        await enviarDireto(dados);
        toast.success("Foto enviada.");
      } catch (err) {
        console.warn("Upload direto falhou, enfileirando offline:", err.message);
        await enfileirarFoto(dados);
        if (navigator.onLine) {
          toast.warning(`Não consegui enviar agora (${err.message}). A foto foi salva no dispositivo e será tentada de novo automaticamente.`);
        } else {
          toast.info("Sem conexão — foto salva no dispositivo e será enviada automaticamente ao reconectar.");
        }
      }
    }

    setEnviandoCategoria(null);
    await carregar();
  }

  async function excluirFoto(foto) {
    if (!window.confirm("Excluir esta foto? Só é possível enquanto o serviço está em andamento.")) return;
    setExcluindo(foto.id);
    try {
      await removerFotoOS(empresaId, osId, foto.id, foto.categoria, foto.storagePath);
      await carregar();
    } catch (err) {
      toast.error(`Não consegui excluir a foto: ${err.message}`);
    } finally {
      setExcluindo(null);
    }
  }

  async function excluirPendente(item) {
    if (!window.confirm("Excluir esta foto pendente de envio?")) return;
    await removerPendente(item.localId);
    await carregar();
  }

  if (carregando) {
    return <p className="text-sm text-gray-400">Carregando fotos...</p>;
  }

  return (
    <div className="space-y-4">
      {enviandoCategoria && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700">
          <Loader2 size={13} className="animate-spin flex-shrink-0" />
          Enviando foto... não feche o app, isso pode levar um tempo em sinal fraco.
        </div>
      )}

      {pendentes.length > 0 && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
          <span className="flex items-center gap-1.5">
            <Clock size={13} /> {pendentes.length} foto(s) pendente(s) de envio
          </span>
          <button onClick={tentarSincronizar} className="flex items-center gap-1 font-semibold hover:text-amber-900">
            <RefreshCw size={12} /> Tentar agora
          </button>
        </div>
      )}

      {CATEGORIAS.map(({ chave, rotulo }) => {
        const fotosCategoria = fotos.filter(f => f.categoria === chave);
        const pendentesCategoria = pendentes.filter(p => p.categoria === chave);
        const total = fotosCategoria.length + pendentesCategoria.length;

        return (
          <div key={chave}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {rotulo} {total > 0 && <span className="text-gray-300">· {total}</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {fotosCategoria.map(foto => (
                <div key={foto.id} className="relative w-20 h-20 flex-shrink-0">
                  <img src={foto.url} alt={`${rotulo} ${foto.id}`}
                    onClick={() => setFotoAmpliada(foto.url)}
                    className="w-full h-full object-cover rounded-xl border border-gray-200 cursor-pointer" />
                  {!somenteLeitura && foto.autorId === autorId && (
                    <button
                      onClick={e => { e.stopPropagation(); excluirFoto(foto); }}
                      disabled={excluindo === foto.id}
                      title="Excluir foto"
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow disabled:opacity-50"
                    >
                      {excluindo === foto.id ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
                    </button>
                  )}
                </div>
              ))}

              {pendentesCategoria.map(item => (
                <div key={item.localId} className="relative w-20 h-20 flex-shrink-0">
                  <img src={URL.createObjectURL(item.blob)} alt="Pendente"
                    onClick={() => setFotoAmpliada(URL.createObjectURL(item.blob))}
                    className="w-full h-full object-cover rounded-xl border border-amber-300 opacity-70 cursor-pointer" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl pointer-events-none">
                    <Clock size={16} className="text-white" />
                  </div>
                  {!somenteLeitura && (
                    <button
                      onClick={e => { e.stopPropagation(); excluirPendente(item); }}
                      title="Excluir foto pendente"
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              ))}

              {!somenteLeitura && (
                <>
                  <button
                    onClick={() => inputsRef.current[`${chave}-camera`]?.click()}
                    disabled={enviandoCategoria === chave}
                    title="Tirar foto"
                    className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-[#7b8cd4] hover:text-[#7b8cd4] transition-colors flex-shrink-0 active:scale-95 disabled:opacity-50"
                  >
                    {enviandoCategoria === chave
                      ? <Loader2 size={20} className="animate-spin" />
                      : <Camera size={20} />}
                    <span className="text-[10px] mt-1 font-medium">Câmera</span>
                  </button>

                  <button
                    onClick={() => inputsRef.current[`${chave}-galeria`]?.click()}
                    disabled={enviandoCategoria === chave}
                    title="Selecionar da galeria"
                    className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-[#7b8cd4] hover:text-[#7b8cd4] transition-colors flex-shrink-0 active:scale-95 disabled:opacity-50"
                  >
                    <ImagePlus size={20} />
                    <span className="text-[10px] mt-1 font-medium">Galeria</span>
                  </button>

                  <input
                    ref={el => (inputsRef.current[`${chave}-camera`] = el)}
                    type="file" accept="image/*" capture="environment"
                    onChange={e => handleArquivos(chave, "camera", e)}
                    className="hidden"
                  />
                  <input
                    ref={el => (inputsRef.current[`${chave}-galeria`] = el)}
                    type="file" accept="image/*" multiple
                    onChange={e => handleArquivos(chave, "galeria", e)}
                    className="hidden"
                  />
                </>
              )}
            </div>
          </div>
        );
      })}

      <VisualizadorFoto url={fotoAmpliada} onClose={() => setFotoAmpliada(null)} />
    </div>
  );
}
