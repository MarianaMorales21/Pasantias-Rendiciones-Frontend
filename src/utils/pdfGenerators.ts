import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FullDetailedReport } from "../types/reports";
import { AuthorityItem } from "../types/authorities";
import { numberToLetters } from "../helpers/numberToLetters";
import {
  loadImage,
  JsPDFWithAutoTable
} from "./reportHelpers";


/**
 * GENERADOR: DETALLE DE RENDICIÓN
 */
export async function exportDetailedPDF(data: FullDetailedReport, authorities: AuthorityItem[]) {
  const { header, details, summary } = data;
  const doc = new jsPDF("p", "mm", "letter") as JsPDFWithAutoTable;
  const pageWidth = 216;

  const presidenta = authorities.find(a => a.ran_aut.toLowerCase().includes("presidenta"));

  const jefaAdmin = authorities.find(a =>
    a.ran_aut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("administrac") &&
    !a.ran_aut.toLowerCase().includes("presidenta")
  );

  let gobImg: string | undefined;
  let fundesImg: string | undefined;
  let amemosImg: string | undefined;
  let freddyImg: string | undefined;

  try { gobImg = await loadImage("/images/logos-reports/gobernacion.png"); } catch { /* ignore */ }
  try { fundesImg = await loadImage("/images/logos-reports/fundesB.png"); } catch { /* ignore */ }
  try { amemosImg = await loadImage("/images/logos-reports/amemosTachira.png"); } catch { /* ignore */ }
  try { freddyImg = await loadImage("/images/logos-reports/logoFreddy.png"); } catch { /* ignore */ }

  const drawHeader = () => {
    if (fundesImg) doc.addImage(fundesImg, "PNG", 12, 6, 34, 21);
    if (gobImg) doc.addImage(gobImg, "PNG", 149, 7, 55, 13);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("GOBERNACIÓN DEL ESTADO TÁCHIRA", pageWidth / 2, 8, { align: "center" });
    doc.text("DIRECCIÓN DE ADMINISTRACIÓN Y FINANZAS", pageWidth / 2, 12, { align: "center" });
    doc.text("DEPARTAMENTO DE RECEPCIÓN", pageWidth / 2, 16, { align: "center" });
    doc.text("DE RENDICIÓN DE CUENTAS", pageWidth / 2, 20, { align: "center" });
  };

  const drawFooter = () => {
    const footerY = 255;

    if (amemosImg) doc.addImage(amemosImg, "PNG", 15, footerY - 5, 45, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text([
      "FUNDES - TÁCHIRA RIF: G-20000513-0",
      "Dirección: 7ma Avenida con Calle 7, Centro Cívico, Torre \"A\", Piso 7.",
      "San Cristóbal, Estado Táchira",
      "Teléfonos: 0276-3422355 // fundestachira2025@gmail.com"
    ], pageWidth / 2, footerY, { align: "center" });

    if (freddyImg) doc.addImage(freddyImg, "PNG", 165, footerY - 8, 35, 18);
  };

  const applyHeaderFooterToAllPages = () => {
    const pageCount = doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      drawHeader();
      drawFooter();
    }
  };

  const formatVezDate = (d: Date | string | number | null | undefined): string => {
    if (!d || d === "N/A") return "N/A";

    if (d instanceof Date) {
      return d.toLocaleDateString("es-VE").replace(/-/g, "/");
    }

    const dateStr = String(d).split("T")[0];
    return dateStr.replace(/-/g, "/");
  };

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`RENDICIÓN DE CUENTA Nº ${header.num_rnd}`, 195, 31, { align: "right" });

  let y = 35;
  const margin = { left: 10, right: 10, bottom: 42 };

  autoTable(doc, {
    startY: y,
    margin,
    theme: "grid",
    body: [
      [
        { content: "FECHA", styles: { fillColor: [240, 243, 250], fontStyle: "bold" } },
        { content: "NÚMERO DE ORDEN", styles: { fillColor: [240, 243, 250], fontStyle: "bold" } },
        { content: "FECHA DE ORDEN DE PAGO", styles: { fillColor: [240, 243, 250], fontStyle: "bold" } },
        { content: "DECRETO", styles: { fillColor: [240, 243, 250], fontStyle: "bold" } },
        { content: "FECHA DECRETO", styles: { fillColor: [240, 243, 250], fontStyle: "bold" } },
        { content: "FECHA DE COBRO OPG", styles: { fillColor: [240, 243, 250], fontStyle: "bold" } }
      ],
      [
        formatVezDate(new Date()),
        header.num_opg,
        formatVezDate(header.fec_opg),
        header.dcr_opg || "N/A",
        formatVezDate(header.fdc_opg || header.fco_opg),
        formatVezDate(header.fco_opg)
      ],
      [
        { content: "ASIGNACIÓN PRESUPUESTARIA", styles: { fillColor: [240, 243, 250], fontStyle: "bold" }, colSpan: 2 },
        { content: "PERIODO DE RENDICIÓN", styles: { fillColor: [240, 243, 250], fontStyle: "bold" }, colSpan: 2 },
        { content: "% RENDIDO", styles: { fillColor: [240, 243, 250], fontStyle: "bold" }, colSpan: 2 }
      ],
      [
        { content: header.num_par || "PARTIDA PENDIENTE", colSpan: 2 },
        { content: (header.prd_rnd || "").toUpperCase(), colSpan: 2 },
        { content: `${summary.porcentajeRendido}%`, colSpan: 2, styles: { fontStyle: "bold" } }
      ]
    ],
    styles: { fontSize: 6, halign: "center", cellPadding: 1, textColor: [0, 0, 0], lineColor: [180, 180, 180], lineWidth: 0.1 }
  });

  y = doc.lastAutoTable.finalY + 2;

  autoTable(doc, {
    startY: y,
    margin,
    theme: "grid",
    head: [["MONTO ASIGNADO", "RENDIDO ANTERIOR", "MONTO RENDIDO", "REINTEGRO", "POR RENDIR", "% POR RENDIR"]],
    body: [[
      summary.montoAsignadoFmt,
      summary.montoRendidoAnteriorFmt,
      summary.montoRendidoFmt,
      summary.reintegroFmt || "0,00",
      summary.montoPorRendirFmt,
      `${summary.porcentajePorRendir || 0}%`
    ]],
    headStyles: { fillColor: [240, 243, 250], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 6.5, halign: "center", lineWidth: 0.1, lineColor: [180, 180, 180] },
    styles: { fontSize: 6.5, halign: "center", cellPadding: 1.2, textColor: [0, 0, 0], lineColor: [180, 180, 180], lineWidth: 0.1 }
  });

  y = doc.lastAutoTable.finalY + 2;

  autoTable(doc, {
    startY: y,
    margin,
    theme: "grid",
    body: [
      [
        { content: "DIRECCIÓN DEL ORGANISMO", styles: { fillColor: [240, 243, 250], fontStyle: "bold" }, colSpan: 3 },
        { content: "TELÉFONO", styles: { fillColor: [240, 243, 250], fontStyle: "bold" } }
      ],
      [
        { content: header.dir_org || "7ma Avenida Centro Cívico Torre 'A' Piso 7 San Cristóbal", colSpan: 3 },
        header.tel_org || "(0276) 3422355"
      ],
      [
        { content: "APELLIDOS Y NOMBRES DEL CUENTADANTE", styles: { fillColor: [240, 243, 250], fontStyle: "bold" } },
        { content: "CÉDULA", styles: { fillColor: [240, 243, 250], fontStyle: "bold" } },
        { content: "TELÉFONO", styles: { fillColor: [240, 243, 250], fontStyle: "bold" }, colSpan: 2 }
      ],
      [
        { content: `${header.nom_ctd} ${header.ape_ctd}`.toUpperCase() },
        header.ced_ctd,
        { content: "(0276) 3422355", colSpan: 2 }

      ]
    ],
    styles: { fontSize: 6.5, cellPadding: 1.2, textColor: [0, 0, 0], lineColor: [180, 180, 180], lineWidth: 0.1 },
    columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 35 }, 2: { cellWidth: 35 } }
  });

  y = doc.lastAutoTable.finalY + 4;

  for (const grupo of details) {
    autoTable(doc, {
      startY: y,
      margin,
      theme: "grid",
      body: [[(grupo.nom_pro || "").toUpperCase()]],
      styles: {
        fillColor: [225, 235, 245],
        fontStyle: "bold",
        halign: "center",
        fontSize: 7.5,
        cellPadding: 1.2,
        textColor: [0, 0, 0],
        lineColor: [180, 180, 180],
        lineWidth: 0.1
      }
    });

    y = doc.lastAutoTable.finalY;

    const rows: (string | number | { content: string; colSpan?: number; styles?: object })[][] = (grupo.items || []).map(item => [
      item.num_ndb,
      formatVezDate(item.fec_ndb),
      item.partida,
      item.ref_ndb || "-",
      (item.nom_ben || "").toUpperCase(),
      item.rif_ben || "-",
      (item.dir_ben || "-").toUpperCase(),
      item.des_drn,
      Number(item.mon_drn).toLocaleString("es-VE", { minimumFractionDigits: 2 })
    ]);

    rows.push([
      {
        content: `${(grupo.nom_pro || "").toUpperCase()} SUBTOTAL:`,
        colSpan: 8,
        styles: { halign: "right", fontStyle: "bold", fontSize: 6 }
      },
      {
        content: Number(grupo.subtotal).toLocaleString("es-VE", { minimumFractionDigits: 2 }),
        styles: { halign: "right", fontStyle: "bold", fontSize: 6 }
      }
    ]);

    autoTable(doc, {
      startY: y,
      margin,
      theme: "grid",
      head: [["ND / OP", "FECHA", "PARTIDA", "TRANSF.", "BENEFICIARIO / EMPRESA", "RIF / CI", "DIRECCIÓN", "CONCEPTO", "MONTO"]],
      body: rows,
      headStyles: {
        fillColor: [240, 243, 250],
        textColor: [0, 0, 0],
        fontSize: 6,
        halign: "center",
        fontStyle: "bold",
        lineWidth: 0.1,
        lineColor: [180, 180, 180]
      },
      styles: {
        fontSize: 5.5,
        cellPadding: 0.8,
        overflow: "linebreak",
        valign: "middle",
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: 15, halign: "center" },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 30 },
        5: { cellWidth: 15, halign: "center" },
        6: { cellWidth: 30 },
        7: { cellWidth: "auto" },
        8: { cellWidth: 18, halign: "right", fontStyle: "bold" }
      }
    });

    y = doc.lastAutoTable.finalY + 6;

    if (y > 220) {
      doc.addPage();
      y = 35;
    }
  }

  autoTable(doc, {
    startY: y,
    margin,
    theme: "grid",
    body: [[
      {
        content: "TOTAL GENERAL:",
        colSpan: 8,
        styles: { halign: "right", fontStyle: "bold", fontSize: 7, fillColor: [255, 255, 255] }
      },
      {
        content: summary.montoRendidoFmt,
        styles: { halign: "right", fontStyle: "bold", fontSize: 7, fillColor: [255, 255, 255] }
      }
    ]],
    styles: { cellPadding: 1.5, textColor: [0, 0, 0], lineColor: [180, 180, 180], lineWidth: 0.2 }
  });

  let signY = doc.lastAutoTable.finalY + 35;
  if (signY > 215) {
    doc.addPage();
    signY = 55;
  }

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(30, signY, 90, signY);
  doc.line(120, signY, 180, signY);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");

  const presName = presidenta
    ? `${presidenta.abr_ran || ""} ${presidenta.nom_aut} ${presidenta.ape_aut}`.trim().toUpperCase()
    : "PENDIENTE";

  const adminName = jefaAdmin
    ? `${jefaAdmin.abr_ran || ""} ${jefaAdmin.nom_aut} ${jefaAdmin.ape_aut}`.trim().toUpperCase()
    : "PENDIENTE";

  doc.text(presName, 60, signY + 5, { align: "center" });
  doc.text(adminName, 150, signY + 5, { align: "center" });

  doc.setFontSize(7);
  doc.text(`C.I. ${presidenta?.ced_aut || ""}`, 60, signY + 9, { align: "center" });
  doc.text(`C.I. ${jefaAdmin?.ced_aut || ""}`, 150, signY + 9, { align: "center" });
  doc.text(presidenta?.ran_aut?.toUpperCase() || "PRESIDENTA", 60, signY + 13, { align: "center" });
  doc.text(jefaAdmin?.ran_aut?.toUpperCase() || "ADMINISTRACIÓN", 150, signY + 13, { align: "center" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6);

  if (presidenta?.dec_aut) {
    const presDec = doc.splitTextToSize(presidenta.dec_aut.toUpperCase(), 70);
    doc.text(presDec, 60, signY + 17, { align: "center" });
  }

  if (jefaAdmin?.dec_aut) {
    const adminDec = doc.splitTextToSize(jefaAdmin.dec_aut.toUpperCase(), 70);
    doc.text(adminDec, 150, signY + 17, { align: "center" });
  }

  applyHeaderFooterToAllPages();

  doc.save(`Detalle_Rnd_${header.num_rnd}.pdf`);
}
/**
 * GENERADOR: ACTA DE ENTREGA
 */
