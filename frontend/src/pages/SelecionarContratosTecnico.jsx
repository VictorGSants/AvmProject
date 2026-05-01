import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { getContratosDoTecnico } from "../services/contracts/contractsService";
import { ClipboardList, Loader2, ChevronRight } from "lucide-react";

export default function SelecionarContratosTecnico() {
  const { empresaId } = useParams();
  const navigate = useNavigate();
  const uid = localStorage.getItem("uid") || "";

  const [contratos, setContratos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!empresaId || !uid) return;
    getContratosDoTecnico(empresaId, uid)
      .then(setContratos)
      .finally(() => setCarregando(false));
  }, [empresaId, uid]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="p-4 md:p-6 max-w-xl mx-auto pb-10">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList size={22} className="text-[#7b8cd4]" />
          <h1 className="text-xl font-bold text-gray-800">Selecionar Contrato</h1>
        </div>
        <p className="text-sm text-gray-500 mb-5">Escolha o contrato para acessar o PMOC.</p>

        {carregando && (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#7b8cd4]" />
          </div>
        )}

        {!carregando && contratos.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum contrato atribuído a você.</p>
          </div>
        )}

        {!carregando && contratos.length > 0 && (
          <div className="space-y-3">
            {contratos.map(contrato => (
              <div
                key={contrato.id}
                onClick={() => navigate(`/tecnico/${empresaId}/${contrato.id}/pmoc`)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-800">{contrato.nome}</p>
                  {contrato.descricao && (
                    <p className="text-sm text-gray-500 mt-0.5">{contrato.descricao}</p>
                  )}
                  {contrato.AosCuidadosDe && (
                    <p className="text-xs text-gray-400 mt-1">Resp: {contrato.AosCuidadosDe}</p>
                  )}
                </div>
                <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
