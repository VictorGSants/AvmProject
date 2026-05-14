import { useState, useRef } from "react";
import { Camera, ImagePlus, X, Loader2 } from "lucide-react";
import { uploadFoto } from "../../services/storage/uploadFotos";
import { toast } from "sonner";

export default function FotoUpload({
  empresaId,
  agendamentoId,
  fotosIniciais = [],
  onFotosChange,
  label = "Fotos do serviço",
}) {
  const [fotos, setFotos]       = useState(fotosIniciais);
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState({ atual: 0, total: 0 });
  const inputCameraRef = useRef(null);
  const inputGaleriaRef = useRef(null);

  async function handleArquivos(e) {
    const arquivos = [...e.target.files];
    if (!arquivos.length) return;

    setEnviando(true);
    setProgresso({ atual: 0, total: arquivos.length });

    const novasUrls = [];
    for (const arq of arquivos) {
      try {
        const url = await uploadFoto(empresaId, agendamentoId, arq);
        novasUrls.push(url);
        setProgresso(p => ({ ...p, atual: p.atual + 1 }));
      } catch (err) {
        console.error("Erro no upload:", err);
        toast.error(`Erro ao enviar "${arq.name}": ${err.message}`);
      }
    }

    if (novasUrls.length > 0) {
      const todasFotos = [...fotos, ...novasUrls];
      setFotos(todasFotos);
      onFotosChange(todasFotos);
    }

    setEnviando(false);
    setProgresso({ atual: 0, total: 0 });
    e.target.value = "";
  }

  function removerFoto(idx) {
    const novasFotos = fotos.filter((_, i) => i !== idx);
    setFotos(novasFotos);
    onFotosChange(novasFotos);
  }

  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
        {label}
      </p>

      <div className="flex flex-wrap gap-2">
        {/* Thumbnails */}
        {fotos.map((url, idx) => (
          <div key={idx} className="relative w-20 h-20 flex-shrink-0">
            <img
              src={url}
              alt={`Foto ${idx + 1}`}
              className="w-full h-full object-cover rounded-xl border border-gray-200"
            />
            <button
              onClick={() => removerFoto(idx)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
            >
              <X size={11} />
            </button>
          </div>
        ))}

        {/* Botão câmera */}
        <button
          onClick={() => inputCameraRef.current?.click()}
          disabled={enviando}
          title="Tirar foto"
          className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-[#7b8cd4] hover:text-[#7b8cd4] transition-colors flex-shrink-0 active:scale-95 disabled:opacity-50"
        >
          {enviando
            ? <Loader2 size={20} className="animate-spin" />
            : <Camera size={20} />}
          <span className="text-[10px] mt-1 font-medium">
            {enviando ? `${progresso.atual}/${progresso.total}` : "Câmera"}
          </span>
        </button>

        {/* Botão galeria */}
        {!enviando && (
          <button
            onClick={() => inputGaleriaRef.current?.click()}
            title="Selecionar da galeria"
            className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-[#7b8cd4] hover:text-[#7b8cd4] transition-colors flex-shrink-0 active:scale-95"
          >
            <ImagePlus size={20} />
            <span className="text-[10px] mt-1 font-medium">Galeria</span>
          </button>
        )}
      </div>

      {/* Input câmera — abre diretamente a câmera */}
      <input
        ref={inputCameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleArquivos}
        className="hidden"
      />

      {/* Input galeria — abre seletor de arquivos */}
      <input
        ref={inputGaleriaRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleArquivos}
        className="hidden"
      />
    </div>
  );
}
