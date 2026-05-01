import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  CalendarCheck,
  AirVentIcon,
  PenBox,
  History,
  FileText,
  ClipboardCheck,
  Bell,
} from "lucide-react";
import { escutarChamadosAbertos } from "../services/contracts/chamadoService";

export default function Card() {
  const navigate = useNavigate();
  const { empresaId: empresaIdParam, contratoId } = useParams();
  const tipoUsuario = localStorage.getItem("tipoUsuario");

  // Técnicos chegam sem contratoId na URL — usa localStorage como fallback
  const empresaId = empresaIdParam || localStorage.getItem("empresa");

  // Só bloqueia se for cliente/gestor sem contrato (técnico não precisa de contratoId para agenda/rotinas)
  if (!contratoId && tipoUsuario !== "tecnico") {
    return <p className="text-center mt-10">Contrato não selecionado</p>;
  }

  const CardItem = ({ title, icon: Icon, path, badge }) => (
    <div
      onClick={() => navigate(path)}
      className="relative bg-white shadow-sm rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 border border-gray-100"
    >
      {badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      <div className="w-12 h-12 rounded-xl bg-[#f0f2ff] flex items-center justify-center mb-3">
        <Icon size={24} className="text-[#7b8cd4]" />
      </div>
      <p className="text-sm font-semibold text-gray-700 text-center">{title}</p>
    </div>
  );

  // ======================
  // GESTOR / PATRÃO
  // ======================
  if (tipoUsuario === "gestor" || tipoUsuario === "patrao") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <main className="flex-grow p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <CardItem title="Agenda"   icon={CalendarCheck} path={`/gestor/${empresaId}/agenda`} />
          <CardItem title="Ver OS"   icon={ClipboardList} path={`/gestor/${empresaId}/novaOs`} />
          <CardItem title="Chamados" icon={Bell}          path={`/gestor/${empresaId}/chamados`} />
        </main>
      </div>
    );
  }

  // ======================
  // CLIENTE
  // ======================
  if (tipoUsuario === "cliente") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <main className="flex-grow p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <CardItem title="Histórico" icon={History} path={`/cliente/${empresaId}/${contratoId}/historico`} />
          <CardItem title="PMOC" icon={ClipboardList} path={`/cliente/${empresaId}/${contratoId}/pmoc`} />
          <CardItem title="Novo Chamado" icon={PenBox} path={`/cliente/${empresaId}/${contratoId}/chamados`} />
        </main>
      </div>
    );
  }

  // ======================
  // TÉCNICO
  // Agenda e Rotinas usam rota sem contratoId (técnico não seleciona contrato no login).
  // PMOC inclui contratoId apenas se estiver disponível na URL.
  // ======================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-grow p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <CardItem title="Agenda"  icon={CalendarCheck}  path={`/tecnico/${empresaId}/agenda`} />
        <CardItem title="Rotinas" icon={ClipboardCheck}  path={`/tecnico/${empresaId}/rotinas`} />
        <CardItem title="PMOC"    icon={ClipboardList}   path={`/tecnico/${empresaId}/contratos`} />
      </main>
    </div>
  );
}

export function CardsHome() {
  const navigate = useNavigate();
  const { empresaId } = useParams();
  const [chamadosAbertos, setChamadosAbertos] = useState(0);

  useEffect(() => {
    if (!empresaId) return;
    const unsub = escutarChamadosAbertos(empresaId, setChamadosAbertos);
    return unsub;
  }, [empresaId]);

  const CardItem = ({ title, icon: Icon, path, badge }) => (
    <div
      onClick={() => navigate(path)}
      className="relative bg-white shadow-sm rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 border border-gray-100"
    >
      {badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      <div className="w-12 h-12 rounded-xl bg-[#f0f2ff] flex items-center justify-center mb-3">
        <Icon size={24} className="text-[#7b8cd4]" />
      </div>
      <p className="text-sm font-semibold text-gray-700 text-center">{title}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-grow p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <CardItem title="Agenda"   icon={CalendarCheck} path={`/gestor/${empresaId}/agenda`} />
        <CardItem title="Ver OS"   icon={ClipboardList} path={`/gestor/${empresaId}/novaOs`} />
        <CardItem title="Contratos" icon={FileText}     path={`/gestor/${empresaId}/contratos`} />
        <CardItem title="Chamados" icon={Bell}          path={`/gestor/${empresaId}/chamados`} badge={chamadosAbertos} />
      </main>
    </div>
  );
}

export function CardsContratos() {
  const navigate = useNavigate();
  const { empresaId, contratoId } = useParams();

  const CardItem = ({ title, icon: Icon, path }) => (
    <div
      onClick={() => navigate(path)}
      className="bg-white shadow-sm rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 border border-gray-100"
    >
      <div className="w-12 h-12 rounded-xl bg-[#f0f2ff] flex items-center justify-center mb-3">
        <Icon size={24} className="text-[#7b8cd4]" />
      </div>
      <p className="text-sm font-semibold text-gray-700 text-center">{title}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-grow p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <CardItem title="Cadastrar Equipamento" icon={AirVentIcon} path={`/gestor/${empresaId}/${contratoId}/cadastrarEquipamento`} />
        <CardItem title="Histórico" icon={History} path={`/gestor/${empresaId}/${contratoId}/historico`} />
        <CardItem title="PMOC" icon={ClipboardList} path={`/gestor/${empresaId}/${contratoId}/pmoc`} />
        <CardItem title="Editar Equipamento" icon={PenBox} path={`/gestor/${empresaId}/${contratoId}/editarEquip`} />
      </main>
    </div>
  );
}
