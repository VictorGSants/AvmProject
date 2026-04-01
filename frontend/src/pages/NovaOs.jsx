import {useParams} from "react-router-dom"
import { criarOs, getOs } from "../services/osService";
import { useState, useEffect } from "react";
import { EMPRESAID } from "../config/empresa";


export default function NovaOs(){

  const [abrirForm, setAbrirForm] = useState(false);
  const empresaId = EMPRESAID;  
  const [os, setOs] = useState([]);
  useEffect(() => {
  if (!empresaId) return;

  async function carregar() {
    const dados = await getOs(empresaId);
    setOs(dados);
  }

  carregar();
}, [empresaId]);

  const pendentes = os.filter(o => o.status === "pendente");
  const finalizadas = os.filter(o => o.status === "finalizada");
  const canceladas = os.filter(o => o.status === "cancelada");

  

  async function salvarOs(event) {
    event.preventDefault();

    const form = new FormData(event.target);

    const novaOS = {
      clienteNome: form.get("clienteNome"),
      endereco: form.get("endereco"),
      servico: form.get("servico"),
      inicio: new Date(form.get("inicio")),
      fim: new Date(form.get("fim")),
      tecnicos: [form.get("tecnico")],
      status: "pendente",
      observacoes: form.get("observacoes"),
    };

    try{
      await criarOs(empresaId, novaOS);
      alert("OS criada com sucesso ! ")
      const dados = await getOs(empresaId);
      setOs(dados);
      event.target.reset();
      setAbrirForm(false);
    }catch (erro){
      console.error(erro);
      alert("Erro ao salvar OS ! ")
    }
  }
  return(
    <div>
      <button onClick={() => setAbrirForm(true)}>
        Nova O.S
      </button>

      {abrirForm && (
        <form onSubmit={salvarOs}>
          <h2>Nova O.S</h2>

          <input name="clienteNome" placeholder="Nome do cliente"/>
          <input name="endereco" placeholder="Endereço" />
          <input name="servico" placeholder="Serviço" />

          <input name="inicio" type="datetime-local" />
          <input name="fim" type="datetime-local" />

          <input name="tecnico" placeholder="ID do técnico" type="text"/>

          <textarea name="observacoes" placeholder="Observações" />

          <button type="submit">Salvar</button><br />
          <button type="button" onClick={() => setAbrirForm(false)}>
            Cancelar
          </button>
        </form>
        
        
      )}
      <h2>Pendentes</h2>
  {pendentes.map(o => (
  <div key={o.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
    <h3>{o.clienteNome}</h3>
    <p>{o.servico}</p>
  </div>
))}
    </div>
  )
}