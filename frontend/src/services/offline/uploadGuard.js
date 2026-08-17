// Contador de fotos em captura/envio "em voo". Existe pra impedir que o
// reload automático de versão nova (service worker ou versionCheck) derrube
// uma foto bem no momento em que o técnico volta da câmera nativa do
// celular — esse retorno também dispara "visibilitychange", que é o mesmo
// gatilho usado pra checar/aplicar atualização.
let contagem = 0;

export function iniciarUploadEmAndamento() {
  contagem += 1;
}

export function finalizarUploadEmAndamento() {
  contagem = Math.max(0, contagem - 1);
}

export function haUploadEmAndamento() {
  return contagem > 0;
}

// Roda `callback` assim que não houver upload em andamento — na hora, se já
// estiver livre, ou em polling curto até liberar. Usado para adiar (nunca
// cancelar) uma atualização pendente sem perder foto em captura.
export function aoFicarLivre(callback) {
  if (!haUploadEmAndamento()) {
    callback();
    return;
  }
  const intervalo = setInterval(() => {
    if (!haUploadEmAndamento()) {
      clearInterval(intervalo);
      callback();
    }
  }, 2000);
}
