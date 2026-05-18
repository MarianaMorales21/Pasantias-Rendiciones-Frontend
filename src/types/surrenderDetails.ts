export interface SurrenderDetailsItem {
    cod_drn: number;
    cab_drn: number; // cod_ndb
    par_drn: number; // cod_par
    des_drn: string;
    mon_drn: number;
    cod_pro?: number;
    sta_drn?: number;
    // Campos joined desde el backend
    num_rnd?: string;
    num_par?: string;
    nom_ben?: string;
    nom_pro?: string;
    nom_sta?: string;
}
