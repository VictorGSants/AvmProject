
import { CONTRATOS } from "../contracts"
import { useNavigate } from "react-router-dom"
import { Building2 } from "lucide-react";
export default function PatraoContratos(){

  const navigate = useNavigate();

  return(
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Selecionar Contrato</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(CONTRATOS).map((contrato) => (
          <div onClick={() => navigate(`/gestor/${contrato.id}`)}
          key={contrato.id}
          className="bg-white p-6 rounded-2xl shadow cursor-pointer hover:scale-105 transition"
          >
            <Building2 className="text-blue-600 mb-3" size={28} />
            <h2 className="text-xl font-semibold">{contrato.nome}</h2>
            <p className="text-gray-600">{contrato.descricao}</p>  
          </div>
        ))}
      </div>
    </div>
  )
}