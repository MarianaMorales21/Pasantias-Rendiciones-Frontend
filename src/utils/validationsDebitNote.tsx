import { DebitNoteItem } from "../types/debitNote"
import { SurrenderDetailsItem} from "../types/surrenderDetails"
import { OrderItem } from "../types/orders";
import { SurrenderItem } from "../types/surrender";

export const validateDetailAmount = (
    newAmount: number,
    selectedNdb: DebitNoteItem | null,
    allDetails: SurrenderDetailsItem[],
    editingId?: number | string
) => {
    if (!selectedNdb) return { valid: false, remaining: 0, excess: false };

    const totalSpent = allDetails 
        .filter((d) => d.cod_drn !== editingId)
        .reduce((acc, curr) => acc + Number(curr.mon_drn), 0);
    
    const remaining = Number(selectedNdb.mon_ndb) - totalSpent;

    return {
        valid: newAmount <= remaining,
        remaining: Math.max(0, remaining),
        excess: newAmount > remaining
    }
}

export const validateDebitNoteAmount = (
    newAmount: number,
    selectedOpg: OrderItem | null,
    selectedRnd: SurrenderItem | null,
    allDebitNotes: DebitNoteItem[],
    editingId?: number | string
) => {
    const orderAmount = Number(selectedOpg?.mon_opg ?? selectedRnd?.mon_opg ?? 0);
    if (!orderAmount) return { valid: false, remaining: 0, excess: false };

    const totalDebitNotes = allDebitNotes
        .filter((note) => note.cod_ndb !== editingId)
        .reduce((acc, curr) => acc + Number(curr.mon_ndb), 0);

    const remaining = orderAmount - totalDebitNotes;

    return {
        valid: newAmount <= remaining,
        remaining: Math.max(0, remaining),
        excess: newAmount > remaining
    };
};
