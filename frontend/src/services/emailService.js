import emailjs from "@emailjs/browser";
import {
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
  GESTOR_EMAIL,
} from "../config/emailjsConfig";

export async function notificarNovoChamado({ urgencia, tipo, contratoId, equipamentoNome, descricao }) {
  const params = {
    to_email:    GESTOR_EMAIL,
    urgencia:    urgencia ? urgencia.charAt(0).toUpperCase() + urgencia.slice(1) : "—",
    tipo:        tipo || "—",
    contrato:    contratoId || "—",
    equipamento: equipamentoNome || "Não informado",
    descricao,
    data:        new Date().toLocaleString("pt-BR"),
  };

  await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params, EMAILJS_PUBLIC_KEY);
}