export async function exportActaPDF(data: FullDetailedReport, authorities: AuthorityItem[]) {
  const { header, summary } = data;
  const doc = new jsPDF("p", "mm", "letter") as JsPDFWithAutoTable;
  const pageWidth = 216;

  const presidenta = authorities.find(a => a.ran_aut.toLowerCase().includes("presidenta"));

  const administradora = authorities.find(a =>
    a.ran_aut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("administrac") ||
    a.ran_aut.toLowerCase().includes("división de administración") ||
    a.nom_aut.toLowerCase().includes("deccy")
  );

  const jefeGobernacion = authorities.find(a =>
    a.ran_aut.toLowerCase().includes("gobernación") ||
    a.ran_aut.toLowerCase().includes("finanzas") ||
    a.ran_aut.toLowerCase().includes("director")
  );

  try {
    const fundesImg = await loadImage("/images/logos-reports/fundesB.png");
    doc.addImage(fundesImg, "PNG", 155, 8, 38, 24);
    try {
      const gobImg = await loadImage("/images/logos-reports/gobernacion.png");
      doc.addImage(gobImg, "PNG", 15, 8, 58, 14);
    } catch { /* ignore */ }
  } catch { /* ignore */ }

  const today = new Date();
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const dateStr = `San Cristóbal, ${today.getDate()} de ${meses[today.getMonth()]} de ${today.getFullYear()}`;

  doc.setFontSize(12);
  doc.setFont("times", "italic");
  doc.text(dateStr, 195, 42, { align: "right" });

  let y = 52;

  doc.text("Ciudadana", 15, y); y += 5;
  doc.setFont("times", "bolditalic");

  const nameRec = jefeGobernacion ? `${jefeGobernacion.nom_aut} ${jefeGobernacion.ape_aut}`.toUpperCase() : "MILAGROS DEL VALLE RAMOS GARCÍA";
  const destName = `Lcda. ${nameRec.replace("LCDA. ", "").replace("LCDA ", "")}`;
  const destCargo = jefeGobernacion ? jefeGobernacion.ran_aut.toUpperCase() : "DIRECTORA DE ADMINISTRACIÓN Y FINANZAS";
  const destInst = "GOBERNACIÓN DEL ESTADO TÁCHIRA";

  doc.text(destName, 15, y); y += 5;
  doc.text(destCargo, 15, y); y += 5;
  doc.text(destInst, 15, y); y += 5;

  doc.setFont("times", "italic");
  doc.text("Su Despacho", 15, y); y += 6;

  const attLabel = "Atención: ";
  const deptLabel = "Departamento Rendición de Cuentas";

  doc.setFont("times", "italic");
  doc.text(deptLabel, 195, y, { align: "right" });
  const wDept = doc.getTextWidth(deptLabel);

  doc.setFont("times", "bolditalic");
  doc.text(attLabel, 195 - wDept, y, { align: "right" });
  y += 10;

  const drawWrappedMixedText = (
    parts: { text: string; bold: boolean }[],
    startX: number,
    startY: number,
    maxWidth: number,
    lineHeight: number,
    firstLineIndent = 0,
    justify = false
  ) => {
    type Token = { text: string; bold: boolean; width: number };

    const lines: Token[][] = [];
    let currentLine: Token[] = [];
    let currentWidth = 0;

    parts.forEach(part => {
      doc.setFont("times", part.bold ? "bolditalic" : "italic");
      doc.setFontSize(12);

      const words = part.text.trim().split(/\s+/);

      words.forEach(word => {
        const tokenWidth = doc.getTextWidth(word);
        const spaceWidth = doc.getTextWidth(" ");
        const lineMaxWidth = lines.length === 0 ? maxWidth - firstLineIndent : maxWidth;
        const nextWidth = currentLine.length === 0 ? tokenWidth : currentWidth + spaceWidth + tokenWidth;

        if (currentLine.length > 0 && nextWidth > lineMaxWidth) {
          lines.push(currentLine);
          currentLine = [{ text: word, bold: part.bold, width: tokenWidth }];
          currentWidth = tokenWidth;
        } else {
          currentLine.push({ text: word, bold: part.bold, width: tokenWidth });
          currentWidth = nextWidth;
        }
      });
    });

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    lines.forEach((line, lineIndex) => {
      const isFirstLine = lineIndex === 0;
      const isLastLine = lineIndex === lines.length - 1;
      const lineX = isFirstLine ? startX + firstLineIndent : startX;
      const lineMaxWidth = isFirstLine ? maxWidth - firstLineIndent : maxWidth;

      const wordsWidth = line.reduce((sum, token) => sum + token.width, 0);
      const gaps = line.length - 1;
      const normalSpaceWidth = doc.getTextWidth(" ");
      const spaceWidth = justify && !isLastLine && gaps > 0
        ? (lineMaxWidth - wordsWidth) / gaps
        : normalSpaceWidth;

      let currentX = lineX;
      const currentY = startY + (lineIndex * lineHeight);

      line.forEach((token, tokenIndex) => {
        doc.setFont("times", token.bold ? "bolditalic" : "italic");
        doc.setFontSize(12);
        doc.text(token.text, currentX, currentY);
        currentX += token.width;

        if (tokenIndex < line.length - 1) {
          currentX += spaceWidth;
        }
      });
    });

    return startY + (lines.length * lineHeight);
  };

  const paragraphIndent = 8;

  const salute = `Reciba un saludo cordial y revolucionario, en nombre de la Fundación para el Desarrollo Social del Estado Táchira “FUNDES – TÁCHIRA”, con espíritu de colaboración, unidad y fortaleciendo los lazos que nos unen en la búsqueda de objetivos comunes y deseándole el mayor de los éxitos en las funciones que desempeñan.`;

  y = drawWrappedMixedText([{ text: salute, bold: false }], 15, y, 180, 5, paragraphIndent, true);
  y += 3;

  y = drawWrappedMixedText([
    { text: "Por medio de la presente, se hace entrega formal de la Rendición de Cuenta Nº ", bold: false },
    { text: `${header.num_rnd}`, bold: true },
    { text: ", por la cantidad de ", bold: false },
    { text: `${numberToLetters(summary.montoRendido)} (Bs. ${summary.montoRendidoFmt})`, bold: true },
    { text: ".", bold: false }
  ], 15, y, 180, 5, paragraphIndent, true);
  y += 3;

  y = drawWrappedMixedText([
    { text: "Dicha rendición corresponde a la Orden de Pago Nº ", bold: false },
    { text: `${header.num_opg}`, bold: true },
    { text: " por concepto de: ", bold: false },
    { text: `${(header.con_opg || "").toUpperCase()}, APROBADO SEGÚN DECRETO Nº ${header.dcr_opg} DE FECHA ${header.fdc_opg}, ASIGNACIÓN PRESUPUESTARIA ${header.num_par || ""}, RECIBIDA POR LA CANTIDAD ${numberToLetters(summary.montoAsignado)} (Bs. ${summary.montoAsignadoFmt})`, bold: true },
    { text: ".", bold: false }
  ], 15, y, 180, 5, paragraphIndent, true);
  y += 3;

  y = drawWrappedMixedText([
    { text: "Se deja constancia que con esta rendición se alcanza el ", bold: false },
    { text: `${summary.porcentajeRendido}%`, bold: true },
    { text: " de la totalidad de la orden de pago quedando pendiente el ", bold: false },
    { text: `${summary.porcentajePorRendir}%`, bold: true },
    { text: " por la cantidad de ", bold: false },
    { text: `${numberToLetters(summary.montoPorRendir)} (Bs. ${summary.montoPorRendirFmt})`, bold: true },
    { text: ".", bold: false }
  ], 15, y, 180, 5, paragraphIndent, true);
  y += 7;

  doc.setFont("times", "italic");
  doc.setFontSize(12);
  doc.text("Sin otro particular a que hacer referencia, nos suscribimos de usted.", 15 + paragraphIndent, y);
  y += 5;
  doc.text("Atentamente,", 15, y);
  y += 6;

  doc.setFont("times", "bolditalic");
  doc.setFontSize(12);
  doc.text("“Los Queremos de Vuelta”", pageWidth / 2, y, { align: "center" });

  y += 18;

  const signY = y;
  const presCenterX = 55;
  const adminCenterX = 155;
  const lineHalfWidth = 40;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.line(presCenterX - lineHalfWidth, signY, presCenterX + lineHalfWidth, signY);
  doc.line(adminCenterX - lineHalfWidth, signY, adminCenterX + lineHalfWidth, signY);

  doc.setFont("times", "bolditalic");
  doc.setFontSize(12);

  const presName = presidenta ? `Lcda. ${presidenta.nom_aut} ${presidenta.ape_aut}`.toUpperCase() : "LCDA. YARITZA ISBEL PEÑA DUARTE";
  const adminName = administradora ? `Lcda. ${administradora.nom_aut} ${administradora.ape_aut}`.toUpperCase() : "LCDA. DECCY C. PERNÍA LEAL";

  doc.text(presName, presCenterX, signY + 5, { align: "center" });
  doc.text(adminName, adminCenterX, signY + 5, { align: "center" });

  doc.text(presidenta?.ran_aut?.toUpperCase() || "PRESIDENTA", presCenterX, signY + 10, { align: "center" });
  doc.text(administradora?.ran_aut?.toUpperCase() || "JEFE DIVISIÓN DE ADMINISTRACIÓN", adminCenterX, signY + 10, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(5.8);

  if (presidenta?.dec_aut) {
    const splitDecPres = doc.splitTextToSize(presidenta.dec_aut.toUpperCase(), 72);
    doc.text(splitDecPres, presCenterX, signY + 14, { align: "center" });
  }

  if (administradora?.dec_aut) {
    const splitDecAdmin = doc.splitTextToSize(administradora.dec_aut.toUpperCase(), 72);
    doc.text(splitDecAdmin, adminCenterX, signY + 14, { align: "center" });
  }

  const footerY = 255;

  const imgAmemos = "/images/logos-reports/amemosTachira.png";
  doc.addImage(imgAmemos, "PNG", 15, footerY - 5, 45, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const infoText = [
    "FUNDES - TACHIRA RIF: G-20000513-0",
    "Dirección: 7ma Avenida con Calle 7, Centro Cívico, Torre \"A\", Piso 7.",
    "San Cristóbal, Estado Táchira",
    "Teléfonos: 0276-3422355 // fundestachira2025@gmail.com"
  ];
  doc.text(infoText, pageWidth / 2, footerY, { align: "center" });

  const imgFreddy = "/images/logos-reports/logoFreddy.png";
  doc.addImage(imgFreddy, "PNG", 165, footerY - 8, 35, 18);

  doc.save(`Acta_Entrega_Rnd_${header.num_rnd}.pdf`);
}
/**
 * GENERADOR: SOLICITUD (FORMA) - CORREGIDO
 */
export async function exportSolicitudFormaPDF(data: FullDetailedReport, authorities: AuthorityItem[]) {
  const { header, summary } = data;
  const doc = new jsPDF("p", "mm", "letter") as JsPDFWithAutoTable;

  // --- Lógica de Autoridad ---
  const administradora = authorities.find(a =>
    a.ran_aut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("ADMINISTRAC") ||
    a.nom_aut.toLowerCase().includes("deccy")
  );

  const abr = administradora?.abr_ran || "Lcda.";
  const adminNombreFull = administradora
    ? `${abr} ${administradora.nom_aut.toUpperCase()} ${administradora.ape_aut.toUpperCase()}`
    : `Lcda. ${header.nom_ctd.toUpperCase()} ${header.ape_ctd.toUpperCase()}`;
  const adminCedula = administradora ? administradora.ced_aut : header.ced_ctd;
  const adminCargo = (administradora ? administradora.ran_aut : "JEFE DE LA DIVISION DE ADMINISTRACION").toUpperCase();

  const logoFundes = "/images/logos-reports/fundesB.png";
  const logoGob = "/images/logos-reports/gobernacion.png";

  const marginX = 10;
  const tableWidth = 195; // Reducido ligeramente para evitar roces con el borde
  const startY = 15;

  // 1. MARCO EXTERIOR
  doc.setLineWidth(0.8);
  doc.rect(marginX, startY, tableWidth, 145); // Aumentado a 145 para que quepa la firma

  // 2. ENCABEZADO CON AUTOTABLE
  autoTable(doc, {
    startY: startY,
    margin: { left: marginX },
    tableWidth: tableWidth,
    theme: "plain",
    styles: { fontSize: 7, font: "helvetica", textColor: [0, 0, 0], cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 55 },
      2: { cellWidth: 30 },
      3: { cellWidth: 85 },
    },
    body: [
      [
        { content: "", styles: { minCellHeight: 20 } },
        {
          content: "GOBIERNO BOLIVARIANO DEL TÁCHIRA\nDIRECCIÓN DE ADMINISTRACIÓN Y FINANZAS\nDEPARTAMENTO RECEPCIÓN\nDE RENDICIÓN DE CUENTAS",
          styles: { halign: "center", valign: "middle", fontStyle: "bold" }
        },
        { content: "", styles: { valign: "middle" } },
        {
          content: "SOLICITUD DE CONSTANCIA DE NOTIFICACIÓN DE\nRENDICIÓN DE CUENTA\n\nOYM-E6.1-01F/2015",
          styles: { halign: "center", valign: "middle", fontStyle: "bold", fontSize: 9 }
        }
      ]
    ],
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        doc.addImage(logoFundes, 'PNG', data.cell.x + 2, data.cell.y + 2, 20, 15);
      }
      if (data.section === 'body' && data.column.index === 2) {
        doc.addImage(logoGob, 'PNG', data.cell.x + 2, data.cell.y + 5, 26, 9);
      }
      if (data.column.index === 3) {
        doc.setLineWidth(0.5);
        doc.line(data.cell.x, data.cell.y, data.cell.x, data.cell.y + data.cell.height);
      }
    }
  });

  let currentY = doc.lastAutoTable.finalY;
  doc.setLineWidth(0.5);
  doc.line(marginX, currentY, marginX + tableWidth, currentY);

  // 3. CUERPO DE DATOS (AJUSTE DE COORDENADAS PARA EVITAR MONTE)
  const drawLine = (x: number, y: number, w: number) => {
    doc.setLineWidth(0.2);
    doc.line(x, y + 1, x + w, y + 1);
  };

  doc.setFontSize(9);
  currentY += 7;

  // Fila 1: Yo y Cédula
  doc.setFont("helvetica", "normal");
  doc.text("Yo,", marginX + 2, currentY);
  doc.setFont("helvetica", "bold");
  doc.text(adminNombreFull, marginX + 65, currentY, { align: "center" });
  drawLine(marginX + 8, currentY, 110);

  doc.setFont("helvetica", "normal");
  doc.text("Portador de la cédula de identidad Nº", marginX + 120, currentY);
  doc.setFont("helvetica", "bold");
  doc.text(`V-${adminCedula}`, marginX + 182, currentY, { align: "center" });
  drawLine(marginX + 172, currentY, 20);

  // Fila 2: Condición
  currentY += 9;
  doc.setFont("helvetica", "normal");
  doc.text("en mi condición de", marginX + 2, currentY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8); // Un poco más pequeña para que no se monte si el cargo es largo
  doc.text(adminCargo, marginX + 85, currentY, { align: "center" });
  drawLine(marginX + 32, currentY, 110);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("del Organismo", marginX + 170, currentY);

  // Fila 3: Organismo (Reducción de fuente para evitar que se salga)
  currentY += 9;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const orgName = (header.nom_org || "FUNDACION PARA EL DESARROLLO SOCIAL DEL ESTADO TACHIRA (FUNDES - TACHIRA)").toUpperCase();
  doc.text(orgName, marginX + 2, currentY);
  drawLine(marginX + 2, currentY, 135);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("con sede ubicada en:", marginX + 142, currentY);

  // Fila 4: Sede y Teléfono
  currentY += 9;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  const sede = header.dir_org || "7MA. AV. CENTRO CIVICO TORRE 'A' PISO 7 SAN CRISTOBAL";
  doc.text(sede, marginX + 2, currentY);
  drawLine(marginX + 2, currentY, 120);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Teléfono:", marginX + 125, currentY);
  doc.setFont("helvetica", "bold");
  doc.text(header.tel_org || "(0276) - 342.17.45", marginX + 170, currentY, { align: "center" });
  drawLine(marginX + 145, currentY, 48);

  // 4. SECCIÓN ORDEN DE PAGO
  currentY += 5;
  doc.setLineWidth(0.5);
  doc.line(marginX, currentY, marginX + tableWidth, currentY);

  currentY += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Por medio de la presente, anexo los requisitos exigidos, para solicitar Constancia de Notificación de", marginX + 2, currentY);

  currentY += 9;
  doc.text("Rendición de Cuentas correspondiente a la Orden de Pago Nº", marginX + 2, currentY);
  doc.setFont("helvetica", "bold");
  doc.text(header.num_opg.toString(), marginX + 125, currentY, { align: "center" });
  drawLine(marginX + 110, currentY, 30);
  doc.setFont("helvetica", "normal");
  doc.text("por un monto en bolívares", marginX + 150, currentY);

  currentY += 10;
  doc.setFont("helvetica", "bold");
  doc.text(summary.montoRendidoFmt, marginX + 20, currentY, { align: "center" });
  drawLine(marginX + 4, currentY, 35);

  doc.setFont("helvetica", "normal");
  doc.text("con fecha de cobro", marginX + 42, currentY);
  doc.setFont("helvetica", "bold");
  doc.text(header.fco_opg || "2025-12-16", marginX + 80, currentY, { align: "center" });
  drawLine(marginX + 70, currentY, 25);

  doc.setFont("helvetica", "normal");
  doc.text("Partida Nº", marginX + 97, currentY);
  doc.setFontSize(7);
  doc.text(header.num_par || "13.05.51.4-07.01.03.02.003.002-000", marginX + 133, currentY, { align: "center" });
  drawLine(marginX + 113, currentY, 45);
  doc.setFontSize(8);
  doc.text("por concepto de:", marginX + 173, currentY, { align: "center" });

  // 5. CAJA DE CONCEPTO
  currentY += 5;
  doc.setLineWidth(0.5);
  doc.line(marginX, currentY, marginX + tableWidth, currentY);

  currentY += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const conceptText = (header.con_opg || "TRANSFERENCIAS DE CAPITAL A ENTES...").toUpperCase();
  const splitConcept = doc.splitTextToSize(conceptText, tableWidth - 4);
  doc.text(splitConcept, marginX + 2, currentY);

  // 6. FECHA Y FIRMA (RE-UBICADO PARA QUE NO SE CORTE)
  currentY = startY + 105;
  doc.line(marginX, currentY, marginX + tableWidth, currentY);

  currentY += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`En San Cristóbal, a los`, marginX + 2, currentY);
  doc.setFont("helvetica", "bold");
  doc.text("15", marginX + 49, currentY, { align: "center" });
  drawLine(marginX + 42, currentY, 15);

  doc.setFont("helvetica", "normal");
  doc.text(`días, del mes de`, marginX + 60, currentY);
  doc.setFont("helvetica", "bold");
  doc.text("ENERO", marginX + 110, currentY, { align: "center" });
  drawLine(marginX + 88, currentY, 45);

  doc.setFont("helvetica", "normal");
  doc.text(`de`, marginX + 135, currentY);
  doc.setFont("helvetica", "bold");
  doc.text("2026", marginX + 152, currentY, { align: "center" });
  drawLine(marginX + 142, currentY, 20);

  // Firma
  currentY += 12;
  doc.line(marginX + 60, currentY, marginX + 135, currentY);
  doc.setFontSize(8.5);
  doc.text(adminNombreFull.toUpperCase(), marginX + 97.5, currentY + 5, { align: "center" });

  // 7. NOTA PIE
  const footerY = startY + 135;
  doc.setLineWidth(0.5);
  doc.line(marginX, footerY, marginX + tableWidth, footerY);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("NOTA:", marginX + 2, footerY + 4);
  doc.setFont("helvetica", "normal");
  const nota = "La constancia de verificación de Rendición de Cuentas, Solamente será entregada con la presentación de la Solicitud, en el Departamento de Recepción de Rendición de Cuentas, de la Gobernación del Estado Táchira, dentro de los siguientes ocho (08) días hábiles a su petición.";
  const margenIzquierdoNota = 12;
  const anchoDisponible = tableWidth - margenIzquierdoNota - 4;
  doc.text(nota, marginX + margenIzquierdoNota, footerY + 4, {
    align: "justify",
    maxWidth: anchoDisponible
  });

  doc.save(`Solicitud_Rnd_${header.num_rnd}.pdf`);
}

