import { DebitNoteItem } from "../types/debitNote"
import { SurrenderDetailsItem } from "../types/surrenderDetails"
import { OrderItem } from "../types/orders";
import { SurrenderItem } from "../types/surrender";

// Nota de Banco Patria: se contabiliza cuando la suma neta de sus detalles
// es exactamente igual al mon_ndb (positivos y negativos se compensan).
export const isPatriaNote = (note: { ban_ndb?: string } | null) =>
    note?.ban_ndb === "BANCO PATRIA";

export const validateDetailAmount = (
    newAmount: number,
    selectedNdb: DebitNoteItem | null,
    allDetails: SurrenderDetailsItem[],
    editingId?: number | string
) => {
    if (!selectedNdb) return { valid: false, remaining: 0, excess: false };

    // Para notas Banco Patria: no hay restricción por detalle individual.
    // Se valida solo al final (suma neta = mon_ndb).
    if (isPatriaNote(selectedNdb)) {
        return { valid: true, remaining: 0, excess: false };
    }

    const totalSpent = allDetails
        .filter((d) => d.cod_drn !== editingId)
        .reduce((acc, curr) => acc + Number(curr.mon_drn), 0);

    const hasRetention = selectedNdb.has_retention || Number(selectedNdb.sub_ndb) > 0;
    const baseAmount = hasRetention ? Number(selectedNdb.sub_ndb) : Number(selectedNdb.mon_ndb);
    const remaining = baseAmount - totalSpent;

    const round2 = (n: number) => Math.round(n * 100) / 100;
    return {
        valid: round2(newAmount) <= round2(remaining),
        remaining: Math.max(0, remaining),
        excess: round2(newAmount) > round2(remaining)
    }
}

export const validateDebitNoteAmount = (
    newAmount: number,
    selectedOpg: OrderItem | null,
    selectedRnd: SurrenderItem | null,
    allDebitNotes: DebitNoteItem[],
    allRenditions: SurrenderItem[],
    editingId?: number | string
) => {
    const orderAmount = Number(selectedOpg?.mon_opg ?? 0);
    if (!orderAmount || !selectedRnd) return { valid: false, remaining: 0, excess: false };

    // Ordenar las rendiciones cronológicamente por cod_rnd
    const sortedRnds = [...allRenditions].sort((a, b) => a.cod_rnd - b.cod_rnd);
    const currentIndex = sortedRnds.findIndex(r => r.cod_rnd === selectedRnd.cod_rnd);
    const sliceIndex = currentIndex !== -1 ? currentIndex : sortedRnds.length;

    // Rendiciones anteriores
    const previousRndIds = new Set(sortedRnds.slice(0, sliceIndex).map(r => r.cod_rnd));

    // Monto rendido en rendiciones anteriores (todas las notas de débito)
    const previousSpent = allDebitNotes
        .filter((note) => previousRndIds.has(note.rnd_ndb))
        .reduce((acc, curr) => acc + Number(curr.mon_ndb || 0), 0);

    // Reintegros en rendiciones anteriores
    const previousReintegros = sortedRnds
        .slice(0, sliceIndex)
        .reduce((acc, curr) => acc + Number(curr.rnt_rnd || 0), 0);

    // Reintegro de la rendición actual
    const currentReintegro = Number(selectedRnd.rnt_rnd || 0);

    // Monto máximo disponible para la rendición actual
    const maxAvailable = orderAmount - previousSpent + previousReintegros + currentReintegro;

    // Monto gastado en la rendición actual (excluyendo la nota que se edita, sumando todas)
    const currentSpent = allDebitNotes
        .filter((note) => note.rnd_ndb === selectedRnd.cod_rnd && note.cod_ndb !== editingId)
        .reduce((acc, curr) => acc + Number(curr.mon_ndb || 0), 0);

    const remaining = maxAvailable - currentSpent;
    const round2 = (n: number) => Math.round(n * 100) / 100;

    return {
        valid: round2(newAmount) <= round2(remaining),
        remaining: Math.max(0, remaining),
        excess: round2(newAmount) > round2(remaining)
    };
};
