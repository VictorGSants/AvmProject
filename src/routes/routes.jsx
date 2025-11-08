import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePageGestor from "../pages/HomePageGestor";
import HomePageTecnico from "../pages/HomePageTecnico";
import AuthLogin from "../pages/Login";
import ProtectedRoutes from "./ProtectecRoutes";

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthLogin />}></Route>

        <Route path="/tecnico" element={
          <ProtectedRoutes>
            <HomePageTecnico />
          </ProtectedRoutes>}>
        </Route>
        
        <Route path="/gestor" element={    
          <ProtectedRoutes>
            <HomePageGestor />
          </ProtectedRoutes>}>
        </Route>
      
        <Route path="*" element={<div>Página não encontrada</div>}></Route>
      </Routes>
    </BrowserRouter>
  );
}
