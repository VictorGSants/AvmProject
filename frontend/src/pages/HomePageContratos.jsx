import React from 'react';
import Header from '../components/Header';
import {CardsContratos} from '../components/Card';

export default function HomePageContratos() {
  

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header title="Painel do Gestor" />
      <CardsContratos title="Cards Gestor"/>
    </div>
  );
}
