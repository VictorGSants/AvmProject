// ──────────────────────────────────────────────────────────────────
// Configuração do EmailJS — preencha com seus dados do emailjs.com
// ──────────────────────────────────────────────────────────────────
// 1. Crie conta em https://www.emailjs.com (plano gratuito: 200 e-mails/mês)
// 2. Em "Email Services" → conecte seu Gmail/Outlook → copie o Service ID
// 3. Em "Email Templates" → crie o template (veja variáveis abaixo) → copie o Template ID
// 4. Em "Account" → copie a Public Key
// 5. Em GESTOR_EMAIL coloque o e-mail que vai RECEBER os chamados
// ──────────────────────────────────────────────────────────────────

export const EMAILJS_SERVICE_ID  = "SEU_SERVICE_ID";   // ex: "service_abc123"
export const EMAILJS_TEMPLATE_ID = "SEU_TEMPLATE_ID";  // ex: "template_xyz789"
export const EMAILJS_PUBLIC_KEY  = "SUA_PUBLIC_KEY";   // ex: "aBcDeFgHiJkLmNoPqR"

export const GESTOR_EMAIL = "seu_email@gmail.com";      // e-mail do gestor/patrão

// ──────────────────────────────────────────────────────────────────
// Variáveis disponíveis no template EmailJS:
//   {{to_email}}    — e-mail do gestor (GESTOR_EMAIL acima)
//   {{urgencia}}    — Baixa | Média | Alta
//   {{tipo}}        — Corretiva | Preventiva | Emergência
//   {{contrato}}    — ID do contrato (ex: policlinica)
//   {{equipamento}} — Nome do equipamento selecionado (ou "Não informado")
//   {{descricao}}   — Descrição do problema enviada pelo cliente
//   {{data}}        — Data e hora do chamado
//
// Sugestão de Subject no template:
//   [{{urgencia}} urgência] Novo chamado - {{tipo}} - {{contrato}}
// ──────────────────────────────────────────────────────────────────
