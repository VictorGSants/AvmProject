import { Check } from "lucide-react";

export default function ItemChecklist({ item, marcado, onToggle }) {
  return (
    <div
      onClick={() => onToggle(item.id)}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer select-none transition-all active:scale-95 ${
        marcado
          ? "bg-green-50 border border-green-200"
          : "bg-white border border-gray-100 hover:border-gray-200"
      }`}
    >
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          marcado ? "bg-green-500 border-green-500" : "border-gray-300"
        }`}
      >
        {marcado && <Check size={13} className="text-white" />}
      </div>
      <span
        className={`text-sm transition-colors ${
          marcado ? "text-gray-400 line-through" : "text-gray-700"
        }`}
      >
        {item.item}
      </span>
    </div>
  );
}
