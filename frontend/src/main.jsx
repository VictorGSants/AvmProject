import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // Importante!
import RouterApp from "./routes/routes.jsx";
import ContratoProvider from "./context/ContratoContext.jsx";
import { registerSW } from "virtual:pwa-register";

// O app fica instalado e aberto por horas nos celulares dos técnicos, então o
// navegador não checa sozinho se saiu uma versão nova. Aqui forçamos a checagem
// periodicamente e sempre que o app volta a ficar em primeiro plano — ao achar
// uma versão nova, o service worker (registerType: autoUpdate) já recarrega a
// página sozinho.
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;
    setInterval(() => registration.update(), 15 * 60 * 1000);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") registration.update();
    });
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ContratoProvider>
      <RouterApp />
    </ContratoProvider>
  </React.StrictMode>
);
