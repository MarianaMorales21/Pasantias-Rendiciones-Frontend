export interface OrderItem {
    cod_opg: number;
    num_opg: number;
    ced_opg: string;
    fec_opg: string;
    fco_opg: string | null;
    fdc_opg: string;
    dcr_opg: string;
    mon_opg: string; 
    con_opg: string;
    sta_opg: number;
    par_opg: number;
    // Campos de visualización (del JOIN)
    nom_ctd?: string;
    ape_ctd?: string;
    nom_sta?: string;
    num_par?: string;
    nom_par?: string;
}
