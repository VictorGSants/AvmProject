import React from 'react';
import Header from '../components/Header';
import Card from '../components/Card';

export default function HomePageCliente() {
  

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header title="Painel do Gestor" />
      <Card title="Cards cliente"/>
     
    </div>
  );
}
