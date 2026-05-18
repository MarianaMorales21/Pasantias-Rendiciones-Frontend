export interface DebitNoteItem {
    cod_ndb: number;
    num_ndb: string;
    fec_ndb: string;
    rif_ndb: string;
    rnd_ndb: number; // Cambio de ren_ndb a rnd_ndb según DDL
    con_ndb: string;
    mon_ndb: number;
    ban_ndb: string;
    ref_ndb: string;
    pro_ndb: number;
    // Campos joined
    nom_ben?: string;
    num_rnd?: string;
}
