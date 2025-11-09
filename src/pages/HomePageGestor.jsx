import React from 'react';
import Header from '../components/Header';
import { ClipboardList, List, PlusCircle, UserPlus } from "lucide-react";
import { useNavigate } from 'react-router-dom';


export default function HomePageGestor() {
  const navigate = useNavigate();

   const Card = ({ title, icon: Icon, path }) => (
    <div
      onClick={() => navigate(path)}
      className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95"
    >
      <Icon size={36} className="text-blue-600 mb-3" />
      <p className="text-lg font-semibold text-gray-800 text-center">{title}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header title="Painel do Gestor" />

      <main className="flex-grow p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card title="Criar Nova OS" icon={PlusCircle} path="/gestor/nova-os" />
        <Card title="Cadastrar Técnico" icon={UserPlus} path="/gestor/cadastrar-tecnico" />
        <Card title="Ver OS" icon={List} path="/gestor/ordens" />
        <Card title="PMOC" icon={ClipboardList} path="/gestor/pmoc" />
      </main>
    </div>
  );
}
