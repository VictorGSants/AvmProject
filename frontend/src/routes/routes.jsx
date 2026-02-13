import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePageGestor from "../pages/HomePageGestor";
import HomePageTecnico from "../pages/HomePageTecnico";
import AuthLogin from "../pages/Login";
import ProtectedRoutes from "./ProtectecRoutes";
import NovaOs from "../pages/NovaOs";
import AgendaTecnico from "../pages/Agenda";
import CadastrarEquipamento from "../pages/CadastrarEquipamento"
import PmocGestor from "../pages/PmocGestor";
import EditarEquip from "../pages/EditarEquip";
import MapaHospital from "../pages/mapaHospital";
import HistoricoDeManutencoes from "../pages/HistoricoDeManutencoes";
import PmocTecnico from "../pages/PmocTecnico"
import PatraoContratos from "../pages/PatraoContratos";
import ContratoProvider  from "../context/ContratoContext";


export default function RouterApp() {
  return (
    <BrowserRouter>
      <ContratoProvider>

        <Routes>

          <Route path="/" element={<AuthLogin />} />

          <Route
            path="/patrao"
            element={
              <ProtectedRoutes>
                <PatraoContratos />
              </ProtectedRoutes>
            }
          />

          {/* Gestor */}
          <Route
            path="/gestor/:contratoId"
            element={
              <ProtectedRoutes>
                <HomePageGestor />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/gestor/:contratoId/novaOs"
            element={
              <ProtectedRoutes>
                <NovaOs />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/gestor/:contratoId/cadastrarEquipamento"
            element={
              <ProtectedRoutes>
                <CadastrarEquipamento />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/gestor/:contratoId/editarEquip"
            element={
              <ProtectedRoutes>
                <EditarEquip key={window.location.pathname} />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/gestor/:contratoId/historico"
            element={
              <ProtectedRoutes>
                <HistoricoDeManutencoes />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/gestor/:contratoId/pmoc"
            element={
              <ProtectedRoutes>
                <PmocGestor />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/gestor/:contratoId/mapa"
            element={
              <ProtectedRoutes>
                <MapaHospital />
              </ProtectedRoutes>
            }
          />

          {/* Técnico */}

          <Route
            path="/tecnico/:contratoId"
            element={
              <ProtectedRoutes>
                <HomePageTecnico />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/tecnico/:contratoId/pmoc"
            element={
              <ProtectedRoutes>
                <PmocTecnico />
              </ProtectedRoutes>
            }
          />

          <Route path="*" element={<div>Página não encontrada</div>} />

        </Routes>

      </ContratoProvider>
    </BrowserRouter>
  );
}

