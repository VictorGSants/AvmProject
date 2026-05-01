import { useState, useRef } from "react";
import { Camera, X, Loader2, ImagePlus } from "lucide-react";
import { uploadFoto } from "../../services/storage/uploadFotos";

// Permite tirar/selecionar fotos e faz upload para o Firebase Storage.
// `capture="environment"` abre a câmera traseira diretamente no mobile.
export default function FotoUpload({ empresaId, agendamentoId, fotosIniciais = [], onFotosChange }) {
  const [fotos, setFotos] = useState(fotosIniciais);
  const [enviando, setEnviando] = useState(false);
  const inputRef = useRef(null);

  async function handleArquivos(e) {
    const arquivos = [...e.target.files];
    if (!arquivos.length) return;

    setEnviando(true);
    try {
      // Faz upload de todos os arquivos em paralelo
      const novasUrls = await Promise.all(
        arquivos.map(arq => uploadFoto(empresaId, agendamentoId, arq))
      );
      const todasFotos = [...fotos, ...novasUrls];
      setFotos(todasFotos);
      onFotosChange(todasFotos);
    } catch {
      alert("Erro ao enviar foto. Verifique a conexão e tente novamente.");
    } finally {
      setEnviando(false);
      // Limpa o input para permitir selecionar a mesma foto novamente
      e.target.value = "";
    }
  }

  function removerFoto(idx) {
    const novasFotos = fotos.filter((_, i) => i !== idx);
    setFotos(novasFotos);
    onFotosChange(novasFotos);
  }

  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
        Fotos do serviço
      </p>

      <div className="flex flex-wrap gap-2">
        {/* Thumbnails das fotos já enviadas */}
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

        {/* Botão de adicionar foto */}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
          className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-[#7b8cd4] hover:text-[#7b8cd4] transition-colors flex-shrink-0 active:scale-95"
        >
          {enviando
            ? <Loader2 size={20} className="animate-spin" />
            : <Camera size={20} />
          }
          <span className="text-[10px] mt-1 font-medium">
            {enviando ? "Enviando..." : "Foto"}
          </span>
        </button>
      </div>

      {/* Input oculto — capture="environment" abre câmera traseira no mobile */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleArquivos}
        className="hidden"
      />
    </div>
  );
}
