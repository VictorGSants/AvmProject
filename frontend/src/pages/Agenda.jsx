import { useEffect, useState } from "react";
import { getStartOfWeek, getEndOfWeek } from "../services/agenda/weekRange";
import { useParams } from "react-router-dom";
import { getWeekAppointments } from "../services/agenda/getWeekAppointments";
import { getTecnicos } from "../services/tecService";
import { temConflito } from "../services/agenda/checkConflict";
export default function Agenda() {

  const [agendamentos, setAgendamentos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const { empresaId } = useParams();

 useEffect(() => {
  async function carregar() {
    const [agendamentosData, tecnicosData] = await Promise.all([
      getWeekAppointments(empresaId),
      getTecnicos(empresaId)
    ]);

    setAgendamentos(agendamentosData);
    setTecnicos(tecnicosData);
  }

  carregar();
}, [empresaId]);


  tecnicos.map(tec => {
    const eventos = agendamentos.filter(a => 
      a.tecnicos?.includes(tec.id)
    );
  })

  const diasSemana= [
    "Seg",
    "Ter",
    "Qua",
    "Qui",
    "Sex",
    "Sab",
    "Dom"
  ]

  function getDiaSemana(data) {
  const dia = data.toDate().getDay();
  return dia === 0 ? 6 : dia - 1; // segunda = 0
}

async function criarAgendamentoTeste() {
  const novoEvento = {
    inicio: new Date("2026-03-25T10:00"),
    fim: new Date("2026-03-25T12:00"),
    tecnicos: [tecnicos[0]?.id] // pega o primeiro técnico
  };

  const eventosDoTecnico = agendamentos.filter(a =>
    a.tecnicos?.includes(novoEvento.tecnicos[0])
  );

  const conflito = temConflito(novoEvento, eventosDoTecnico);

  if (conflito) {
    alert("Já existe serviço nesse horário");
    return;
  }

  console.log("SALVAR NO FIREBASE AQUI");
}
  
  

  return (
  <div>
    <h1>Agenda</h1>

    {tecnicos.map((tec) => {
      const eventosDoTecnico = agendamentos.filter(a =>
        a.tecnicos?.includes(tec.id)
      );

      return (
        <div key={tec.id} style={{ marginBottom: "20px" }}>
          <h2>{tec.nome}</h2>

          {eventosDoTecnico.length === 0 ? (
            <p>Sem agendamentos</p>
          ) : (
            eventosDoTecnico.map((e) => (
              <div key={e.id}>
                <p>
                  {e.inicio.toDate().toLocaleString()} -{" "}
                  {e.fim.toDate().toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      );
    })}
    <button onClick={criarAgendamentoTeste}>
  Criar teste
  </button>
  </div>
);
}