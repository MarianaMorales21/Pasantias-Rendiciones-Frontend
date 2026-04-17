export interface OrderItem {
    cod_opg: number;
    num_opg: number;
    ced_ctd: string;
    fec_opg: string;
    fco_opg: string;
    asp_opg: string;
    dcr_opg: string;
    fdc_opg: string;
    mon_opg: string; 
    sta_opg: number;
    // Campos de visualización (del JOIN)
    nom_ctd?: string;
    ape_ctd?: string;
    nom_sta?: string;
}
