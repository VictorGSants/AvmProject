import { useRef, useState, useEffect } from "react";
import { RotateCcw, Check } from "lucide-react";

export default function AssinaturaPad({ onConfirmar, onCancelar }) {
  const canvasRef = useRef(null);
  // Usar ref para o flag de desenho evita re-renders a cada traço
  const desenhando = useRef(false);
  const ultimaPosicao = useRef({ x: 0, y: 0 });
  const [temTraco, setTemTraco] = useState(false);

  useEffect(() => {
    // Iguala o tamanho real (em pixels físicos) ao tamanho visual do canvas.
    // Sem isso, em telas retina ou quando o CSS escala o canvas, as coordenadas
    // de toque ficam deslocadas em relação ao traço desenhado.
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function iniciar(e) {
    e.preventDefault();
    desenhando.current = true;
    ultimaPosicao.current = getPos(e);
  }

  function desenhar(e) {
    e.preventDefault();
    if (!desenhando.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(ultimaPosicao.current.x, ultimaPosicao.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ultimaPosicao.current = pos;
    setTemTraco(true);
  }

  function encerrar(e) {
    e?.preventDefault();
    desenhando.current = false;
  }

  function limpar() {
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.getContext("2d").clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setTemTraco(false);
  }

  function confirmar() {
    onConfirmar(canvasRef.current.toDataURL("image/png"));
  }

  return (
    <div className="mt-2">
      <p className="text-xs font-semibold text-gray-500 text-center uppercase tracking-wide mb-2">
        Solicite a assinatura do cliente / responsável
      </p>

      {/* touch-none impede que o scroll da página interfira no desenho em mobile */}
      <canvas
        ref={canvasRef}
        className="w-full h-36 border-2 border-dashed border-[#7b8cd4] rounded-xl bg-gray-50 touch-none cursor-crosshair"
        onMouseDown={iniciar}
        onMouseMove={desenhar}
        onMouseUp={encerrar}
        onMouseLeave={encerrar}
        onTouchStart={iniciar}
        onTouchMove={desenhar}
        onTouchEnd={encerrar}
      />

      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={limpar}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RotateCcw size={14} />
          Limpar
        </button>
        <button
          type="button"
          onClick={confirmar}
          disabled={!temTraco}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-40 transition-colors"
        >
          <Check size={14} />
          Confirmar Assinatura
        </button>
      </div>

      <button
        type="button"
        onClick={onCancelar}
        className="w-full mt-2 py-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        Cancelar
      </button>
    </div>
  );
}
