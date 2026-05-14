import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Cor principal AVM (igual ao pmocPdf.js)
const BRAND   = [26, 94, 168];   // #1a5ea8
const GREEN   = [26, 122, 58];   // #1a7a3a
const LIGHT   = [244, 247, 251]; // fundo linhas alternadas
const MID     = [85, 85, 85];
const DARK    = [26, 26, 26];

function fmt(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);
}

function drawPageFooter(doc) {
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 289, 196, 289);
    doc.text(
      "AVM AR Campinas · contato@avmarcampinas.com.br · (19) 4141-7244",
      105, 293, { align: "center" }
    );
    doc.text(`Pág. ${i} de ${total}`, 196, 293, { align: "right" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Função principal
// ─────────────────────────────────────────────────────────────────────────────
// orcamento = {
//   numero, criadoEm, processo,
//   clienteNome, clienteCnpj, clienteEndereco,
//   servicoNome, descricaoObjeto,
//   itensEquipamentos: [{ desc, qtd, vlUnit }],
//   itensInstalacao:   [{ desc, qtd, vlUnit }],
//   calculo: { totalEquipamentos, totalInstalacao, totalGeral },
//   garantia, pagamento, validade, prazoExecucao,
//   observacoes,
//   exibirDadosFornecedor: bool,
//   fornecedorNome, fornecedorCnpj, fornecedorBanco,
// }
export function gerarPdfOrcamento(orcamento) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const {
    numero      = "---",
    processo    = "",
    clienteNome = "---",
    clienteCnpj = "",
    servicoNome = "",
    descricaoObjeto = "",
    itensEquipamentos = [],
    itensInstalacao   = [],
    calculo = {},
    garantia         = "12 meses peças / 36 meses compressor",
    pagamento        = "15 DDL",
    validade         = "30 dias",
    prazoExecucao    = "30 dias",
    observacoes      = "",
    exibirDadosFornecedor = false,
    fornecedor       = null,
  } = orcamento;

  const fornecedorNome  = fornecedor?.nome  || "";
  const fornecedorCnpj  = fornecedor?.cnpj  || "";
  const fornecedorBanco = fornecedor?.banco  || "";

  const dataEmissao = orcamento.criadoEm
    ? new Date(orcamento.criadoEm.seconds * 1000).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  // ── Cabeçalho ─────────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, 210, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("AVM AR CAMPINAS", 14, 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("AR CONDICIONADO E ELÉTRICA", 14, 16);
  doc.text(
    "André Gonçalves Santos · CNPJ 29.969.275/0001-10 · CFT 313.142.228-99",
    14, 21
  );
  doc.text("Rua Uruguai, 38 – NV Europa – Campinas/SP  ·  (19) 4141-7244", 14, 26);

  // Número da proposta (canto direito)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("PROPOSTA", 196, 10, { align: "right" });
  doc.setFontSize(18);
  doc.text(numero, 196, 19, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(dataEmissao, 196, 26, { align: "right" });

  // ── Faixa de informações (autoTable garante quebra automática de texto) ────
  autoTable(doc, {
    startY: 32,
    margin: { left: 14, right: 14 },
    head: [["PROCESSO", "ATENDIDO", "CNPJ CONTRATANTE", "GARANTIA"]],
    body: [[processo || "—", clienteNome, clienteCnpj || "—", garantia]],
    headStyles: {
      fillColor: [232, 240, 248], textColor: BRAND,
      fontStyle: "bold", fontSize: 7,
      cellPadding: { top: 3, right: 3, bottom: 1, left: 3 },
      lineWidth: 0,
    },
    bodyStyles: {
      fillColor: [232, 240, 248], textColor: DARK,
      fontStyle: "bold", fontSize: 8.5,
      cellPadding: { top: 1, right: 3, bottom: 4, left: 3 },
      lineWidth: 0,
    },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 52 },
      2: { cellWidth: 52, fontStyle: "normal", textColor: MID, fontSize: 7.5 },
      3: { cellWidth: "auto", fontStyle: "normal", textColor: MID, fontSize: 7.5 },
    },
    tableLineWidth: 0,
  });

  // ── Objeto da Proposta ─────────────────────────────────────────────────────
  let curY = doc.lastAutoTable.finalY + 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND);
  doc.text("OBJETO DA PROPOSTA", 14, curY);
  curY += 5;

  doc.setDrawColor(...BRAND);
  doc.setLineWidth(0.4);
  doc.line(14, curY, 196, curY);
  curY += 4;

  if (descricaoObjeto) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MID);
    const linhas = doc.splitTextToSize(descricaoObjeto, 182);
    doc.text(linhas, 14, curY);
    curY += linhas.length * 4.5 + 4;
  }

  // ── Tabela Equipamentos ────────────────────────────────────────────────────
  if (itensEquipamentos.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND);
    doc.text("EQUIPAMENTOS – FORNECIMENTO", 14, curY);
    curY += 2;

    autoTable(doc, {
      startY: curY,
      margin: { left: 14, right: 14 },
      head: [["#", "DESCRIÇÃO", "QTD.", "VL. UNIT.", "SUBTOTAL"]],
      body: [
        ...itensEquipamentos.map((item, i) => [
          String(i + 1),
          item.descricao || item.desc || "—",
          String(item.qtd ?? 1),
          fmt(item.vlUnit),
          fmt((item.vlUnit ?? 0) * (item.qtd ?? 1)),
        ]),
        ["", "Subtotal equipamentos", "", "",
         fmt(calculo.totalEquipamentos ?? 0)],
      ],
      styles: { fontSize: 7.5, cellPadding: 2.5, textColor: DARK },
      headStyles: { fillColor: BRAND, textColor: 255, fontStyle: "bold", fontSize: 8 },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 14, halign: "right" },
        3: { cellWidth: 26, halign: "right" },
        4: { cellWidth: 28, halign: "right" },
      },
      didParseCell(data) {
        // Linha de subtotal: fundo azul claro + bold
        const isLast = data.row.index === itensEquipamentos.length;
        if (isLast) {
          data.cell.styles.fillColor = [232, 240, 248];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    curY = doc.lastAutoTable.finalY + 6;
  }

  // ── Tabela Instalação ──────────────────────────────────────────────────────
  if (itensInstalacao.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND);
    doc.text("INSTALAÇÃO / SERVIÇO", 14, curY);
    curY += 2;

    autoTable(doc, {
      startY: curY,
      margin: { left: 14, right: 14 },
      head: [["#", "DESCRIÇÃO", "QTD.", "VL. UNIT.", "SUBTOTAL"]],
      body: [
        ...itensInstalacao.map((item, i) => [
          String(i + 1),
          item.descricao || item.desc || "—",
          String(item.qtd ?? 1),
          fmt(item.vlUnit),
          fmt((item.vlUnit ?? 0) * (item.qtd ?? 1)),
        ]),
        ["", "Subtotal mão de obra", "", "",
         fmt(calculo.totalInstalacao ?? 0)],
      ],
      styles: { fontSize: 7.5, cellPadding: 2.5, textColor: DARK },
      headStyles: { fillColor: BRAND, textColor: 255, fontStyle: "bold", fontSize: 8 },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 14, halign: "right" },
        3: { cellWidth: 26, halign: "right" },
        4: { cellWidth: 28, halign: "right" },
      },
      didParseCell(data) {
        const isLast = data.row.index === itensInstalacao.length;
        if (isLast) {
          data.cell.styles.fillColor = [232, 240, 248];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    curY = doc.lastAutoTable.finalY + 6;
  }

  // ── Resumo de Valores ──────────────────────────────────────────────────────
  if (curY > 215) { doc.addPage(); curY = 20; }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND);
  doc.text("RESUMO DE VALORES", 14, curY);
  curY += 2;
  doc.setDrawColor(...BRAND);
  doc.setLineWidth(0.4);
  doc.line(14, curY, 196, curY);
  curY += 5;

  // Linhas de subtotal
  const resumoLinhas = [];
  if (calculo.totalEquipamentos > 0)
    resumoLinhas.push(["Subtotal equipamentos", calculo.totalEquipamentos]);
  if (calculo.totalInstalacao > 0)
    resumoLinhas.push(["Subtotal instalação / mão de obra", calculo.totalInstalacao]);

  for (const [label, valor] of resumoLinhas) {
    doc.setFillColor(248, 250, 252);
    doc.rect(14, curY - 1, 182, 9, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MID);
    doc.text(label, 18, curY + 5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(fmt(valor), 194, curY + 5, { align: "right" });
    curY += 11;
  }

  // Banda verde TOTAL GERAL
  curY += 2;
  doc.setFillColor(...GREEN);
  doc.rect(14, curY, 182, 15, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL GERAL", 19, curY + 10);
  doc.setFontSize(14);
  doc.text(fmt(calculo.totalGeral ?? 0), 193, curY + 10.5, { align: "right" });
  curY += 25;

  // ── Página 2 — Condições ───────────────────────────────────────────────────
  doc.addPage();
  curY = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND);
  doc.text("CONDIÇÕES DO SERVIÇO", 14, curY);
  curY += 2;
  doc.setDrawColor(...BRAND);
  doc.setLineWidth(0.4);
  doc.line(14, curY, 196, curY);
  curY += 6;

  const condicoes = [
    ["Equipamento",
     "Novo, sem uso, com Certificado INMETRO, Selo Procel A e Manual Técnico. Caixa íntegra no transporte. Substituição em até 15 dias se recusado pelo Fiscal."],
    ["Instalação",
     "Realizada conforme manual do fabricante e normas ABNT/NRs, com visita técnica prévia e APR/PT quando aplicável. Equipe uniformizada, com crachá DSTr/Unicamp."],
    ["Inclusos",
     "Suporte metálico novo, tubulação de cobre nova e isolada, cabo PB/PP, dreno em PVC, bomba de condensado, canaletas/eletrocalhas, andaimes, sinalização e descarte de resíduos."],
    ["Garantia",
     `${garantia}, contados da data de recebimento. Atendimento em garantia em até 10 dias corridos.`],
    ["Prazo",
     `Até ${prazoExecucao} corridos após emissão da AF ou assinatura do contrato.`],
    ["Responsabilidade",
     "A CONTRATADA responde por danos causados por seus colaboradores, com direito a contraditório e ampla defesa."],
  ];

  if (observacoes) {
    condicoes.push(["Observações", observacoes]);
  }

  autoTable(doc, {
    startY: curY,
    margin: { left: 14, right: 14 },
    body: condicoes,
    styles: { fontSize: 8, cellPadding: 4, textColor: MID, lineColor: [210, 210, 210], lineWidth: 0.2 },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: "bold", textColor: BRAND },
      1: { cellWidth: "auto" },
    },
    alternateRowStyles: { fillColor: LIGHT },
  });

  curY = doc.lastAutoTable.finalY + 10;

  // ── Condições Comerciais ───────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND);
  doc.text("CONDIÇÕES COMERCIAIS", 14, curY);
  curY += 4;

  doc.setFillColor(232, 240, 248);
  doc.rect(14, curY, 182, 16, "F");

  const colW = 60;
  [
    ["PAGAMENTO", pagamento],
    ["VALIDADE", validade],
    ["PRAZO DE EXECUÇÃO", prazoExecucao],
  ].forEach(([label, value], i) => {
    const x = 14 + i * colW + 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND);
    doc.text(label, x, curY + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...DARK);
    doc.text(value, x, curY + 13);
  });

  curY += 26;

  // ── Dados Bancários ────────────────────────────────────────────────────────
  if (curY > 240) { doc.addPage(); curY = 20; }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND);
  doc.text("DADOS BANCÁRIOS – CONTRATADA", 14, curY);
  curY += 2;
  doc.setDrawColor(...BRAND);
  doc.line(14, curY, 196, curY);
  curY += 6;

  if (exibirDadosFornecedor && fornecedorNome) {
    autoTable(doc, {
      startY: curY,
      margin: { left: 14, right: 14 },
      body: [
        ["AVM AR Campinas – André Gonçalves Santos",
         `Fornecedor Parceiro – ${fornecedorNome}`],
        ["Banco do Brasil · Ag. 4038-X · CC 25851-2",
         fornecedorNome],
        ["Favorecido: André Gonçalves Santos",
         fornecedorCnpj ? `CNPJ ${fornecedorCnpj}` : "—"],
        ["CNPJ 29.969.275/0001-10",
         fornecedorBanco || "—"],
      ],
      styles: { fontSize: 8, cellPadding: 3.5, textColor: MID, fillColor: LIGHT },
      columnStyles: {
        0: { cellWidth: "auto", fontStyle: "normal" },
        1: { cellWidth: "auto" },
      },
      didParseCell(data) {
        if (data.row.index === 0) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = DARK;
        }
      },
    });
  } else {
    autoTable(doc, {
      startY: curY,
      margin: { left: 14, right: 14 },
      body: [
        ["AVM AR Campinas – André Gonçalves Santos"],
        ["Banco do Brasil · Ag. 4038-X · CC 25851-2"],
        ["Favorecido: André Gonçalves Santos"],
        ["CNPJ 29.969.275/0001-10"],
      ],
      styles: { fontSize: 8, cellPadding: 3.5, textColor: MID, fillColor: LIGHT },
      columnStyles: { 0: { cellWidth: "auto" } },
      didParseCell(data) {
        if (data.row.index === 0) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = DARK;
        }
      },
    });
  }

  curY = doc.lastAutoTable.finalY + 16;

  // ── Assinaturas ────────────────────────────────────────────────────────────
  if (curY > 250) { doc.addPage(); curY = 20; }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND);
  doc.text("ASSINATURAS", 14, curY);
  curY += 2;
  doc.setDrawColor(...BRAND);
  doc.line(14, curY, 196, curY);
  curY += 22;

  const sigW = 54;
  const sigPositions = [14, 14 + sigW + 14, 14 + (sigW + 14) * 2];
  const sigLabels = [
    ["Contratante", clienteNome],
    ["Contratada", "AVM AR Campinas"],
    ["Responsável Técnico", "André Gonçalves Santos"],
  ];

  sigPositions.forEach((x, i) => {
    doc.setDrawColor(...MID);
    doc.setLineWidth(0.4);
    doc.line(x, curY, x + sigW, curY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.text(sigLabels[i][1], x + sigW / 2, curY + 5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MID);
    doc.text(sigLabels[i][0], x + sigW / 2, curY + 10, { align: "center" });
  });

  curY += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MID);
  doc.text("Campinas, _____ de __________________ de 2026.", 105, curY, { align: "center" });

  // ── Rodapé em todas as páginas ─────────────────────────────────────────────
  drawPageFooter(doc);

  // ── Salvar ─────────────────────────────────────────────────────────────────
  const nomeArquivo = `Proposta_AVM_${numero}_${(clienteNome || "cliente").replace(/\s+/g, "_")}.pdf`;
  doc.save(nomeArquivo);
}