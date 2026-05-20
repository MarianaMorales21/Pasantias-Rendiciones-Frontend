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

import { isApiError, ApiError } from "../helpers/helpHttp";

import {
    validateDebitNoteAmount,
    validateDetailAmount
} from "../utils/validationsDebitNote";

// ─────────────────────────────────────────────────────────────
// FORMULARIOS VACÍOS
// ─────────────────────────────────────────────────────────────

export const emptyRndForm: SurrenderItem = {
    cod_rnd: 0,
    num_rnd: "",
    opg_rnd: 0,
    fec_rnd: new Date().toISOString().split("T")[0],
    prd_rnd: "",
    avs_rnd: "",
    sta_rnd: 1,
    rnt_rnd: null,
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
    rtc_ndb: 0,
    tbf_ndb: 0,
    isl_ndb: 0,
    sub_ndb: 0,
    has_retention: false,
};

export const emptyDrnForm: SurrenderDetailsItem = {
    cod_drn: 0,
    cab_drn: 0,
    par_drn: null,
    des_drn: "",
    mon_drn: 0,
    cod_pro: 0,
    sta_drn: 1,
};

export function useSurrender() {

    // ─────────────────────────────────────────────────────────
    // ESTADOS PRINCIPALES
    // ─────────────────────────────────────────────────────────

    const [renditions, setRenditions] = useState<SurrenderItem[]>([]);
    const [debitNotes, setDebitNotes] = useState<DebitNoteItem[]>([]);
    const [opgDebitNotes, setOpgDebitNotes] = useState<DebitNoteItem[]>([]);
    const [details, setDetails] = useState<SurrenderDetailsItem[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error] = useState<string | null>(null);
    const [warningMessage, setWarningMessage] = useState("");
    const [isWarningOpen, setIsWarningOpen] = useState(false);

    // ─────────────────────────────────────────────────────────
    // AUXILIARES
    // ─────────────────────────────────────────────────────────

    const [beneficiaries, setBeneficiaries] = useState<BeneficiaryItem[]>([]);
    const [programs, setPrograms] = useState<ProgramsItem[]>([]);
    const [partidas, setPartidas] = useState<departureItem[]>([]);
    const [states, setStates] = useState<StateItem[]>([]);
    const [orders, setOrders] = useState<OrderItem[]>([]);

    // ─────────────────────────────────────────────────────────
    // SELECCIONES
    // ─────────────────────────────────────────────────────────

    const [selectedOpg, setSelectedOpg] = useState<OrderItem | null>(null);
    const [selectedRnd, setSelectedRnd] = useState<SurrenderItem | null>(null);
    const [selectedNdb, setSelectedNdb] = useState<DebitNoteItem | null>(null);
    const [selectedDrn, setSelectedDrn] = useState<SurrenderDetailsItem | null>(null);

    // ─────────────────────────────────────────────────────────
    // UI RENDICIONES
    // ─────────────────────────────────────────────────────────

    const [searchOpg, setSearchOpg] = useState("");
    const [rndFormData, setRndFormData] = useState<SurrenderItem>(emptyRndForm);

    const [isRndCreateOpen, setIsRndCreateOpen] = useState(false);
    const [isRndEditOpen, setIsRndEditOpen] = useState(false);
    const [isRndDeleteOpen, setIsRndDeleteOpen] = useState(false);

    // ─────────────────────────────────────────────────────────
    // UI NOTAS
    // ─────────────────────────────────────────────────────────

    const [ndbFormData, setNdbFormData] = useState<DebitNoteItem>(emptyNdbForm);

    const [isNdbCreateOpen, setIsNdbCreateOpen] = useState(false);
    const [isNdbEditOpen, setIsNdbEditOpen] = useState(false);
    const [isNdbDeleteOpen, setIsNdbDeleteOpen] = useState(false);

    // ─────────────────────────────────────────────────────────
    // UI DETALLES
    // ─────────────────────────────────────────────────────────

    const [drnFormData, setDrnFormData] = useState<SurrenderDetailsItem>(emptyDrnForm);

    const [isDrnCreateOpen, setIsDrnCreateOpen] = useState(false);
    const [isDrnEditOpen, setIsDrnEditOpen] = useState(false);
    const [isDrnDeleteOpen, setIsDrnDeleteOpen] = useState(false);

    // ─────────────────────────────────────────────────────────
    // MODAL DE SOLO LECTURA
    // ─────────────────────────────────────────────────────────

    const [showReadonlyModal, setShowReadonlyModal] = useState(false);

    // ─────────────────────────────────────────────────────────
    // CÁLCULOS FINANCIEROS
    // ─────────────────────────────────────────────────────────

    // Total rendido = suma de todas las notas de la OPG
    const totalRendered = opgDebitNotes.reduce(
        (acc, note) => acc + Number(note.mon_ndb || 0),
        0
    );

    // Total de reintegros de la OPG
    const totalReintegros = renditions.reduce(
        (acc, curr) => acc + Number(curr.rnt_rnd || 0),
        0
    );

    // Monto restante de la OPG
    const remainingAmount = selectedOpg
        ? Math.max(Number(selectedOpg.mon_opg || 0) - (totalRendered - totalReintegros), 0)
        : 0;



    // ¿La nota de débito seleccionada tiene detalles?
    const isNdbAmountLocked = (details?.length ?? 0) > 0;

    // ¿La OPG seleccionada ya tiene rendiciones con notas de débito? → monto OPG no editable
    const isOpgAmountLocked = opgDebitNotes.length > 0;



    // ─────────────────────────────────────────────────────────
    // FUNCIONES AUXILIARES INTERNAS
    // ─────────────────────────────────────────────────────────

    const getTotalRenderedByOpg = () => {
        return opgDebitNotes.reduce(
            (acc, note) => acc + Number(note.mon_ndb || 0),
            0
        );
    };

    const getRemainingAmount = () => {
        if (!selectedOpg) return 0;
        const totalRend = getTotalRenderedByOpg();
        const totalReintegros = renditions.reduce((acc, curr) => acc + Number(curr.rnt_rnd || 0), 0);
        const remaining = Number(selectedOpg.mon_opg || 0) - (totalRend - totalReintegros);
        return remaining < 1 ? 0 : remaining;
    };

    const isFullyRendered = () => getRemainingAmount() === 0;

    // ─────────────────────────────────────────────────────────
    // FETCHES
    // ─────────────────────────────────────────────────────────

    const fetchDebitNotesByOpgRenditions = async (
        renditionsList: SurrenderItem[]
    ) => {
        try {
            const responses = await Promise.all(
                renditionsList.map((rendition) =>
                    debitNoteService.getByRendition(rendition.cod_rnd)
                )
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
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDetails = async (cod_ndb: number) => {
        try {
            const res = await surrenderDetailsService.getByDebitNote(cod_ndb);
            if (isApiError(res)) throw new Error(res.statusText);
            setDetails(Array.isArray(res) ? res : []);
        } catch (err) {
            console.error(err);
        }
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
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchAuxiliary(); }, []);

    // ─────────────────────────────────────────────────────────
    // EFECTOS DE SELECCIÓN
    // ─────────────────────────────────────────────────────────

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOpg]);

    useEffect(() => {
        if (selectedRnd) {
            fetchDebitNotes(selectedRnd.cod_rnd);
            setSelectedNdb(null);
            setDetails([]);
        } else {
            setDebitNotes([]);
        }
    }, [selectedRnd]);

    useEffect(() => {
        if (selectedNdb) fetchDetails(selectedNdb.cod_ndb);
        else setDetails([]);
    }, [selectedNdb]);

    // ─────────────────────────────────────────────────────────
    // CRUD RENDICIONES
    // ─────────────────────────────────────────────────────────

    const handleRndCreate = async () => {
        if (isFullyRendered()) {
            setIsRndCreateOpen(false);
            setWarningMessage("La Orden de Pago ya fue rendida al 100%. No se pueden agregar más rendiciones.");
            setIsWarningOpen(true);
            return;
        }

        if (!rndFormData.num_rnd || !rndFormData.opg_rnd || !rndFormData.fec_rnd || !rndFormData.prd_rnd) {
            alert("Por favor, llene todos los campos requeridos.");
            return;
        }

        setIsLoading(true);
        try {
            const body = {
                ...rndFormData,
                rnt_rnd: rndFormData.rnt_rnd === "" || rndFormData.rnt_rnd === null || rndFormData.rnt_rnd === undefined
                    ? null
                    : Number(rndFormData.rnt_rnd)
            };
            const res = await surrenderService.create(body);

            if (isApiError(res)) {
                const msg = (res as ApiError).message || res.statusText || "Error desconocido";
                setIsRndCreateOpen(false);
                setWarningMessage(msg);
                setIsWarningOpen(true);
                return;
            }

            if (selectedOpg) await fetchRenditionsByOpg(selectedOpg.cod_opg);
            setIsRndCreateOpen(false);
        } catch (err) {
            setIsRndCreateOpen(false);
            setWarningMessage(err instanceof Error ? err.message : String(err));
            setIsWarningOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRndUpdate = async () => {
        if (!selectedRnd) return;

        if (!rndFormData.num_rnd || !rndFormData.fec_rnd || !rndFormData.prd_rnd) {
            alert("Por favor, llene todos los campos requeridos.");
            return;
        }

        setIsLoading(true);
        try {
            const body = {
                ...rndFormData,
                rnt_rnd: rndFormData.rnt_rnd === "" || rndFormData.rnt_rnd === null || rndFormData.rnt_rnd === undefined
                    ? null
                    : Number(rndFormData.rnt_rnd)
            };
            const res = await surrenderService.update(String(selectedRnd.cod_rnd), body);

            if (isApiError(res)) {
                const msg = (res as ApiError).message || res.statusText || "Error desconocido";
                setIsRndEditOpen(false);
                setWarningMessage(msg);
                setIsWarningOpen(true);
                return;
            }

            if (selectedOpg) await fetchRenditionsByOpg(selectedOpg.cod_opg);
            setIsRndEditOpen(false);
        } catch (err) {
            setIsRndEditOpen(false);
            setWarningMessage(err instanceof Error ? err.message : String(err));
            setIsWarningOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRndDelete = async () => {
        if (!selectedRnd) return;

        const renditionNotes = debitNotes.filter(
            (note) => note.rnd_ndb === selectedRnd.cod_rnd
        );

        if (renditionNotes.length > 0) {
            setIsRndDeleteOpen(false);
            setWarningMessage(`No se puede eliminar la rendición porque tiene ${renditionNotes.length} notas de débito asociadas. Elimine primero las notas.`);
            setIsWarningOpen(true);
            return;
        }

        setIsLoading(true);
        try {
            const res = await surrenderService.delete(String(selectedRnd.cod_rnd));

            if (isApiError(res)) {
                const msg = (res as ApiError).message || res.statusText || "Error desconocido";
                setIsRndDeleteOpen(false);
                setWarningMessage(msg);
                setIsWarningOpen(true);
                return;
            }

            if (selectedOpg) await fetchRenditionsByOpg(selectedOpg.cod_opg);
            setSelectedRnd(null);
            setIsRndDeleteOpen(false);
        } catch (err) {
            setIsRndDeleteOpen(false);
            setWarningMessage(err instanceof Error ? err.message : String(err));
            setIsWarningOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────
    // CRUD NOTAS DE DÉBITO
    // ─────────────────────────────────────────────────────────

    const handleNdbCreate = async () => {
        if (isFullyRendered()) {
            setIsNdbCreateOpen(false);
            setWarningMessage("La Orden de Pago ya fue rendida al 100%. No se pueden agregar más notas de débito.");
            setIsWarningOpen(true);
            return;
        }

        if (!ndbFormData.num_ndb || !ndbFormData.fec_ndb || !ndbFormData.rif_ndb || !ndbFormData.pro_ndb || !ndbFormData.mon_ndb) {
            alert("Por favor, llene todos los campos requeridos.");
            return;
        }

        const { valid, remaining } = validateDebitNoteAmount(
            ndbFormData.mon_ndb,
            selectedOpg,
            selectedRnd,
            opgDebitNotes,
            renditions
        );

        if (!valid) {
            setIsNdbCreateOpen(false);
            setWarningMessage(`No puedes exceder el monto de la orden de pago. Disponible: Bs. ${remaining}`);
            setIsWarningOpen(true);
            return;
        }

        setIsLoading(true);
        try {
            const res = await debitNoteService.create(ndbFormData);

            if (isApiError(res)) {
                const msg = (res as ApiError).message || res.statusText || "Error desconocido";
                setIsNdbCreateOpen(false);
                setWarningMessage(msg);
                setIsWarningOpen(true);
                return;
            }

            if (selectedRnd) await fetchDebitNotes(selectedRnd.cod_rnd);
            if (selectedOpg) await fetchRenditionsByOpg(selectedOpg.cod_opg);
            setIsNdbCreateOpen(false);
        } catch (err) {
            setIsNdbCreateOpen(false);
            setWarningMessage(err instanceof Error ? err.message : String(err));
            setIsWarningOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNdbUpdate = async () => {
        if (!selectedNdb) return;

        // Si la nota ya tiene detalles, el monto no puede ser menor a la suma de sus detalles
        const detailsSum = details.reduce((acc, curr) => acc + Number(curr.mon_drn || 0), 0);
        if (Number(ndbFormData.mon_ndb) < detailsSum) {
            setIsNdbEditOpen(false);
            setWarningMessage(`No se puede reducir el monto de la nota de débito por debajo de la suma de sus detalles (Bs. ${detailsSum.toLocaleString("es-VE", { minimumFractionDigits: 2 })}).`);
            setIsWarningOpen(true);
            return;
        }

        if (!ndbFormData.num_ndb || !ndbFormData.fec_ndb || !ndbFormData.rif_ndb || !ndbFormData.pro_ndb || !ndbFormData.mon_ndb) {
            alert("Por favor, llene todos los campos requeridos.");
            return;
        }

        const { valid, remaining } = validateDebitNoteAmount(
            ndbFormData.mon_ndb,
            selectedOpg,
            selectedRnd,
            opgDebitNotes,
            renditions,
            selectedNdb.cod_ndb
        );

        if (!valid) {
            setIsNdbEditOpen(false);
            setWarningMessage(`No puedes exceder el monto de la orden de pago. Disponible: Bs. ${remaining}`);
            setIsWarningOpen(true);
            return;
        }

        setIsLoading(true);
        try {
            const res = await debitNoteService.update(String(selectedNdb.cod_ndb), ndbFormData);
            if (isApiError(res)) throw new Error(res.statusText);

            if (selectedRnd) await fetchDebitNotes(selectedRnd.cod_rnd);
            if (selectedOpg) await fetchRenditionsByOpg(selectedOpg.cod_opg);
            setIsNdbEditOpen(false);
        } catch (err) {
            setIsNdbEditOpen(false);
            setWarningMessage(err instanceof Error ? err.message : String(err));
            setIsWarningOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNdbDelete = async () => {
        if (!selectedNdb) return;

        if (details && details.length > 0) {
            setIsNdbDeleteOpen(false);
            setWarningMessage(`No se puede eliminar la Nota de Débito #${selectedNdb.num_ndb} porque tiene ${details.length} detalles asociados. Elimine primero los detalles.`);
            setIsWarningOpen(true);
            return;
        }

        setIsLoading(true);
        try {
            await debitNoteService.delete(String(selectedNdb.cod_ndb));

            if (selectedRnd) await fetchDebitNotes(selectedRnd.cod_rnd);
            if (selectedOpg) await fetchRenditionsByOpg(selectedOpg.cod_opg);

            setSelectedNdb(null);
            setIsNdbDeleteOpen(false);
        } catch (err) {
            setIsNdbDeleteOpen(false);
            setWarningMessage("Error al eliminar: existen registros vinculados.");
            setIsWarningOpen(true);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────
    // CRUD DETALLES
    // ─────────────────────────────────────────────────────────

    const handleDrnCreate = async () => {

        if (!drnFormData.mon_drn) {
            alert("Por favor, ingrese el monto.");
            return;
        }

        const { valid, remaining } = validateDetailAmount(
            drnFormData.mon_drn,
            selectedNdb,
            details
        );

        if (!valid) {
            setIsDrnCreateOpen(false);
            setWarningMessage(`No puedes exceder el monto total de la nota de débito. Disponible: Bs. ${remaining}`);
            setIsWarningOpen(true);
            return;
        }

        setIsLoading(true);
        try {
            const res = await surrenderDetailsService.create(drnFormData);
            if (isApiError(res)) throw new Error(res.statusText);

            if (selectedNdb) await fetchDetails(selectedNdb.cod_ndb);
            setIsDrnCreateOpen(false);
        } catch (err) {
            setIsDrnCreateOpen(false);
            setWarningMessage(err instanceof Error ? err.message : String(err));
            setIsWarningOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrnUpdate = async () => {
        if (!selectedDrn) return;

        if (!drnFormData.mon_drn) {
            alert("Por favor, ingrese el monto.");
            return;
        }

        const { valid, remaining } = validateDetailAmount(
            drnFormData.mon_drn,
            selectedNdb,
            details,
            drnFormData.cod_drn
        );

        if (!valid) {
            setIsDrnEditOpen(false);
            setWarningMessage(`No puedes exceder el monto total de la nota de débito. Disponible: Bs. ${remaining}`);
            setIsWarningOpen(true);
            return;
        }

        setIsLoading(true);
        try {
            const res = await surrenderDetailsService.update(String(selectedDrn.cod_drn), drnFormData);
            if (isApiError(res)) throw new Error(res.statusText);

            if (selectedNdb) await fetchDetails(selectedNdb.cod_ndb);
            setIsDrnEditOpen(false);
        } catch (err) {
            setIsDrnEditOpen(false);
            setWarningMessage(err instanceof Error ? err.message : String(err));
            setIsWarningOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrnDelete = async () => {
        if (!selectedDrn) return;

        setIsLoading(true);
        try {
            const res = await surrenderDetailsService.delete(String(selectedDrn.cod_drn));
            if (isApiError(res)) throw new Error(res.statusText);

            if (selectedNdb) await fetchDetails(selectedNdb.cod_ndb);
            setSelectedDrn(null);
            setIsDrnDeleteOpen(false);
        } catch (err) {
            setIsDrnDeleteOpen(false);
            setWarningMessage(err instanceof Error ? err.message : String(err));
            setIsWarningOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────
    // RETURN
    // ─────────────────────────────────────────────────────────

    return {

        renditions,
        debitNotes,
        opgDebitNotes,
        details,

        beneficiaries,
        programs,
        partidas,
        orders,
        states,

        isLoading,
        error,

        selectedOpg,
        setSelectedOpg,

        selectedRnd,
        setSelectedRnd,

        selectedNdb,
        setSelectedNdb,

        selectedDrn,
        setSelectedDrn,

        searchOpg,
        setSearchOpg,

        rndFormData,
        setRndFormData,

        isRndCreateOpen,
        setIsRndCreateOpen,

        isRndEditOpen,
        setIsRndEditOpen,

        isRndDeleteOpen,
        setIsRndDeleteOpen,

        handleRndCreate,
        handleRndUpdate,
        handleRndDelete,

        ndbFormData,
        setNdbFormData,

        isNdbCreateOpen,
        setIsNdbCreateOpen,

        isNdbEditOpen,
        setIsNdbEditOpen,

        isNdbDeleteOpen,
        setIsNdbDeleteOpen,

        handleNdbCreate,
        handleNdbUpdate,
        handleNdbDelete,

        drnFormData,
        setDrnFormData,

        isDrnCreateOpen,
        setIsDrnCreateOpen,

        isDrnEditOpen,
        setIsDrnEditOpen,

        isDrnDeleteOpen,
        setIsDrnDeleteOpen,

        handleDrnCreate,
        handleDrnUpdate,
        handleDrnDelete,

        // ── Readonly / validaciones financieras ──
        showReadonlyModal,
        setShowReadonlyModal,
        remainingAmount,
        totalRendered,
        isNdbAmountLocked,
        isOpgAmountLocked,

        // ── Warning modal ──
        warningMessage,
        isWarningOpen,
        setIsWarningOpen,

    };
}