import { useNavigate } from "react-router-dom";
import { PlusCircle, UserPlus, List, ClipboardList, CalendarCheck, AirVentIcon, Pen, PenBox, MapPlus, MapMinus, Map, History } from "lucide-react";
import { ArchiveBoxArrowDownIcon } from "@heroicons/react/16/solid";
import { MapIcon } from "@heroicons/react/20/solid";

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
                    <CardItem title="Cadastrar Equipamento" icon={AirVentIcon} path="/gestor/cadastrarEquipamento" />
                    <CardItem title="Histórico de Manutenções" icon={History} path="/gestor/historicoDeManutencoes" />

                    <CardItem title="PMOC" icon={ClipboardList} path="/gestor/pmoc" />
                    <CardItem title="Editar Registro de Equipamento" icon={PenBox} path="/gestor/EditarEquip" />
                    <CardItem title="Mapa Hospital" icon={Map} path="/mapaHospital" />
                </main>
            </div>  
  )
} else {
    return(
        <div className="min-h-screen bg-gray-100 flex flex-col">
                <main className="flex-grow p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <CardItem title="Agenda" icon={CalendarCheck} path="/tecnico/agenda" />
                  
                    <CardItem title="PMOC" icon={ClipboardList} path="/tecnico/pmoc" />
                </main>
            </div>  
    )
};
}