/**
 * GENERADOR: SOLICITUD (CARTA)
 */
export async function exportSolicitudCartaPDF(data: FullDetailedReport, authorities: AuthorityItem[]) {
  const { header, summary } = data;
  const doc = new jsPDF("p", "mm", "letter") as JsPDFWithAutoTable;

  // Buscar autoridad (Administradora)
  const administradora = authorities.find(a =>
    a.ran_aut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("ADMINISTRAC") ||
    a.ran_aut.toLowerCase().includes("división de administración") ||
    a.nom_aut.toLowerCase().includes("deccy")
  );

  // Logos
  try {
    const fundesImg = await loadImage("/images/logos-reports/fundesB.png");
    doc.addImage(fundesImg, "PNG", 160, 8, 38, 24);
    try {
      const gobImg = await loadImage("/images/logos-reports/gobernacion.png");
      doc.addImage(gobImg, "PNG", 20, 8, 58, 14);
    } catch { /* ignore */ }
  } catch { /* ignore */ }

  const today = new Date();
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const dateStr = `San Cristóbal, a los ${today.getDate()} días del mes de ${meses[today.getMonth()]} de ${today.getFullYear()}.`;

  const marginX = 25;
  const pageWidth = 216;
  const contentWidth = pageWidth - (marginX * 2);
  let y = 40;

  // Título
  doc.setFontSize(12);
  doc.setLineHeightFactor(1.5); // Establece interlineado 1.5 globalmente para doc.text()

  doc.setFont("times", "bolditalic");
  doc.text("SOLICITUD DE CONSTANCIA", pageWidth / 2, y, { align: "center" });
  y += 6;
  doc.text("DE NOTIFICACION DE RENDICION DE CUENTA", pageWidth / 2, y, { align: "center" });
  y += 12;

  doc.setFont("times", "italic");
  const adminNombre = administradora ? `${administradora.nom_aut} ${administradora.ape_aut}`.toUpperCase() : `${header.nom_ctd} ${header.ape_ctd}`.toUpperCase();
  const adminCedula = administradora ? administradora.ced_aut : header.ced_ctd;
  const adminCargo = administradora ? (administradora.ran_aut.includes("DIVISIÓN") ? "ADMINISTRADORA" : administradora.ran_aut.toUpperCase()) : "ADMINISTRADORA";

  // Texto del primer párrafo
  const text1 = `     Yo, ${adminNombre}, V-${adminCedula}, en mi condición de ${adminCargo}, del organismo Fundación para el Desarrollo Social del Estado Táchira (FUNDES-TÁCHIRA), con sede ubicada en el ${header.dir_org || "CENTRO CÍVICO PISO 7, TORRE A"}, TELEFONO: ${header.tel_org || "0276-3421745"}, por medio de la presente, solicito Constancia de Notificación de la Rendición de Cuenta Nº ${header.num_rnd}.`;

  const splitText1 = doc.splitTextToSize(text1, contentWidth);
  doc.text(splitText1, marginX, y, { align: "justify", maxWidth: contentWidth });

  const blockHeight1 = splitText1.length * 12 * 1.5 * 0.3527;
  y += blockHeight1 + 2;

  // Texto del segundo párrafo
  const text2 = `     Dicha rendición corresponde a la cantidad de ${numberToLetters(summary.montoRendido)} (Bs.${summary.montoRendidoFmt}), la cual corresponde a la Orden de Pago Nº ${header.num_opg} por concepto de: ${(header.con_opg || "").toUpperCase()}, APROBADO SEGÚN DECRETO Nº ${header.dcr_opg} DE FECHA ${header.fdc_opg}, ASIGNACIÓN PRESUPUESTARIA ${header.num_par} RECIBIDA POR LA CANTIDAD ${numberToLetters(summary.montoAsignado)} (Bs.${summary.montoAsignadoFmt}).`;

  const splitText2 = doc.splitTextToSize(text2, contentWidth);
  doc.text(splitText2, marginX, y, { align: "justify", maxWidth: contentWidth });

  const blockHeight2 = splitText2.length * 12 * 1.5 * 0.3527;
  y += blockHeight2 + 2;

  // Texto del tercer párrafo
  const text3 = `     Se deja constancia que con esta rendición se alcanza el ${summary.porcentajeRendido}% de la totalidad de la orden de pago, quedando pendiente el ${summary.porcentajePorRendir}% por la cantidad de ${numberToLetters(summary.montoPorRendir)} (Bs. ${summary.montoPorRendirFmt}).`;

  const splitText3 = doc.splitTextToSize(text3, contentWidth);
  doc.text(splitText3, marginX, y, { align: "justify", maxWidth: contentWidth });

  const blockHeight3 = splitText3.length * 12 * 1.5 * 0.3527;
  y += blockHeight3 + 6;

  // Fecha
  doc.setFont("times", "italic");
  doc.setFontSize(12);
  doc.text(dateStr, marginX, y);

  // Lema
  y += 18;
  doc.setFont("times", "bolditalic");
  doc.setFontSize(11);
  doc.text("“Los Queremos de Vuelta”", pageWidth / 2, y, { align: "center" });

  // --- FIRMA ---
  const signY = y + 26;
  const lineLength = 100;

  doc.setLineWidth(0.3);
  doc.line(
    (pageWidth / 2) - (lineLength / 2),
    signY - 5,
    (pageWidth / 2) + (lineLength / 2),
    signY - 5
  );

  doc.setFont("times", "bolditalic");
  doc.setFontSize(11);

  const abr = administradora?.abr_ran || "LCDA.";
  const signName = administradora
    ? `${abr} ${administradora.nom_aut} ${administradora.ape_aut}`.toUpperCase()
    : `LCDA. ${header.nom_ctd} ${header.ape_ctd}`.toUpperCase();

  const signCargo = administradora
    ? administradora.ran_aut.toUpperCase()
    : "JEFE DE LA DIVISIÓN DE ADMINISTRACIÓN";

  doc.text(signName, pageWidth / 2, signY, { align: "center" });
  doc.text(signCargo, pageWidth / 2, signY + 5, { align: "center" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6);

  if (administradora?.dec_aut) {
    const adminDec = doc.splitTextToSize(administradora.dec_aut.toUpperCase(), 90);
    doc.text(adminDec, pageWidth / 2, signY + 10, { align: "center" });
  } else {
    doc.text("SIN DECRETO", pageWidth / 2, signY + 10, { align: "center" });
  }

  const footerY = 255;
  const imgAmemos = "/images/logos-reports/amemosTachira.png";
  doc.addImage(imgAmemos, "PNG", 15, footerY - 5, 45, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const infoText = [
    "FUNDES - TACHIRA RIF: G-20000513-0",
    "Dirección: 7ma Avenida con Calle 7, Centro Cívico, Torre \"A\", Piso 7.",
    "San Cristóbal, Estado Táchira",
    "Teléfonos: 0276-3422355 // fundestachira2025@gmail.com"
  ];
  doc.text(infoText, pageWidth / 2, footerY, { align: "center" });


  const imgFreddy = "/images/logos-reports/logoFreddy.png";
  doc.addImage(imgFreddy, "PNG", 165, footerY - 8, 35, 18);

  doc.save(`Solicitud_Carta_Rnd_${header.num_rnd}.pdf`);
}
