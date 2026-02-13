export default function Modal({ aberto, onClose, children, titulo }) {

  if (!aberto) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white p-6 rounded-2xl w-[420px] relative shadow-xl"
      >
        {/* BOTÃO X */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl font-bold text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">
          {titulo}
        </h2>

        {children}
      </div>
    </div>
  );
}
