import { useNavigate } from "react-router-dom";
import { PlusCircle, UserPlus, List, ClipboardList, CalendarCheck } from "lucide-react";

export default function Card() {
  const navigate = useNavigate();

  const tipoUsuario = localStorage.getItem("tipoUsuario");

  // 🔹 Componente interno para cada card individual
  const CardItem = ({ title, icon: Icon, path }) => (
    <div
      onClick={() => navigate(path)}
      className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95"
    >
      <Icon size={36} className="text-blue-600 mb-3" />
      <p className="text-lg font-semibold text-gray-800 text-center">{title}</p>
    </div>
  );

  // 🔹 Cards exibidos em grade
  
    if (tipoUsuario == 'gestor') {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col">
                <main className="flex-grow p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <CardItem title="Criar Nova OS" icon={PlusCircle} path="/gestor/novaOs" />
                    <CardItem title="Cadastrar Técnico" icon={UserPlus} path="/gestor/cadastrarTecnico" />
                    <CardItem title="Ver OS" icon={List} path="/gestor/verOsGestor" />
                    <CardItem title="PMOC" icon={ClipboardList} path="/gestor/pmoc" />
                </main>
            </div>  
  )
} else {
    return(
        <div className="min-h-screen bg-gray-100 flex flex-col">
                <main className="flex-grow p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <CardItem title="Agenda" icon={CalendarCheck} path="/tecnico/agenda" />
                    <CardItem title="Ver OS" icon={List} path="/tecnico/verOs" />
                    <CardItem title="PMOC" icon={ClipboardList} path="/tecnico/pmoc" />
                </main>
            </div>  
    )
};
}
