import { useState, useEffect } from "react";
import { surrenderService } from "../services/surrenderService";
import { debitNoteService } from "../services/debitNoteService";
import { surrenderDetailsService } from "../services/surrenderDetailsService";
import { departureService } from "../services/departureService";
import { beneficiaryService } from "../services/beneficiaryService";
import { programsService } from "../services/programsService";
import { orderService } from "../services/orderService";
import { stateService } from "../services/stateService";
import { SurrenderItem } from "../types/surrender";
import { DebitNoteItem } from "../types/debitNote";
import { SurrenderDetailsItem } from "../types/surrenderDetails";
import { departureItem } from "../types/departure";
import { BeneficiaryItem } from "../types/beneficiary";
import { ProgramsItem } from "../types/programs";
import { OrderItem } from "../types/orders";
import { StateItem } from "../types/state";
import { isApiError } from "../helpers/helpHttp";
import { validateDebitNoteAmount, validateDetailAmount } from "../utils/validationsDebitNote"

// ─── Formularios vacíos ────────────────────────────────────────────────────────
export const emptyRndForm: SurrenderItem = {
    cod_rnd: 0,
    num_rnd: "",
    opg_rnd: 0,
    fec_rnd: new Date().toISOString().split("T")[0],
    prd_rnd: "",
    avs_rnd: "",
    sta_rnd: 1,
};

export const emptyNdbForm: DebitNoteItem = {
    cod_ndb: 0,
    num_ndb: "",
    fec_ndb: new Date().toISOString().split("T")[0],
    rif_ndb: "",
    rnd_ndb: 0,
    con_ndb: "",
    mon_ndb: 0,
    ban_ndb: "",
    ref_ndb: "",
    pro_ndb: 0,
};

export const emptyDrnForm: SurrenderDetailsItem = {
    cod_drn: 0,
    cab_drn: 0,
    par_drn: 0,
    des_drn: "",
    mon_drn: 0,
    cod_pro: 0,
    sta_drn: 1,
};

