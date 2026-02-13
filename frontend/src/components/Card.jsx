import { useNavigate, useParams } from "react-router-dom";
import {
  PlusCircle,
  ClipboardList,
  CalendarCheck,
  AirVentIcon,
  PenBox,
  Map,
  History
} from "lucide-react";

export default function Card() {
  const navigate = useNavigate();
  const { contratoId } = useParams();
  const tipoUsuario = localStorage.getItem("tipoUsuario");
  console.log(contratoId)
  if (!contratoId) {
    return <p className="text-center mt-10">Contrato não selecionado</p>;
  }

  const CardItem = ({ title, icon: Icon, path }) => (
    <div
      onClick={() => navigate(path)}
      className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95"
    >
      <Icon size={36} className="text-blue-600 mb-3" />
      <p className="text-lg font-semibold text-gray-800 text-center">
        {title}
      </p>
    </div>
  );

  // ======================
  // GESTOR / PATRÃO
  // ======================
  if (tipoUsuario === "gestor" || tipoUsuario === "patrao") {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <main className="flex-grow p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">

          <CardItem title="Criar Nova OS" icon={PlusCircle} path={`/gestor/${contratoId}/novaOs`} />
          <CardItem title="Cadastrar Equipamento" icon={AirVentIcon} path={`/gestor/${contratoId}/cadastrarEquipamento`} />
          <CardItem title="Histórico" icon={History} path={`/gestor/${contratoId}/historico`} />
          <CardItem title="PMOC" icon={ClipboardList} path={`/gestor/${contratoId}/pmoc`} />
          <CardItem title="Editar Equipamento" icon={PenBox} path={`/gestor/${contratoId}/editarEquip`} />
          <CardItem title="Mapa" icon={Map} path={`/gestor/${contratoId}/mapa`} />

        </main>
      </div>
    );
  }

  // ======================
  // TÉCNICO
  // ======================
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-grow p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">

        <CardItem title="Agenda" icon={CalendarCheck} path={`/tecnico/${contratoId}/agenda`} />
        <CardItem title="PMOC" icon={ClipboardList} path={`/tecnico/${contratoId}/pmoc`} />
        <CardItem title="Mapa" icon={Map} path={`/tecnico/${contratoId}/mapa`} />

      </main>
    </div>
  );
}
