
import { useState } from "react"
import { contracts } from "../services/contracts/contractsService"
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
export default function SelecionarContratos(){
  const navigate = useNavigate()
  const [contratos, setContratos] = useState([]);
  const {empresaId} = useParams();
  useEffect(() => {
  contracts(empresaId).then(dados => setContratos(dados));
  
  }, [])
  return(
    
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Header/>
      
      {contratos.map((contrato) => (
        <div
            key={contrato.id}
            onClick={() => navigate(`/gestor/${empresaId}/${contrato.id}`)}
            className="bg-white rounded-2xl border p-5 cursor-pointer hover:shadow-md transition"
          >
            <p className="font-semibold text-lg">{contrato.nome}</p>
            <p className="text-gray-500 text-sm">{contrato.descricao}</p>
            <p className="text-gray-400 text-xs mt-2">{contrato.AosCuidadosDe}</p>
        </div>
      ))}
    </div>
  )
}