export function useSurrender() {
    // ── Datos principales ──────────────────────────────────────────────────────
    const [renditions, setRenditions] = useState<SurrenderItem[]>([]);
    const [debitNotes, setDebitNotes] = useState<DebitNoteItem[]>([]);
    const [opgDebitNotes, setOpgDebitNotes] = useState<DebitNoteItem[]>([]);
    const [details, setDetails] = useState<SurrenderDetailsItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error] = useState<string | null>(null);

    // ── Datos auxiliares ───────────────────────────────────────────────────────
    const [beneficiaries, setBeneficiaries] = useState<BeneficiaryItem[]>([]);
    const [programs, setPrograms] = useState<ProgramsItem[]>([]);
    const [partidas, setPartidas] = useState<departureItem[]>([]);
    const [states, setStates] = useState<StateItem[]>([]);
    const [orders, setOrders] = useState<OrderItem[]>([]);

    // ── Selección jerárquica ───────────────────────────────────────────────────
    const [selectedOpg, setSelectedOpg] = useState<OrderItem | null>(null);
    const [selectedRnd, setSelectedRnd] = useState<SurrenderItem | null>(null);
    const [selectedNdb, setSelectedNdb] = useState<DebitNoteItem | null>(null);
    const [selectedDrn, setSelectedDrn] = useState<SurrenderDetailsItem | null>(null);

    // ── Estado UI: Rendiciones ─────────────────────────────────────────────────
    const [searchOpg, setSearchOpg] = useState("");
    const [rndFormData, setRndFormData] = useState<SurrenderItem>(emptyRndForm);
    const [isRndCreateOpen, setIsRndCreateOpen] = useState(false);
    const [isRndEditOpen, setIsRndEditOpen] = useState(false);
    const [isRndDeleteOpen, setIsRndDeleteOpen] = useState(false);

    // ── Estado UI: Notas de Débito ─────────────────────────────────────────────
    const [ndbFormData, setNdbFormData] = useState<DebitNoteItem>(emptyNdbForm);
    const [isNdbCreateOpen, setIsNdbCreateOpen] = useState(false);
    const [isNdbEditOpen, setIsNdbEditOpen] = useState(false);
    const [isNdbDeleteOpen, setIsNdbDeleteOpen] = useState(false);

    // ── Estado UI: Detalles ────────────────────────────────────────────────────
    const [drnFormData, setDrnFormData] = useState<SurrenderDetailsItem>(emptyDrnForm);
    const [isDrnCreateOpen, setIsDrnCreateOpen] = useState(false);
    const [isDrnEditOpen, setIsDrnEditOpen] = useState(false);
    const [isDrnDeleteOpen, setIsDrnDeleteOpen] = useState(false);

    // ─── Fetch de datos ────────────────────────────────────────────────────────
    const fetchDebitNotesByOpgRenditions = async (renditionsList: SurrenderItem[]) => {
        try {
            const responses = await Promise.all(
                renditionsList.map((rendition) => debitNoteService.getByRendition(rendition.cod_rnd))
            );

            const notes = responses.flatMap((res) => {
                if (isApiError(res)) return [];
                return Array.isArray(res) ? res : [];
            });

            setOpgDebitNotes(notes);
        } catch (err) {
            console.error(err);
            setOpgDebitNotes([]);
        }
    };

    const fetchRenditionsByOpg = async (opg_rnd: number) => {
        setIsLoading(true);
        try {
            const res = await surrenderService.getByOpg(opg_rnd);
            if (isApiError(res)) throw new Error(res.statusText);
            const renditionsList = Array.isArray(res) ? res : [];
            setRenditions(renditionsList);
            await fetchDebitNotesByOpgRenditions(renditionsList);
        } catch (err) {
            console.error(err);
            setOpgDebitNotes([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDebitNotes = async (cod_rnd: number) => {
        try {
            const res = await debitNoteService.getByRendition(cod_rnd);
            if (isApiError(res)) throw new Error(res.statusText);
            setDebitNotes(Array.isArray(res) ? res : []);
        } catch (err) { console.error(err); }
    };

    const fetchDetails = async (cod_ndb: number) => {
        try {
            const res = await surrenderDetailsService.getByDebitNote(cod_ndb);
            if (isApiError(res)) throw new Error(res.statusText);
            setDetails(Array.isArray(res) ? res : []);
        } catch (err) { console.error(err); }
    };

    const fetchAuxiliary = async () => {
        try {
            const [benRes, proRes, rpdRes, ordRes, staRes] = await Promise.all([
                beneficiaryService.getAll(),
                programsService.getAll(),
                departureService.getAll(),
                orderService.getAll(),
                stateService.getAll(),
            ]);
            if (!isApiError(benRes)) setBeneficiaries(Array.isArray(benRes) ? benRes : []);
            if (!isApiError(proRes)) setPrograms(Array.isArray(proRes) ? proRes : []);
            if (!isApiError(rpdRes)) setPartidas(Array.isArray(rpdRes) ? rpdRes : []);
            if (!isApiError(ordRes)) setOrders(Array.isArray(ordRes) ? ordRes : []);
            if (!isApiError(staRes)) setStates(Array.isArray(staRes) ? staRes : []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchAuxiliary();
    }, []);

    // Efecto: Cambio de OPG
    useEffect(() => {
        if (selectedOpg) {
            setOpgDebitNotes([]);
            fetchRenditionsByOpg(selectedOpg.cod_opg);
            setSelectedRnd(null);
            setDebitNotes([]);
            setSelectedNdb(null);
            setDetails([]);
        } else {
            setRenditions([]);
            setOpgDebitNotes([]);
        }
    }, [selectedOpg]);

    // Efecto: Cambio de Rendición
    useEffect(() => {
        if (selectedRnd) {
            fetchDebitNotes(selectedRnd.cod_rnd);
            setSelectedNdb(null);
            setDetails([]);
        } else {
            setDebitNotes([]);
        }
    }, [selectedRnd]);

    // Efecto: Cambio de Nota de Débito
    useEffect(() => {
        if (selectedNdb) fetchDetails(selectedNdb.cod_ndb);
        else setDetails([]);
    }, [selectedNdb]);

    // CRUD Rendiciones
    const handleRndCreate = async () => {
        setIsLoading(true);
        try {
            const res = await surrenderService.create(rndFormData);
            if (isApiError(res)) throw new Error(res.statusText);
            if (selectedOpg) await fetchRenditionsByOpg(selectedOpg.cod_opg);
            setIsRndCreateOpen(false);
        } catch (err) { alert(err instanceof Error ? err.message : String(err)); } finally { setIsLoading(false); }
    };

    const handleRndUpdate = async () => {
        if (!selectedRnd) return;
        setIsLoading(true);
        try {
            const res = await surrenderService.update(String(selectedRnd.cod_rnd), rndFormData);
            if (isApiError(res)) throw new Error(res.statusText);
            if (selectedOpg) await fetchRenditionsByOpg(selectedOpg.cod_opg);
            setIsRndEditOpen(false);
        } catch (err) { alert(err instanceof Error ? err.message : String(err)); } finally { setIsLoading(false); }
    };

    const handleRndDelete = async () => {
        if (!selectedRnd) return;
        setIsLoading(true);
        try {
            await surrenderService.delete(String(selectedRnd.cod_rnd));
            if (selectedOpg) await fetchRenditionsByOpg(selectedOpg.cod_opg);
            setSelectedRnd(null);
            setIsRndDeleteOpen(false);
        } catch (err) { alert(err instanceof Error ? err.message : String(err)); } finally { setIsLoading(false); }
    };

    // CRUD Notas
    const handleNdbCreate = async () => {
        const { valid, remaining } = validateDebitNoteAmount(
            ndbFormData.mon_ndb,
            selectedOpg,
            selectedRnd,
            opgDebitNotes
        );
        if (!valid) {
            alert(`No puedes exceder el monto de la orden de pago. Disponible: Bs. ${remaining}`);
            return;
        }

        setIsLoading(true);
        try {
            const res = await debitNoteService.create(ndbFormData);
            if (isApiError(res)) throw new Error(res.statusText);
            if (selectedRnd) await fetchDebitNotes(selectedRnd.cod_rnd);
            if (selectedOpg) await fetchRenditionsByOpg(selectedOpg.cod_opg);
            setIsNdbCreateOpen(false);
        } catch (err) { alert(err instanceof Error ? err.message : String(err)); } finally { setIsLoading(false); }
    };

    const handleNdbUpdate = async () => {
        if (!selectedNdb) return;
        const { valid, remaining } = validateDebitNoteAmount(
            ndbFormData.mon_ndb,
            selectedOpg,
            selectedRnd,
            opgDebitNotes,
            selectedNdb.cod_ndb
        );
        if (!valid) {
            alert(`No puedes exceder el monto de la orden de pago. Disponible: Bs. ${remaining}`);
            return;
        }

        setIsLoading(true);
        try {
            const res = await debitNoteService.update(String(selectedNdb.cod_ndb), ndbFormData);
            if (isApiError(res)) throw new Error(res.statusText);
            if (selectedRnd) await fetchDebitNotes(selectedRnd.cod_rnd);
            if (selectedOpg) await fetchRenditionsByOpg(selectedOpg.cod_opg);
            setIsNdbEditOpen(false);
        } catch (err) { alert(err instanceof Error ? err.message : String(err)); } finally { setIsLoading(false); }
    };

    const handleNdbDelete = async () => {
        if (!selectedNdb) return;

        // 1. VALIDACIÓN PREVENTIVA: 
        // Si el array de detalles (que ya tienes en el hook) tiene elementos, detenemos el proceso.
        if (details && details.length > 0) {
            alert(`No se puede eliminar la Nota de Débito #${selectedNdb.num_ndb} porque tiene ${details.length} detalles de gasto asociados. Por favor, elimine los detalles primero.`);
            return;
        }

        setIsLoading(true);
        try {
            await debitNoteService.delete(String(selectedNdb.cod_ndb));

            // Refrescar la lista si hay una rendición seleccionada
            if (selectedRnd) await fetchDebitNotes(selectedRnd.cod_rnd);
            if (selectedOpg) await fetchRenditionsByOpg(selectedOpg.cod_opg);

            // Limpiar selección y cerrar modal
            setSelectedNdb(null);
            setIsNdbDeleteOpen(false);
        } catch (err) {
            // En caso de que el backend devuelva el error de integridad, lo manejamos aquí
            alert("Error al eliminar: Asegúrese de que no existan registros vinculados en otras tablas.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // CRUD Detalles
    const handleDrnCreate = async () => {
        const { valid, remaining } = validateDetailAmount(
            drnFormData.mon_drn,
            selectedNdb,
            details
        );
        if (!valid) {
            alert(`No puedes exceder el monto total. Disponible: Bs. ${remaining}`);
            return; // No se ejecuta el guardado
        }
        setIsLoading(true);
        try {
            const res = await surrenderDetailsService.create(drnFormData);
            if (isApiError(res)) throw new Error(res.statusText);
            if (selectedNdb) await fetchDetails(selectedNdb.cod_ndb);
            setIsDrnCreateOpen(false);
        } catch (err) { alert(err instanceof Error ? err.message : String(err)); } finally { setIsLoading(false); }
    };

    const handleDrnUpdate = async () => {
        if (!selectedDrn) return;
        const { valid, remaining } = validateDetailAmount(
            drnFormData.mon_drn,
            selectedNdb,
            details,
            selectedDrn.cod_drn
        );
        if (!valid) {
            alert(`No puedes exceder el monto total. Disponible: Bs. ${remaining}`);
            return; // No se ejecuta el guardado
        }
        setIsLoading(true);
        try {
            const res = await surrenderDetailsService.update(String(selectedDrn.cod_drn), drnFormData);
            if (isApiError(res)) throw new Error(res.statusText);
            if (selectedNdb) await fetchDetails(selectedNdb.cod_ndb);
            setIsDrnEditOpen(false);
        } catch (err) { alert(err instanceof Error ? err.message : String(err)); } finally { setIsLoading(false); }
    };

    const handleDrnDelete = async () => {
        if (!selectedDrn) return;
        setIsLoading(true);
        try {
            await surrenderDetailsService.delete(String(selectedDrn.cod_drn));
            if (selectedNdb) await fetchDetails(selectedNdb.cod_ndb);
            setIsDrnDeleteOpen(false);
        } catch (err) { alert(err instanceof Error ? err.message : String(err)); } finally { setIsLoading(false); }
    };

    return {
        renditions, debitNotes, opgDebitNotes, details, beneficiaries, programs, partidas, orders, states,
        isLoading, error,
        selectedOpg, setSelectedOpg,
        selectedRnd, setSelectedRnd,
        selectedNdb, setSelectedNdb,
        selectedDrn, setSelectedDrn,
        searchOpg, setSearchOpg,
        rndFormData, setRndFormData, isRndCreateOpen, setIsRndCreateOpen, isRndEditOpen, setIsRndEditOpen, isRndDeleteOpen, setIsRndDeleteOpen, handleRndCreate, handleRndUpdate, handleRndDelete,
        ndbFormData, setNdbFormData, isNdbCreateOpen, setIsNdbCreateOpen, isNdbEditOpen, setIsNdbEditOpen, isNdbDeleteOpen, setIsNdbDeleteOpen, handleNdbCreate, handleNdbUpdate, handleNdbDelete,
        drnFormData, setDrnFormData, isDrnCreateOpen, setIsDrnCreateOpen, isDrnEditOpen, setIsDrnEditOpen, isDrnDeleteOpen, setIsDrnDeleteOpen, handleDrnCreate, handleDrnUpdate, handleDrnDelete,
    };
}
