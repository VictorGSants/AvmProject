import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import HomePageGestor from "../pages/HomePageGestor";
import HomePageTecnico from "../pages/HomePageTecnico";
import AuthLogin from "../pages/Login";
import ProtectedRoutes from "./ProtectecRoutes";
import VerOs from "../pages/NovaOs";
import Agenda from "../pages/Agenda";
import Rotinas from "../pages/Rotinas";
import SelecionarContratosTecnico from "../pages/SelecionarContratosTecnico";
import PmocCliente from "../pages/PmocCliente";
import VerChamados from "../pages/VerChamados";
import CadastrarEquipamento from "../pages/CadastrarEquipamento";
import PmocGestor from "../pages/PmocGestor";
import EditarEquip from "../pages/EditarEquip";
import MapaHospital from "../pages/mapaHospital";
import HistoricoDeManutencoes from "../pages/HistoricoDeManutencoes";
import PmocTecnico from "../pages/PmocTecnico";
import ContratoProvider from "../context/ContratoContext";
import HomePageCliente from "../pages/HomePageCliente";
import SelecionarContratos from "../pages/SelecionarContratos";
import HomePageContratos from "../pages/HomePageContratos";
import NovoChamado from "../pages/NovoChamado";
import ListaOrcamentos from "../pages/ListaOrcamentos";
import NovoOrcamento from "../pages/NovoOrcamento";
import DetalheOrcamento from "../pages/DetalheOrcamento";
import GerenciarBiblioteca from "../pages/GerenciarBiblioteca";
import GerenciarClientes from "../pages/GerenciarClientes";
import SeedBiblioteca from "../pages/Seedbiblioteca";
import SeedEquipamentosPhotoUnicamp from "../pages/SeedEquipamentosPhotoUnicamp";
import HistoricoRotinas from "../pages/HistoricoRotinas";

export default function RouterApp() {
  return (
    <HashRouter>
      <ContratoProvider>
        <Routes>

          <Route path="/gestor/:empresaId/seed" element={<ProtectedRoutes><SeedBiblioteca /></ProtectedRoutes>} />
          <Route path="/gestor/:empresaId/:contratoId/seedEquip" element={<ProtectedRoutes><SeedEquipamentosPhotoUnicamp /></ProtectedRoutes>} />
          <Route path="/" element={<AuthLogin />} />

          {/* ===== GESTOR / PATRÃO ===== */}
          <Route path="/gestor/:empresaId/orcamentos"         element={<ProtectedRoutes><ListaOrcamentos /></ProtectedRoutes>} />
          <Route path="/gestor/:empresaId/orcamentos/novo"                       element={<ProtectedRoutes><NovoOrcamento /></ProtectedRoutes>} />
          <Route path="/gestor/:empresaId/orcamentos/:orcamentoId/editar"      element={<ProtectedRoutes><NovoOrcamento /></ProtectedRoutes>} />
          <Route path="/gestor/:empresaId/orcamentos/:orcamentoId"             element={<ProtectedRoutes><DetalheOrcamento /></ProtectedRoutes>} />
          <Route path="/gestor/:empresaId/clientes"           element={<ProtectedRoutes><GerenciarClientes /></ProtectedRoutes>} />
          <Route path="/gestor/:empresaId/biblioteca"         element={<ProtectedRoutes><GerenciarBiblioteca /></ProtectedRoutes>} />
          <Route path="/gestor/:empresaId/rotinas"            element={<ProtectedRoutes><HistoricoRotinas /></ProtectedRoutes>} />

          <Route path="/gestor/:empresaId" element={<ProtectedRoutes><HomePageGestor /></ProtectedRoutes>} />
          <Route path="/gestor/:empresaId/contratos" element={<ProtectedRoutes><SelecionarContratos /></ProtectedRoutes>} />
          <Route path="/gestor/:empresaId/:contratoId" element={<ProtectedRoutes><HomePageContratos /></ProtectedRoutes>} />
          <Route path="/gestor/:empresaId/novaOs" element={<ProtectedRoutes><VerOs /></ProtectedRoutes>} />
          <Route path="/gestor/:empresaId/agenda" element={<ProtectedRoutes><Agenda /></ProtectedRoutes>} />
          <Route path="/gestor/:empresaId/chamados" element={<ProtectedRoutes><VerChamados /></ProtectedRoutes>} />
          <Route path="/gestor/:empresaId/:contratoId/cadastrarEquipamento" element={<ProtectedRoutes><CadastrarEquipamento /></ProtectedRoutes>} />
          <Route path="/gestor/:empresaId/:contratoId/editarEquip" element={<ProtectedRoutes><EditarEquip key={window.location.pathname} /></ProtectedRoutes>} />
          <Route path="/gestor/:empresaId/:contratoId/historico" element={<ProtectedRoutes><HistoricoDeManutencoes /></ProtectedRoutes>} />
          <Route path="/gestor/:empresaId/:contratoId/pmoc" element={<ProtectedRoutes><PmocGestor /></ProtectedRoutes>} />
          <Route path="/gestor/:empresaId/:contratoId/pmoc/mapa" element={<ProtectedRoutes><MapaHospital /></ProtectedRoutes>} />

          {/* ===== CLIENTE ===== */}
          <Route path="/cliente/:empresaId/:contratoId" element={<ProtectedRoutes><HomePageCliente /></ProtectedRoutes>} />
          <Route path="/cliente/:empresaId/:contratoId/chamados" element={<ProtectedRoutes><NovoChamado /></ProtectedRoutes>} />
          <Route path="/cliente/:empresaId/:contratoId/historico" element={<ProtectedRoutes><HistoricoDeManutencoes /></ProtectedRoutes>} />
          <Route path="/cliente/:empresaId/:contratoId/pmoc" element={<ProtectedRoutes><PmocCliente /></ProtectedRoutes>} />

          {/* ===== TÉCNICO =====
              O login redireciona para /tecnico/:empresaId (sem contratoId).
              Agenda e Rotinas só precisam de empresaId — ficam em rotas próprias.
              PMOC e outras funcionalidades que precisam de contratoId mantêm o padrão /:contratoId. */}
          <Route path="/tecnico/:empresaId" element={<ProtectedRoutes><HomePageTecnico /></ProtectedRoutes>} />
          <Route path="/tecnico/:empresaId/agenda" element={<ProtectedRoutes><Agenda /></ProtectedRoutes>} />
          <Route path="/tecnico/:empresaId/rotinas" element={<ProtectedRoutes><Rotinas /></ProtectedRoutes>} />
          <Route path="/tecnico/:empresaId/contratos" element={<ProtectedRoutes><SelecionarContratosTecnico /></ProtectedRoutes>} />
          <Route path="/tecnico/:empresaId/:contratoId" element={<ProtectedRoutes><HomePageTecnico /></ProtectedRoutes>} />
          <Route path="/tecnico/:empresaId/:contratoId/agenda" element={<ProtectedRoutes><Agenda /></ProtectedRoutes>} />
          <Route path="/tecnico/:empresaId/:contratoId/rotinas" element={<ProtectedRoutes><Rotinas /></ProtectedRoutes>} />
          <Route path="/tecnico/:empresaId/:contratoId/pmoc" element={<ProtectedRoutes><PmocGestor /></ProtectedRoutes>} />

          <Route path="*" element={<div className="p-8 text-center text-gray-500">Página não encontrada</div>} />

        </Routes>
      </ContratoProvider>
    </HashRouter>
  );
}
