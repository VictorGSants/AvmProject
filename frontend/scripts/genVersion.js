// Gera public/version.json com um id único a cada build. O app faz polling
// nesse arquivo (bypassando cache) pra detectar deploy novo e recarregar
// sozinho — mais confiável do que depender só da checagem de update do
// Service Worker, que em celular de técnico (sinal fraco, app fica horas
// aberto em segundo plano) demora demais ou não roda.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const destino = resolve(__dirname, "../public/version.json");

writeFileSync(destino, JSON.stringify({ buildId: Date.now().toString() }));
console.log(`version.json gerado: ${destino}`);
