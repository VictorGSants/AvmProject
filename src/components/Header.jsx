// src/components/Header.jsx
export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">AVM - Ordem de Serviço</h1>
        <nav className="space-x-4">
          <a href="#" className="hover:text-blue-200">Início</a>
          <a href="#" className="hover:text-blue-200">Criar OS</a>
          <a href="#" className="hover:text-blue-200">Consultar</a>
        </nav>
      </div>
    </header>
  );
}
