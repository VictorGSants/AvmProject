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

    if (!eq.proximaManutencao) return "pendente";

    const hoje = new Date();

    const prox = eq.proximaManutencao.toDate
      ? eq.proximaManutencao.toDate()
      : new Date(eq.proximaManutencao);

    if (prox < hoje) return "atrasado";

    if (
      prox.getMonth() === hoje.getMonth() &&
      prox.getFullYear() === hoje.getFullYear()
    )
      return "vence";

    return "ok";
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

  equipamentos.forEach(eq => {
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

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-500">
          Carregando equipamentos...
        </p>
      )}

      {!loading && Object.keys(blocos).map(bloco => (

        <div key={bloco} className="mb-6">

          <h2 className="font-bold text-xl mb-3">
            Bloco {bloco}
          </h2>

          <div className="grid gap-3">

            {blocos[bloco].map(eq => {

              const status = statusEquipamento(eq);

              const cor =
                status === "atrasado"
                  ? "bg-red-100 border-red-500"
                  : status === "vence"
                  ? "bg-yellow-100 border-yellow-500"
                  : "bg-green-100 border-green-500";

              return (

                <div
                  key={eq.id}
                  onClick={() => setEquipamentoSelecionado(eq)}
                  className={`p-4 border rounded-xl cursor-pointer hover:scale-[1.01] transition ${cor}`}
                >

                  <b>{eq.nome}</b> — {eq.codigo}

                  <div className="text-sm font-semibold">
                    {status.toUpperCase()}
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

        {/* DADOS DO EQUIPAMENTO */}
        <div className="mb-4 border-b pb-3">

          <h3 className="text-lg font-bold">
            {equipamentoSelecionado?.nome}
          </h3>

          <div className="text-sm text-gray-600">
            Código: {equipamentoSelecionado?.codigo}
          </div>

          <div className="text-sm text-gray-600">
            Local: {equipamentoSelecionado?.local}
          </div>

          <div className="text-sm text-gray-600">
            {equipamentoSelecionado?.fabricante} • {equipamentoSelecionado?.modelo}
          </div>

        </div>

        {/* CAMPOS */}

        <textarea
          placeholder="Descreva a manutenção realizada..."
          className="border w-full p-2 mb-3 rounded"
          rows={3}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <textarea
          placeholder="Observações (opcional)"
          className="border w-full p-2 mb-4 rounded"
          rows={2}
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />

        {/* BOTÕES */}

        <div className="flex gap-2">

          <button
            onClick={fecharModal}
            className="w-full border p-2 rounded font-semibold hover:bg-gray-100"
          >
            Cancelar
          </button>

          <button
            onClick={marcarPMOC}
            className="w-full bg-green-600 text-white p-2 rounded font-bold hover:bg-green-700"
          >
            Registrar PMOC
          </button>

        </div>

      </Modal>

    </div>
  );
}
