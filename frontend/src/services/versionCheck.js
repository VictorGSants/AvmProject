// Detecta deploy novo checando public/version.json diretamente pela rede
// (bypassando cache do navegador e do Service Worker) e recarrega a página.
// Existe porque depender só da checagem de update do próprio Service Worker
// se mostrou pouco confiável em celular de técnico: sinal fraco, app fica
// horas aberto/em segundo plano, e o SW pode levar muito tempo pra notar
// que existe uma versão nova.

import { toast } from "sonner";
import { aoFicarLivre } from "./offline/uploadGuard";

const INTERVALO_MS = 5 * 60 * 1000;

async function buscarBuildId() {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const dados = await res.json();
    return dados.buildId || null;
  } catch {
    return null;
  }
}

export function iniciarVerificacaoDeVersao() {
  let buildIdConhecido = null;
  let avisoMostrado = false;
  buscarBuildId().then(id => { buildIdConhecido = id; });

  async function checar({ forcarRecarregar }) {
    const atual = await buscarBuildId();
    if (!atual || !buildIdConhecido || atual === buildIdConhecido) return;

    if (forcarRecarregar) {
      // Nunca no meio de uma foto sendo capturada/enviada — só reloada
      // assim que o uploadGuard liberar (na hora, se já estiver livre).
      aoFicarLivre(() => window.location.reload());
      return;
    }
    // Atualização detectada com o app em uso — não recarrega à força pra
    // não derrubar um formulário em preenchimento; avisa e deixa o próprio
    // usuário decidir, ou recarrega sozinho na próxima vez que abrir o app.
    if (!avisoMostrado) {
      avisoMostrado = true;
      toast.info("Nova versão disponível.", {
        duration: Infinity,
        action: { label: "Atualizar agora", onClick: () => window.location.reload() },
      });
    }
  }

  // Ao reabrir o app (o cenário do problema relatado: app ficou em segundo
  // plano com versão antiga) recarrega direto — mas esse mesmo instante
  // também é quando o técnico volta da câmera nativa com uma foto na mão,
  // por isso o reload passa pelo uploadGuard (aoFicarLivre) em vez de
  // acontecer sempre na hora.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checar({ forcarRecarregar: true });
  });
  window.addEventListener("online", () => checar({ forcarRecarregar: true }));
  setInterval(() => checar({ forcarRecarregar: false }), INTERVALO_MS);
}
