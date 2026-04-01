export function temConflito(novoEvento, eventos) {
  for (let e of eventos) {
    const inicioExistente = e.inicio.toDate();
    const fimExistente = e.fim.toDate();

    if (
      novoEvento.inicio < fimExistente &&
      novoEvento.fim > inicioExistente
    ) {
      return true;
    }
  }

  return false;
}