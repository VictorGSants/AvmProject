import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePageGestor from "../pages/HomePageGestor";
import HomePageTecnico from "../pages/HomePageTecnico";
import AuthLogin from "../pages/Login";
import ProtectedRoutes from "./ProtectecRoutes";
import NovaOs from "../pages/NovaOs";
import AgendaTecnico from "../pages/Agenda";
import PmocTecnico from "../pages/PmocTecnico";
import CadastrarEquipamento from "../pages/CadastrarEquipamento"
import VerOsGestor from "../pages/VerOsGestor";
import PmocGestor from "../pages/PmocGestor";

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthLogin />}></Route>
        <Route path="*" element={<div>Página não encontrada</div>}></Route>

        <Route path="/gestor" element={    
          <ProtectedRoutes>
            <HomePageGestor />
          </ProtectedRoutes>}>
        </Route>

        <Route path="/gestor/novaOs" element={    
          <ProtectedRoutes>
            <NovaOs />
          </ProtectedRoutes>}>
        </Route>

        <Route path="/gestor/cadastrarEquipamento" element={    
          <ProtectedRoutes>
            <CadastrarEquipamento/>
          </ProtectedRoutes>}>
        </Route>

        <Route path="/gestor/verOsGestor" element={    
          <ProtectedRoutes>
            <VerOsGestor/>
          </ProtectedRoutes>}>
        </Route>
        
        <Route path="/gestor/pmoc" element={    
          <ProtectedRoutes>
            <PmocGestor/>
          </ProtectedRoutes>}>
        </Route>


        <Route path="/tecnico" element={
          <ProtectedRoutes>
            <HomePageTecnico />
          </ProtectedRoutes>}>
        </Route>


        <Route path="/tecnico/agenda" element={    
          <ProtectedRoutes>
            <AgendaTecnico />
          </ProtectedRoutes>}>
        </Route>
      
    
        <Route path="/tecnico/pmoc" element={    
          <ProtectedRoutes>
            <PmocTecnico />
          </ProtectedRoutes>}>
        </Route>


        
      </Routes>
    </BrowserRouter>
  );
}
