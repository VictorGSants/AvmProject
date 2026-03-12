import { useEffect, useState } from "react";
import Header from "../components/Header";
import { EMPRESAID } from "../config/empresa";
import {
  listarEquipamentosPMOC,
  registrarPMOC
} from "../services/pmocServices";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import Modal from "../components/Modal";

export default function PmocGestor() {
  

  const { contratoId } = useParams();

  console.log("PMOC contratoId:", contratoId);


  const [equipamentos, setEquipamentos] = useState([]);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);
  const [descricao, setDescricao] = useState("");
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");

  //----------------------------------

  useEffect(() => {

  if (!contratoId || contratoId === "contratoid") return;

  carregar();

}, [contratoId]);


  //----------------------------------

  async function carregar() {
    
    try {

      setLoading(true);

      const dados = await listarEquipamentosPMOC(
        EMPRESAID,
        contratoId
      );

      setEquipamentos(dados || []);

    } catch (e) {

      console.error("Erro ao carregar PMOC:", e);
      toast.error("Erro ao carregar equipamentos");

    } finally {
      setLoading(false);
    }
  }

  //----------------------------------

  function statusEquipamento(eq) {

    if (!eq.proximaManutencao) return "fazer";

    const hoje = new Date();

    const prox = eq.proximaManutencao.toDate
      ? eq.proximaManutencao.toDate()
      : new Date(eq.proximaManutencao);

    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const mesProx = prox.getMonth();
    const anoProx = prox.getFullYear();

    if (anoProx < anoAtual || (anoProx === anoAtual && mesProx < mesAtual))
       return "atrasado";

    if (anoProx === anoAtual && mesProx < mesAtual)
       return "Fazer";

    return "OK";
  }

  //----------------------------------

  function fecharModal() {
    setEquipamentoSelecionado(null);
    setDescricao("");
    setObservacao("");
  }

  //----------------------------------

  async function marcarPMOC() {

    if (!descricao) {
      toast.error("Descreva a manutenção");
      return;
    }

    try {

      await registrarPMOC(
        EMPRESAID,
        contratoId,
        equipamentoSelecionado,
        descricao,
        observacao
      );

      toast.success("PMOC registrada!");

      fecharModal();
      carregar();

    } catch (e) {

      console.error(e);
      toast.error("Erro ao registrar PMOC");
    }
  }

  //----------------------------------

 const blocos = {};

  // Filtra os equipamentos com base no que foi digitado
  const equipamentosFiltrados = equipamentos.filter(eq => 
    eq.nome?.toLowerCase().includes(busca.toLowerCase()) || 
    eq.codigo?.toLowerCase().includes(busca.toLowerCase()) ||
    eq.local?.toLowerCase().includes(busca.toLowerCase())
  );

  equipamentosFiltrados.forEach(eq => {
    const bloco = eq.bloco || "SEM BLOCO";
    if (!blocos[bloco]) blocos[bloco] = [];
    blocos[bloco].push(eq);
  });

  //----------------------------------

  return (
    <div className="max-w-6xl mx-auto p-4">

      <Header />

      <h1 className="text-3xl font-bold text-center mb-8">
        Controle de PMOC
      </h1>

      <div className="mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Pesquisar por nome, código ou local..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-500">
          Carregando equipamentos...
        </p>
      )}

      {!loading && Object.keys(blocos).sort().map(bloco => (
        <div key={bloco} className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* CABEÇALHO DO BLOCO */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h2 className="font-extrabold text-xl text-gray-800 flex items-center gap-3">
              🏢 Bloco {bloco}
              <span className="text-sm font-medium bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
                {blocos[bloco].length} equipamentos
              </span>
            </h2>
          </div>

          {/* GRID DE EQUIPAMENTOS */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {blocos[bloco].sort((a,b) => a.codigo.localeCompare(b.codigo)).map(eq => {
              
              const status = statusEquipamento(eq);

              // Configuração das cores baseadas no status
              let corBorda = "";
              let corBadge = "";
              let textoStatus = "";

              if (status === "atrasado") {
                corBorda = "border-l-red-500";
                corBadge = "bg-red-100 text-red-800 border-red-200";
                textoStatus = "🚨 Atrasado";
              } else if (status === "fazer") {
                corBorda = "border-l-yellow-400";
                corBadge = "bg-yellow-100 text-yellow-800 border-yellow-200";
                textoStatus = "⚠️ Fazer este mês";
              } else {
                corBorda = "border-l-green-500";
                corBadge = "bg-green-100 text-green-800 border-green-200";
                textoStatus = "✅ Visitado";
              }

              return (
                <div
                  key={eq.id}
                  onClick={() => setEquipamentoSelecionado(eq)}
                  className={`relative flex flex-col justify-between p-5 bg-white border border-gray-200 border-l-4 rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${corBorda}`}
                >
                  
                  {/* DADOS PRINCIPAIS DO CARD */}
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-800 text-lg leading-tight pr-2">
                        {eq.nome}
                      </h3>
                      <span className="bg-gray-100 text-gray-600 text-xs font-extrabold px-2 py-1 rounded border border-gray-200 whitespace-nowrap">
                        {eq.codigo}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                      📍 {eq.local || "Local não informado"}
                    </p>
                  </div>

                  {/* RODAPÉ DO CARD COM STATUS */}
                  <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${corBadge}`}>
                      {textoStatus}
                    </span>
                    <span className="text-gray-400 text-sm font-medium hover:text-blue-600 transition-colors">
                      Registrar ➔
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* MODAL */}

      <Modal
        aberto={!!equipamentoSelecionado}
        onClose={fecharModal}
        titulo="Registrar PMOC"
      >

        {/* DADOS DO EQUIPAMENTO MELHORADOS */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              {equipamentoSelecionado?.nome}
            </h3>
            {/* Badge para o Código */}
            <span className="bg-blue-100 text-blue-800 text-xs font-extrabold px-3 py-1 rounded-full border border-blue-200">
              {equipamentoSelecionado?.codigo}
            </span>
          </div>

          {/* Grid em duas colunas para organizar as informações */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">
                Local
              </span>
              <span className="font-medium text-gray-800">
                {equipamentoSelecionado?.local || "Não informado"}
              </span>
            </div>
            
            <div>
              <span className="block text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">
                Fabricante / Modelo
              </span>
              <span className="font-medium text-gray-800">
                {equipamentoSelecionado?.fabricante || "-"} • {equipamentoSelecionado?.modelo || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* CAMPOS DE PREENCHIMENTO MELHORADOS */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Descrição da Manutenção <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Ex: Limpeza de filtros, medição de corrente e verificação de gás..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none shadow-sm"
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Observações (Opcional)
            </label>
            <textarea
              placeholder="Ex: Equipamento apresentando ruído na turbina..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none shadow-sm"
              rows={2}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>
        </div>

        {/* BOTÕES MELHORADOS */}
        <div className="flex gap-3 pt-3 border-t border-gray-200">
          <button
            onClick={fecharModal}
            className="flex-1 py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={marcarPMOC}
            className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-md transition-colors flex justify-center items-center gap-2"
          >
            <span>Registrar PMOC</span>
          </button>
        </div>

      </Modal>

    </div>
  );
}
