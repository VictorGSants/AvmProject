import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BRAND = [123, 140, 212]; // #7b8cd4

export function gerarPdfPMOC({ nomeContrato, nomeEmpresa, equipamentos, dataManutencao }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const dataFormatada = dataManutencao.toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const mesAno = dataManutencao.toLocaleDateString("pt-BR", {
    month: "long", year: "numeric",
  }).toUpperCase();

  // ── Header band ──────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, 210, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("PLANO DE MANUTENÇÃO, OPERAÇÃO E CONTROLE — PMOC", 105, 10, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Portaria 3.523/MS · ABNT NBR 16401", 105, 17, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text((nomeEmpresa || "AVM AR-CONDICIONADO").toUpperCase(), 105, 26, { align: "center" });

  // ── Info block ────────────────────────────────────────────────────────────
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);

  const infoY = 42;
  doc.setFont("helvetica", "bold");
  doc.text("Contrato:", 14, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(nomeContrato || "—", 40, infoY);

  doc.setFont("helvetica", "bold");
  doc.text("Período:", 14, infoY + 7);
  doc.setFont("helvetica", "normal");
  doc.text(mesAno, 40, infoY + 7);

  doc.setFont("helvetica", "bold");
  doc.text("Data da manutenção:", 14, infoY + 14);
  doc.setFont("helvetica", "normal");
  doc.text(dataFormatada, 60, infoY + 14);

  doc.setFont("helvetica", "bold");
  doc.text("Total de equipamentos:", 14, infoY + 21);
  doc.setFont("helvetica", "normal");
  doc.text(String(equipamentos.length), 65, infoY + 21);

  // divider
  doc.setDrawColor(200);
  doc.line(14, infoY + 27, 196, infoY + 27);

  // ── Equipment tables by bloco ─────────────────────────────────────────────
  const blocos = {};
  equipamentos.forEach(eq => {
    const bloco = eq.bloco || "SEM BLOCO";
    if (!blocos[bloco]) blocos[bloco] = [];
    blocos[bloco].push(eq);
  });

  let cursorY = infoY + 33;

  for (const [bloco, eqs] of Object.entries(blocos).sort()) {
    // bloco label
    doc.setFillColor(240, 242, 255);
    doc.roundedRect(14, cursorY - 4, 182, 9, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND);
    doc.text(`BLOCO ${bloco} — ${eqs.length} equipamento(s)`, 17, cursorY + 1);

    autoTable(doc, {
      startY: cursorY + 7,
      margin: { left: 14, right: 14 },
      head: [["Código", "Equipamento", "Local", "Fabricante / Modelo", "Periodicidade", "Data"]],
      body: eqs
        .sort((a, b) => (a.codigo || "").localeCompare(b.codigo || ""))
        .map(eq => [
          eq.codigo || "—",
          eq.nome || "—",
          eq.local || "—",
          `${eq.fabricante || "—"} / ${eq.modelo || "—"}`,
          (eq.periodicidade || "mensal").charAt(0).toUpperCase() + (eq.periodicidade || "mensal").slice(1),
          dataFormatada,
        ]),
      styles: { fontSize: 7, cellPadding: 2.2, textColor: [40, 40, 40] },
      headStyles: { fillColor: BRAND, textColor: 255, fontStyle: "bold", fontSize: 7.5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 42 },
        2: { cellWidth: 34 },
        3: { cellWidth: 42 },
        4: { cellWidth: 22 },
        5: { cellWidth: 24 },
      },
    });

    cursorY = doc.lastAutoTable.finalY + 12;

    if (cursorY > 255) {
      doc.addPage();
      cursorY = 20;
    }
  }

  // ── Signature area ────────────────────────────────────────────────────────
  if (cursorY > 245) {
    doc.addPage();
    cursorY = 30;
  }

  cursorY += 8;
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  doc.line(14, cursorY + 14, 88, cursorY + 14);
  doc.line(122, cursorY + 14, 196, cursorY + 14);

  doc.text("Responsável Técnico / CREA", 51, cursorY + 19, { align: "center" });
  doc.text("Responsável pelo Estabelecimento", 159, cursorY + 19, { align: "center" });

  // ── Page footer ───────────────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160);
    doc.text(
      `Página ${i} de ${totalPages}  ·  Gerado em ${new Date().toLocaleDateString("pt-BR")} pelo AVM Sistema`,
      105, 293, { align: "center" }
    );
  }

  const nomeArquivo = `PMOC_${(nomeContrato || "contrato").replace(/\s+/g, "_")}_${mesAno.replace(/\s+/g, "_")}.pdf`;
  doc.save(nomeArquivo);
}
