import { X } from "lucide-react";

export default function VisualizadorFoto({ url, onClose }) {
  if (!url) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white"
      >
        <X size={28} />
      </button>
      <img
        src={url}
        alt="Foto ampliada"
        onClick={e => e.stopPropagation()}
        className="max-w-full max-h-full object-contain rounded-lg cursor-default"
      />
    </div>
  );
}
