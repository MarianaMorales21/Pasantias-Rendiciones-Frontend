export interface SurrenderItem {
    cod_rnd: number;
    num_rnd: string;
    opg_rnd: number; // Cambio de cod_opg a opg_rnd según DDL
    fec_rnd: string;
    prd_rnd: string;
    avs_rnd: string;
    sta_rnd: number;
    // Campos joined desde el backend
    num_opg?: string | number;
    mon_opg?: number | string;
    nom_sta?: string;
}
