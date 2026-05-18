// Item de detalle dentro de un programa
export interface ReportDetailItem {
  num_ndb: string;
  fec_ndb: string;
  partida: string;
  ban_ndb: string;
  ref_ndb: string | number;
  nom_ben: string;
  rif_ben: string;
  dir_ben?: string;
  des_drn: string;
  mon_drn: number;
}

// Grupo de ítems por programa
export interface ReportProgramGroup {
  cod_pro: number;
  nom_pro: string;
  items: ReportDetailItem[];
  subtotal: number;
}

// Encabezado del reporte (datos de rendición + OPG + organismo + cuentadante)
// Encabezado del reporte (Añadimos los campos que faltaban del JOIN)
export interface ReportHeader {
  cod_rnd: number;
  num_rnd: string;
  fec_rnd: string;
  prd_rnd: string;
  avs_rnd: string;
  arn_rnd: string;
  cod_opg: number;
  num_opg: number;
  fec_opg: string;
  mon_opg: number;
  con_opg: string;
  fco_opg: string;
  dcr_opg: string;
  par_opg?: string; // Este es el ID o código base

  // --- CAMPOS NUEVOS A AGREGAR ---
  num_par?: string;  // El código de la partida de la orden (ej: 4.01...)
  nom_par?: string;  // El nombre de la partida
  fdc_opg?: string;
  // -------------------------------

  nom_org: string;
  dir_org: string;
  tel_org: string;
  nom_ctd: string;
  ape_ctd: string;
  ced_ctd: string;

  // También podrías necesitar este si tu backend lo envía
  fec_dcr?: string;
}
// Resumen de montos del reporte detallado
export interface ReportSummary {
  montoAsignado: number;
  montoRendidoAnterior: number;
  montoRendido: number;
  montoPorRendir: number;
  porcentajeRendido: number;
  porcentajePorRendir: number;
  montoAsignadoFmt: string;
  montoRendidoAnteriorFmt: string;
  montoRendidoFmt: string;
  montoPorRendirFmt: string;
}

// Datos completos del reporte detallado
export interface FullDetailedReport {
  ok: boolean;
  header: ReportHeader;
  details: ReportProgramGroup[];
  summary: ReportSummary;
}

// Destinatario del acta
export interface ActaDestinatario {
  titulo: string;
  nombre: string;
  cargo: string;
  institucion: string;
  despacho: string;
  atencion: string;
}

// Firmante del acta
export interface ActaFirmante {
  nombre: string;
  cedula: string;
  cargo: string;
}

// Datos del acta
export interface ActaData {
  numRendicion: string;
  textoActa: string;
  fecha: string;
  destinatario: ActaDestinatario;
  firmante: ActaFirmante;
}

// Resumen de montos del acta
export interface ActaSummary {
  montoAsignado: number;
  montoRendido: number;
  montoPorRendir: number;
  porcentajeRendido: number;
  porcentajePorRendir: number;
  montoRendidoLetras: string;
  montoAsignadoLetras: string;
  montoPorRendirLetras: string;
  montoRendidoFmt: string;
  montoAsignadoFmt: string;
  montoPorRendirFmt: string;
}

// Datos completos del acta
export interface FullActaReport {
  ok: boolean;
  data: {
    numRendicion: string;
    textoActa: string;
    fechaDocumento: string;
    firmante: ActaFirmante;
    resumen: {
      montoRendido: number;
      montoAsignado: number;
      montoPorRendir: number;
      porcentajeRendido: number;
    };
  };
}

// Item para el selector de rendiciones
export interface RenditionListItem {
  cod_rnd: number;
  num_rnd: string;
  fec_rnd: string;
  prd_rnd: string;
  cod_opg: number;
  num_opg: number;
  mon_opg: number;
  total_rendido: number;
  porcentaje: number;
  label: string;
}