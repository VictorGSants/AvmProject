import React from 'react';
import Header from '../components/Header';
export default function HomePageTecnico() {

  return (
    <div>
        <Header>
          <main className='p-6'>
            <h2>Area do Tecnico</h2>
            <p className='text-2xl font-semibold'>Aqui ficarão as ordens de serviço designadas a você.</p>
          </main>
        </Header>
    </div>
  );
};

