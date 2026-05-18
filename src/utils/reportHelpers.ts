import { jsPDF } from "jspdf";

/**
 * Carga una imagen desde una URL y la convierte a Base64 para jsPDF
 */
export const loadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.onerror = reject;
  });
};

/**
 * Formatea una fecha a formato natural (ej: 12 de mayo de 2024)
 */
export const formatDateNatural = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  } catch { return dateStr; }
};

/**
 * Interfaz extendida para jsPDF con soporte de autoTable
 */
export interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

/**
 * Constantes de diseño para reportes PDF
 */
export const PDF_COLORS = {
  BLACK: [0, 0, 0] as [number, number, number],
  BORDER: [190, 200, 210] as [number, number, number],
  HEADER_FILL: [248, 250, 252] as [number, number, number],
  SECTION_FILL: [235, 239, 244] as [number, number, number],
};

export const pdfTableBaseStyles = {
  theme: "grid" as const,
  styles: {
    font: "helvetica",
    fontSize: 5.8,
    cellPadding: 1.05,
    textColor: PDF_COLORS.BLACK,
    lineColor: PDF_COLORS.BORDER,
    lineWidth: 0.15,
    valign: "middle" as const,
  },
  headStyles: {
    fillColor: PDF_COLORS.HEADER_FILL,
    textColor: PDF_COLORS.BLACK,
    fontStyle: "bold" as const,
    halign: "center" as const,
    lineColor: PDF_COLORS.BORDER,
    lineWidth: 0.15,
  },
};
