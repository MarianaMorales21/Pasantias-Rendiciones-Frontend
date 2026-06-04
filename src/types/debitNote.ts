export interface DebitNoteItem {
    cod_ndb: number;
    num_ndb: string;
    fec_ndb: string;
    ben_ndb: number;
    rnd_ndb: number;
    con_ndb: string;
    mon_ndb: number;
    ban_ndb: string;
    ref_ndb: string;
    pro_ndb: number;
    rtc_ndb?: number;
    tbf_ndb?: number;
    isl_ndb?: number;
    sub_ndb?: number;
    has_retention?: boolean; // UI specific flag
    // Campos joined
    nom_ben?: string;
    rif_ben?: string;
    num_rnd?: string;
    total_details?: number;
}
