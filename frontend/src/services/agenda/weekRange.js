// Aceita um parâmetro opcional `data` para calcular a semana de qualquer data,
// não apenas a semana atual. Isso permite navegar entre semanas no calendário.
export function getStartOfWeek(data = new Date()) {
    const segunda = new Date(data); // cópia para não mutar o objeto original
    const dia = segunda.getDay();
    const offset = dia === 0 ? 6 : dia - 1;
    segunda.setDate(segunda.getDate() - offset);
    segunda.setHours(0, 0, 0, 0);
    return segunda;
}

export function getEndOfWeek(data = new Date()) {
    const segunda = getStartOfWeek(data);
    const domingo = new Date(segunda);
    domingo.setDate(domingo.getDate() + 6);
    domingo.setHours(23, 59, 59, 999);
    return domingo;
}
