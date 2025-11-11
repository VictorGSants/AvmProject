import React from 'react';
import Header from '../components/Header';
import Card from '../components/Card';



export default function HomePageGestor() {
  

   

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header title="Painel do Tecnico" />
      <Card title="Card tecnico"/>
      
    </div>
  );
}
