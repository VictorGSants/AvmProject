import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoUrl from "../images/Icon.png";

const NAVY   = [20, 33, 61];     // cabeçalho e faixas de seção
const ORANGE = [217, 119, 6];    // número da seção, destaques, total geral
const LIGHT  = [244, 247, 251];
const MID    = [85, 85, 85];
const DARK   = [26, 26, 26];

function fmt(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawPageFooter(doc, numero) {
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 289, 196, 289);
    doc.text(
      "AVM AR Campinas · contato@avmarcampinas.com.br · (19) 4141-7244",
      14, 293
    );
    doc.text(`Orçamento ${numero} · Pág. ${i} de ${total}`, 196, 293, { align: "right" });
  }
}

// Desenha a faixa navy numerada de uma seção e retorna o Y seguinte.
function secaoHeader(doc, numero, titulo, y) {
  doc.setFillColor(...NAVY);
  doc.rect(14, y, 182, 7, "F");
  doc.setFillColor(...ORANGE);
  doc.rect(14, y, 7, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(String(numero), 17.5, y + 4.8, { align: "center" });
  doc.setFontSize(8.5);
  doc.text(titulo, 24, y + 4.8);
  return y + 7 + 4;
}

// Garante espaço mínimo antes de iniciar uma nova seção, quebrando página se necessário.
function garantirEspaco(doc, curY, minimo = 30) {
  if (curY > 297 - minimo) {
    doc.addPage();
    return 20;
  }
  return curY;
}

// ─────────────────────────────────────────────────────────────────────────────
// Função principal (assíncrona para carregar a logo)
// ─────────────────────────────────────────────────────────────────────────────
export async function gerarPdfOrcamento(orcamento) {
  let logoImg = null;
  try { logoImg = await loadImage(logoUrl); } catch { /* segue sem logo */ }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const {
    numero      = "---",
    processo    = "",
    clienteNome = "---",
    clienteCnpj = "",
    clienteCpf  = "",
    clienteEmail    = "",
    clienteEndereco = "",
    clienteTelefone = "",
    servicoNome = "",
    descricaoObjeto = "",
    equipamentoTexto = "",
    equipamentoItens = [],
    itensEquipamentos = [],
    itensInstalacao   = [],
    opcaoEquipamentoSelecionada = null,
    equipApenasRef    = false,
    calculo = {},
    garantia         = "12 meses peças / 36 meses compressor",
    pagamento        = "15 DDL",
    validade         = "30 dias",
    prazoExecucao    = "30 dias",
    observacoes      = "",
    exibirDadosFornecedor = false,
    fornecedor       = null,
    exibirDadosBancarios = true,
    servicoCategoria = "",
    direcionadoA     = "",
    aoCuidadoDe      = "",
    responsavel      = "",
    condicoesServico = null,
  } = orcamento;

  const fornecedorNome  = fornecedor?.nome  || "";
  const fornecedorCnpj  = fornecedor?.cnpj  || "";
  const fornecedorBanco = fornecedor?.banco  || "";

  const dataEmissaoTs = orcamento.dataEmissao || orcamento.criadoEm;
  const dataEmissao = dataEmissaoTs
    ? new Date(dataEmissaoTs.seconds * 1000).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  let secNum = 1;

  // ── Cabeçalho ─────────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 32, "F");

  if (logoImg) {
    doc.addImage(logoImg, "PNG", 14, 8, 14, 14);
  }
  const txtX = logoImg ? 31 : 14;

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("AVM AR CAMPINAS", txtX, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("AR CONDICIONADO E ELÉTRICA", txtX, 18);
  doc.setFontSize(6.5);
  doc.text(
    "André Gonçalves Santos · CNPJ 29.969.275/0001-10 · CFT 313.142.228-99",
    txtX, 22.5
  );
  doc.text("Rua Uruguai, 38 – NV Europa – Campinas/SP  ·  (19) 4141-7244 · (19) 99280-7850", txtX, 27);

  doc.setTextColor(...ORANGE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("ORÇAMENTO", 196, 13, { align: "right" });
  doc.setFontSize(18);
  doc.text(numero, 196, 21, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(220, 225, 235);
  doc.text(dataEmissao, 196, 27, { align: "right" });

  let curY = 38;

  // ── Aos cuidados de ─────────────────────────────────────────────────────────
  const linhaCuidado = [direcionadoA, aoCuidadoDe].filter(Boolean).join(" / ");
  if (linhaCuidado) {
    doc.setFillColor(...LIGHT);
    doc.rect(14, curY, 182, 8, "F");
    doc.setFillColor(...ORANGE);
    doc.rect(14, curY, 1.2, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...NAVY);
    doc.text("AOS CUIDADOS DE:", 18, curY + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    doc.text(linhaCuidado, 52, curY + 5);
    curY += 8 + 6;
  } else {
    curY += 4;
  }

  // ── Seção: Identificação do Cliente ─────────────────────────────────────────
  const clienteDoc = [
    clienteCnpj && `CNPJ ${clienteCnpj}`,
    clienteCpf  && `CPF ${clienteCpf}`,
  ].filter(Boolean).join("  ·  ");

  const contatoLinha = [
    clienteEmail    && `Email: ${clienteEmail}`,
    clienteTelefone && `Tel.: ${clienteTelefone}`,
  ].filter(Boolean).join("   |   ");

  const linhasCliente = [["Cliente / Órgão", clienteNome || "—"]];
  if (clienteDoc)     linhasCliente.push(["CNPJ / CPF", clienteDoc]);
  if (contatoLinha)   linhasCliente.push(["Contato", contatoLinha]);
  linhasCliente.push(["Local de Execução", clienteEndereco || "—"]);
  if (responsavel)    linhasCliente.push(["Responsável pelo setor", responsavel]);
  linhasCliente.push(["Validade do Orçamento", validade ? `${validade}, a partir da data de emissão` : "—"]);
  if (processo)        linhasCliente.push(["Processo", processo]);
  if (servicoNome)      linhasCliente.push(["Serviço", servicoNome]);

  curY = secaoHeader(doc, secNum++, "IDENTIFICAÇÃO DO CLIENTE", curY);
  autoTable(doc, {
    startY: curY,
    margin: { left: 14, right: 14 },
    body: linhasCliente,
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: DARK, lineWidth: 0 },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: "bold", textColor: NAVY },
      1: { cellWidth: "auto" },
    },
    alternateRowStyles: { fillColor: LIGHT },
  });
  curY = doc.lastAutoTable.finalY + 5;

  // ── Seção: Objeto do Orçamento ───────────────────────────────────────────────
  if (descricaoObjeto) {
    curY = garantirEspaco(doc, curY);
    curY = secaoHeader(doc, secNum++, "OBJETO DO ORÇAMENTO", curY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MID);
    const linhas = doc.splitTextToSize(descricaoObjeto, 182);
    doc.text(linhas, 14, curY);
    curY += doc.getTextDimensions(linhas.join("\n")).h + 5;
  }

  // ── Seção: Equipamento / Material (tabela — pode ou não somar no total) ─────
  // equipamentoItens é o formato atual; itensEquipamentos/opcaoEquipamentoSelecionada
  // (orçamentos antigos) e equipamentoTexto (fase intermediária, só texto livre)
  // são convertidos aqui só para exibição.
  let itensEquip = equipamentoItens.length > 0
    ? equipamentoItens
    : [
        ...(itensEquipamentos || []),
        ...(opcaoEquipamentoSelecionada
          ? [{ descricao: opcaoEquipamentoSelecionada.nome, qtd: 1, vlUnit: opcaoEquipamentoSelecionada.valorUnit }]
          : []),
      ];
  if (itensEquip.length === 0 && equipamentoTexto) {
    itensEquip = [{ descricao: equipamentoTexto, qtd: 1, vlUnit: 0 }];
  }

  if (itensEquip.length > 0) {
    curY = garantirEspaco(doc, curY, 40);
    curY = secaoHeader(doc, secNum++, "EQUIPAMENTO / MATERIAL", curY);
    autoTable(doc, {
      startY: curY,
      margin: { left: 14, right: 14 },
      head: [["#", "DESCRIÇÃO", "UNID.", "QTD.", "VLR. UNIT.", "VLR. TOTAL"]],
      body: itensEquip.map((item, i) => [
        String(i + 1),
        item.descricao || item.desc || "—",
        "un.",
        String(item.qtd ?? 1),
        fmt(item.vlUnit),
        equipApenasRef ? "—" : fmt((item.vlUnit ?? 0) * (item.qtd ?? 1)),
      ]),
      styles: { fontSize: 7.5, cellPadding: 2.2, textColor: DARK },
      headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold", fontSize: 8 },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 14, halign: "center" },
        3: { cellWidth: 14, halign: "right" },
        4: { cellWidth: 26, halign: "right" },
        5: { cellWidth: 28, halign: "right" },
      },
    });
    curY = doc.lastAutoTable.finalY + 2;
    if (equipApenasRef) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(...ORANGE);
      doc.text("* Opções apresentadas para escolha do contratante — não somadas ao total geral.", 14, curY + 3);
      curY += 6;
    }
    curY += 5;
  }

  // ── Seção: Relação de Materiais e Serviços ───────────────────────────────────
  const totalGeral = calculo.totalGeral ?? orcamento.precoFinal ?? 0;

  if (itensInstalacao.length > 0) {
    curY = garantirEspaco(doc, curY, 40);
    curY = secaoHeader(doc, secNum++, "RELAÇÃO DE MATERIAIS E SERVIÇOS", curY);
    autoTable(doc, {
      startY: curY,
      margin: { left: 14, right: 14 },
      head: [["#", "DESCRIÇÃO", "UNID.", "QTD.", "VLR. UNIT.", "VLR. TOTAL"]],
      body: itensInstalacao.map((item, i) => [
        String(i + 1),
        item.descricao || item.desc || "—",
        "un.",
        String(item.qtd ?? 1),
        fmt(item.vlUnit),
        fmt((item.vlUnit ?? 0) * (item.qtd ?? 1)),
      ]),
      styles: { fontSize: 7.5, cellPadding: 2.2, textColor: DARK },
      headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold", fontSize: 8 },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 14, halign: "center" },
        3: { cellWidth: 14, halign: "right" },
        4: { cellWidth: 26, halign: "right" },
        5: { cellWidth: 28, halign: "right" },
      },
    });
    curY = doc.lastAutoTable.finalY + 5;
  } else if (itensEquip.length === 0) {
    curY = secaoHeader(doc, secNum++, "VALOR DO ORÇAMENTO", curY);
  }

  curY = garantirEspaco(doc, curY, 20);
  doc.setFillColor(...ORANGE);
  doc.rect(14, curY, 182, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL GERAL DO ORÇAMENTO", 18, curY + 6.5);
  doc.setFontSize(11.5);
  doc.text(fmt(totalGeral), 192, curY + 6.7, { align: "right" });
  curY += 10 + 5;

  // ── Seção: Condições do Serviço ──────────────────────────────────────────────
  const ehFornecimento = servicoCategoria === "fornecimento";
  const ehCorretiva    = !ehFornecimento && (
    servicoCategoria === "corretiva" ||
    /correti/i.test(servicoCategoria || servicoNome)
  );
  const ehManutencao   = !ehFornecimento && !ehCorretiva && (
    servicoCategoria
      ? !["instalacao"].includes(servicoCategoria)
      : /manut|preventi|higien|pmoc/i.test(servicoNome)
  );

  const condicoesInstalacao = [
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
    ["Responsab.",
     "A CONTRATADA responde por danos causados por seus colaboradores, com direito a contraditório e ampla defesa."],
  ];

  const condicoesManutencao = [
    ["Execução",
     "Serviço executado por técnico qualificado, seguindo NBR 16280 e demais normas ABNT/NRs. Uso de EPI completo e equipamentos calibrados. Equipe uniformizada com crachá DSTr/Unicamp."],
    ["Inclusos",
     "Materiais de consumo inclusos: produto de limpeza, filtros, vedantes e materiais de acabamento. Peças de reposição cobradas à parte, mediante aprovação prévia do contratante."],
    ["Garantia",
     `${garantia}, contados da data de execução do serviço. Atendimento em garantia em até 5 dias úteis após abertura de chamado.`],
    ["Prazo",
     `Até ${prazoExecucao} corridos após emissão da AF ou aprovação do orçamento.`],
    ["Responsab.",
     "A CONTRATADA responde por danos causados por seus colaboradores durante a execução, com direito a contraditório e ampla defesa."],
  ];

  const condicoesCorretiva = [
    ["Diagnóstico",
     "Serviço precedido de visita técnica para identificação da falha. O custo da visita de diagnóstico é cobrado independentemente da aprovação do reparo."],
    ["Peças",
     "Peças e componentes de reposição não estão inclusos neste orçamento e serão apresentados para aprovação formal do contratante antes da aquisição e execução."],
    ["Mão de Obra",
     "A mão de obra de diagnóstico e reparo é cobrada mesmo que a intervenção não resulte em solução definitiva, em razão de falha de terceiros, desgaste irrecuperável ou fatores externos ao equipamento."],
    ["Inclusos",
     "Materiais de consumo (fluido refrigerante, vedantes, produtos de limpeza) e ferramental especializado. Deslocamento incluído dentro do município de Campinas/SP."],
    ["Garantia",
     `${garantia}, contados da data de execução do reparo. A garantia não cobre dano elétrico externo, mau uso, queda de tensão ou intervenção de terceiros após o serviço.`],
    ["Prazo",
     `Execução em até ${prazoExecucao} corridos após emissão da AF ou aprovação formal do orçamento.`],
    ["Responsab.",
     "A CONTRATADA responde por danos causados diretamente por seus colaboradores durante a execução, com direito a contraditório e ampla defesa."],
  ];

  const condicoesFornecimento = [
    ["Fornecimento",
     "Equipamentos novos, sem uso, com Certificado INMETRO, Selo Procel A e Manual Técnico. Caixa íntegra no transporte. Substituição em até 15 dias se recusado pelo Fiscal."],
    ["Entrega",
     `Entrega no local indicado pelo contratante em até ${prazoExecucao} corridos após emissão da AF ou assinatura do contrato. Agendamento prévio com o responsável técnico.`],
    ["Nota Fiscal",
     "Emissão de NF-e no ato do faturamento, com discriminação completa dos equipamentos fornecidos."],
    ["Garantia",
     `${garantia}, contados da data de recebimento. Atendimento em garantia em até 10 dias corridos após abertura de chamado.`],
    ["Responsab.",
     "A CONTRATADA responde pela integridade dos equipamentos até a entrega formal no local designado, com direito a contraditório e ampla defesa."],
  ];

  const condicoes = (condicoesServico && condicoesServico.length > 0)
    ? condicoesServico.map(c => [c.titulo, c.texto])
    : (() => {
        const padrao = ehFornecimento
          ? condicoesFornecimento
          : ehCorretiva
            ? condicoesCorretiva
            : ehManutencao
              ? condicoesManutencao
              : condicoesInstalacao;
        if (observacoes) padrao.push(["Observações", observacoes]);
        return padrao;
      })();

  curY = garantirEspaco(doc, curY, 40);
  curY = secaoHeader(doc, secNum++, "CONDIÇÕES DO SERVIÇO", curY);

  autoTable(doc, {
    startY: curY,
    margin: { left: 14, right: 14 },
    body: condicoes,
    styles: {
      fontSize: 8,
      cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
      lineColor: [255, 255, 255],
      lineWidth: 0.5,
      overflow: "linebreak",
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 36 },
      1: { cellWidth: "auto" },
    },
    didParseCell(data) {
      if (data.column.index === 0) {
        data.cell.styles.fillColor = NAVY;
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fontSize  = 8;
        data.cell.styles.halign    = "center";
        data.cell.styles.valign    = "middle";
      } else {
        data.cell.styles.fillColor = data.row.index % 2 === 0 ? [248, 251, 255] : LIGHT;
        data.cell.styles.textColor = DARK;
        data.cell.styles.fontStyle = "normal";
      }
    },
  });
  curY = doc.lastAutoTable.finalY + 5;

  // ── Seção: Condições Comerciais ──────────────────────────────────────────────
  curY = garantirEspaco(doc, curY, 30);
  curY = secaoHeader(doc, secNum++, "CONDIÇÕES COMERCIAIS", curY);

  doc.setFillColor(...LIGHT);
  doc.rect(14, curY, 182, 16, "F");
  const colW = 182 / 3;
  [
    ["PAGAMENTO", pagamento],
    ["PRAZO DE EXECUÇÃO", prazoExecucao],
    ["GARANTIA", garantia],
  ].forEach(([label, value], i) => {
    const x = 14 + i * colW + 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...ORANGE);
    doc.text(label, x, curY + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    const valorLinhas = doc.splitTextToSize(value, colW - 6);
    doc.text(valorLinhas.slice(0, 2), x, curY + 11);
  });
  curY += 16 + 5;

  // ── Seção: Dados Bancários ───────────────────────────────────────────────────
  const temFornecedor = exibirDadosFornecedor && fornecedorNome;
  const mostrarSecaoBancaria = exibirDadosBancarios || temFornecedor;

  if (mostrarSecaoBancaria) {
    curY = garantirEspaco(doc, curY, 30);
    const tituloSecao = exibirDadosBancarios
      ? "DADOS BANCÁRIOS – CONTRATADA"
      : "DADOS BANCÁRIOS – FORNECEDOR";
    curY = secaoHeader(doc, secNum++, tituloSecao, curY);

    if (exibirDadosBancarios && temFornecedor) {
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
        columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: "auto" } },
        didParseCell(data) {
          if (data.row.index === 0) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.textColor = DARK;
          }
        },
      });
    } else if (exibirDadosBancarios) {
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
    } else {
      autoTable(doc, {
        startY: curY,
        margin: { left: 14, right: 14 },
        body: [
          [fornecedorNome],
          ...(fornecedorCnpj  ? [[`CNPJ ${fornecedorCnpj}`]]  : []),
          ...(fornecedorBanco ? [[fornecedorBanco]]             : []),
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
    curY = doc.lastAutoTable.finalY + 8;
  }

  // ── Assinaturas ────────────────────────────────────────────────────────────
  curY = garantirEspaco(doc, curY, 40);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text("ASSINATURAS", 14, curY);
  curY += 2;
  doc.setDrawColor(...NAVY);
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
  doc.text(`Campinas, ${dataEmissao}.`, 105, curY, { align: "center" });

  // ── Rodapé em todas as páginas ─────────────────────────────────────────────
  drawPageFooter(doc, numero);

  // ── Salvar ─────────────────────────────────────────────────────────────────
  const nomeArquivo = `Orcamento_AVM_${numero}_${(clienteNome || "cliente").replace(/\s+/g, "_")}.pdf`;
  doc.save(nomeArquivo);
}
