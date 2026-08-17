import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // Importante!
import RouterApp from "./routes/routes.jsx";
import ContratoProvider from "./context/ContratoContext.jsx";
import { registerSW } from "virtual:pwa-register";
import { iniciarVerificacaoDeVersao } from "./services/versionCheck";
import { aoFicarLivre } from "./services/offline/uploadGuard";

// O app fica instalado e aberto por horas nos celulares dos técnicos, então o
// navegador não checa sozinho se saiu uma versão nova. Aqui forçamos a checagem
// periodicamente e sempre que o app volta a ficar em primeiro plano. Ao achar
// uma versão nova o reload só acontece via aoFicarLivre — nunca no meio de uma
// foto sendo capturada/enviada (é comum o "voltar a ficar em primeiro plano"
// coincidir exatamente com o retorno da câmera nativa do celular).
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    aoFicarLivre(() => updateSW(true));
  },
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;
    setInterval(() => registration.update(), 15 * 60 * 1000);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") registration.update();
    });
  },
});

// Camada extra, independente do Service Worker: em sinal fraco a checagem de
// update do SW pode nunca completar. Isso aqui busca um arquivo estático
// pequeno direto da rede (sem cache) e recarrega sozinho ao detectar deploy
// novo — é o que garante o "atualiza sozinho" mesmo quando o SW falha.
iniciarVerificacaoDeVersao();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ContratoProvider>
      <RouterApp />
    </ContratoProvider>
  </React.StrictMode>
);
