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
    validateDetailAmount,
    isPatriaNote
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
    ben_ndb: 0,
    rnd_ndb: 0,
    con_ndb: "",
    mon_ndb: 0,
    ban_ndb: "",
    ref_ndb: "",
    pro_ndb: 0,
    rtc_ndb: undefined,
    tbf_ndb: undefined,
    isl_ndb: undefined,
    sub_ndb: undefined,
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
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const clearFieldErrors = () => setFieldErrors({});

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

    // Total rendido = suma de mon_ndb de notas contabilizadas:
    // - Normales: total_details >= mon_ndb
    // - Banco Patria: suma neta de detalles == mon_ndb (neto exacto)
    const round2 = (n: number) => Math.round(n * 100) / 100;
    const totalRendered = opgDebitNotes.reduce(
        (acc, note) => {
            const isPatria = isPatriaNote(note);
            const monNdb = Number(note.mon_ndb || 0);
            const totalDet = Number(note.total_details ?? 0);
            const accountable = isPatria
                ? round2(totalDet) === round2(monNdb)
                : totalDet >= monNdb;
            return acc + (accountable ? monNdb : 0);
        },
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

        const rndErrors: Record<string, string> = {};
        if (!rndFormData.num_rnd) rndErrors.rnd_num_rnd = "Este campo es requerido";
        if (!rndFormData.opg_rnd) rndErrors.rnd_opg_rnd = "Este campo es requerido";
        if (!rndFormData.fec_rnd) rndErrors.rnd_fec_rnd = "Este campo es requerido";
        if (!rndFormData.prd_rnd) rndErrors.rnd_prd_rnd = "Este campo es requerido";
        if (Object.keys(rndErrors).length > 0) {
            setFieldErrors(rndErrors);
            return;
        }

        // Validar que la primera rendición de la OPG no tenga reintegro
        const rndsDeEstaOpg = renditions.filter(r => Number(r.opg_rnd) === Number(rndFormData.opg_rnd));
        if (rndsDeEstaOpg.length === 0 && rndFormData.rnt_rnd && Number(rndFormData.rnt_rnd) > 0) {
            setIsRndCreateOpen(false);
            setWarningMessage("La primera rendición de una Orden de Pago no puede tener reintegro.");
            setIsWarningOpen(true);
            return;
        }

        // Validar que el reintegro no sea mayor al total de la rendición anterior
        if (rndFormData.rnt_rnd && Number(rndFormData.rnt_rnd) > 0) {
            const currentNum = parseInt(rndFormData.num_rnd);
            if (currentNum > 1) {
                const previousNumStr = String(currentNum - 1).padStart(2, "0");
                const previousRnd = renditions.find(r => r.num_rnd === previousNumStr);
                if (previousRnd) {
                    const previousNotes = opgDebitNotes.filter(n => Number(n.rnd_ndb) === Number(previousRnd.cod_rnd));
                    const previousTotal = previousNotes.reduce((acc, note) => acc + Number(note.mon_ndb || 0), 0);
                    if (Number(rndFormData.rnt_rnd) > previousTotal) {
                        setIsRndCreateOpen(false);
                        setWarningMessage(`El reintegro no puede ser mayor al total de la rendición anterior (Bs. ${previousTotal.toLocaleString("es-VE", { minimumFractionDigits: 2 })}).`);
                        setIsWarningOpen(true);
                        return;
                    }
                }
            }
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

        const updErrors: Record<string, string> = {};
        if (!rndFormData.num_rnd) updErrors.rnd_num_rnd = "Este campo es requerido";
        if (!rndFormData.fec_rnd) updErrors.rnd_fec_rnd = "Este campo es requerido";
        if (!rndFormData.prd_rnd) updErrors.rnd_prd_rnd = "Este campo es requerido";
        if (Object.keys(updErrors).length > 0) {
            setFieldErrors(updErrors);
            return;
        }

        // Validar que la primera rendición de la OPG no tenga reintegro
        if (selectedRnd) {
            const rndsDeEstaOpg = renditions.filter(r => Number(r.opg_rnd) === Number(rndFormData.opg_rnd));
            const minCodRnd = rndsDeEstaOpg.length > 0 ? Math.min(...rndsDeEstaOpg.map(r => r.cod_rnd)) : null;
            if (selectedRnd.cod_rnd === minCodRnd && rndFormData.rnt_rnd && Number(rndFormData.rnt_rnd) > 0) {
                setIsRndEditOpen(false);
                setWarningMessage("La primera rendición de una Orden de Pago no puede tener reintegro.");
                setIsWarningOpen(true);
                return;
            }
        }

        // Validar que el reintegro no sea mayor al total de la rendición anterior
        if (rndFormData.rnt_rnd && Number(rndFormData.rnt_rnd) > 0) {
            const currentNum = parseInt(rndFormData.num_rnd);
            if (currentNum > 1) {
                const previousNumStr = String(currentNum - 1).padStart(2, "0");
                const previousRnd = renditions.find(r => r.num_rnd === previousNumStr);
                if (previousRnd) {
                    const previousNotes = opgDebitNotes.filter(n => Number(n.rnd_ndb) === Number(previousRnd.cod_rnd));
                    const previousTotal = previousNotes.reduce((acc, note) => acc + Number(note.mon_ndb || 0), 0);
                    if (Number(rndFormData.rnt_rnd) > previousTotal) {
                        setIsRndEditOpen(false);
                        setWarningMessage(`El reintegro no puede ser mayor al total de la rendición anterior (Bs. ${previousTotal.toLocaleString("es-VE", { minimumFractionDigits: 2 })}).`);
                        setIsWarningOpen(true);
                        return;
                    }
                }
            }
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
            setSelectedRnd(null);
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

        // Calcular mon_ndb si hay retenciones (subtotal - retenciones)
        const monCalculado = ndbFormData.has_retention
            ? Math.round(((ndbFormData.sub_ndb || 0) - (ndbFormData.rtc_ndb || 0) - (ndbFormData.tbf_ndb || 0) - (ndbFormData.isl_ndb || 0)) * 100) / 100
            : ndbFormData.mon_ndb;

        // Validar fecha no futura
        if (ndbFormData.fec_ndb && new Date(ndbFormData.fec_ndb) > new Date()) {
            setIsNdbCreateOpen(false);
            setWarningMessage("La fecha de la Nota de Débito no puede ser posterior a la fecha actual.");
            setIsWarningOpen(true);
            return;
        }

        const ndbErrors: Record<string, string> = {};
        if (!ndbFormData.num_ndb) ndbErrors.ndb_num_ndb = "Este campo es requerido";
        if (!ndbFormData.fec_ndb) ndbErrors.ndb_fec_ndb = "Este campo es requerido";
        if (!ndbFormData.ben_ndb) ndbErrors.ndb_ben_ndb = "Este campo es requerido";
        if (!ndbFormData.pro_ndb) ndbErrors.ndb_pro_ndb = "Este campo es requerido";
        if (!ndbFormData.ban_ndb) ndbErrors.ndb_ban_ndb = "Este campo es requerido";
        if (!ndbFormData.ref_ndb) ndbErrors.ndb_ref_ndb = "Este campo es requerido";
        if (!ndbFormData.con_ndb) ndbErrors.ndb_con_ndb = "Este campo es requerido";
        if (!monCalculado) ndbErrors.ndb_mon_ndb = "Este campo es requerido";
        if (Object.keys(ndbErrors).length > 0) {
            setFieldErrors(ndbErrors);
            return;
        }

        // Para validar contra OPG, usar mon_ndb (el subtotal solo aplica para detalles)
        const montoARendir = ndbFormData.mon_ndb || 0;

        const { valid, remaining } = validateDebitNoteAmount(
            montoARendir,
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
            const ndbData = {
                ...ndbFormData,
                mon_ndb: monCalculado,
                num_ndb: ndbFormData.num_ndb.startsWith("ND-")
                    ? ndbFormData.num_ndb
                    : "ND-" + ndbFormData.num_ndb,
            };
            const res = await debitNoteService.create(ndbData);

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

        // Validar cambio de banco desde Patria con montos negativos
        const changingFromPatria = selectedNdb.ban_ndb === "BANCO PATRIA" && ndbFormData.ban_ndb !== "BANCO PATRIA";
        if (changingFromPatria) {
            const hasNegatives = details.some(d => Number(d.mon_drn) < 0);
            if (hasNegatives) {
                setIsNdbEditOpen(false);
                setWarningMessage("No se puede cambiar el banco de BANCO PATRIA a otro banco porque la nota tiene detalles de gasto con montos negativos. Elimine o edite esos detalles antes de cambiar de banco.");
                setIsWarningOpen(true);
                return;
            }
        }

        // Calcular mon_ndb si hay retenciones (subtotal - retenciones)
        const monCalculado = ndbFormData.has_retention
            ? Math.round(((ndbFormData.sub_ndb || 0) - (ndbFormData.rtc_ndb || 0) - (ndbFormData.tbf_ndb || 0) - (ndbFormData.isl_ndb || 0)) * 100) / 100
            : ndbFormData.mon_ndb;

        // Si la nota ya tiene detalles, validar que el nuevo monto/subtotal no sea menor a la suma de detalles.
        // Con retenciones: los detalles se cargan contra el subtotal (sub_ndb).
        // Sin retenciones: los detalles se cargan contra el monto total (mon_ndb).
        const monCalculadoNum = Math.round(Number(monCalculado) * 100) / 100;
        const originalMonNum = Math.round(Number(selectedNdb.mon_ndb) * 100) / 100;

        const hasRetention = !!(
            ndbFormData.has_retention ||
            Number(ndbFormData.rtc_ndb || 0) > 0 ||
            Number(ndbFormData.tbf_ndb || 0) > 0 ||
            Number(ndbFormData.isl_ndb || 0) > 0
        );
        const compareAmount = hasRetention
            ? Math.round(Number(ndbFormData.sub_ndb || 0) * 100) / 100
            : monCalculadoNum;
        const originalCompare = hasRetention
            ? Math.round(Number(selectedNdb.sub_ndb || 0) * 100) / 100
            : originalMonNum;
        const isAmountReduced = compareAmount < originalCompare;
        if (isAmountReduced) {
            const detailsSum = Math.round(details.reduce((acc, curr) => acc + Number(curr.mon_drn || 0), 0) * 100) / 100;
            if (compareAmount < detailsSum) {
                const label = hasRetention ? "subtotal" : "monto";
                setIsNdbEditOpen(false);
                setWarningMessage(`No se puede reducir el ${label} de la nota de débito por debajo de la suma de sus detalles (Bs. ${detailsSum.toLocaleString("es-VE", { minimumFractionDigits: 2 })}).`);
                setIsWarningOpen(true);
                return;
            }
        }

        const updNdbErrors: Record<string, string> = {};
        if (!ndbFormData.num_ndb) updNdbErrors.ndb_num_ndb = "Este campo es requerido";
        if (!ndbFormData.fec_ndb) updNdbErrors.ndb_fec_ndb = "Este campo es requerido";
        if (!ndbFormData.ben_ndb) updNdbErrors.ndb_ben_ndb = "Este campo es requerido";
        if (!ndbFormData.pro_ndb) updNdbErrors.ndb_pro_ndb = "Este campo es requerido";
        if (!ndbFormData.ban_ndb) updNdbErrors.ndb_ban_ndb = "Este campo es requerido";
        if (!ndbFormData.ref_ndb) updNdbErrors.ndb_ref_ndb = "Este campo es requerido";
        if (!ndbFormData.con_ndb) updNdbErrors.ndb_con_ndb = "Este campo es requerido";
        if (!monCalculado) updNdbErrors.ndb_mon_ndb = "Este campo es requerido";
        if (Object.keys(updNdbErrors).length > 0) {
            setFieldErrors(updNdbErrors);
            return;
        }

        // Validar fecha no futura
        if (ndbFormData.fec_ndb && new Date(ndbFormData.fec_ndb) > new Date()) {
            setIsNdbEditOpen(false);
            setWarningMessage("La fecha de la Nota de Débito no puede ser posterior a la fecha actual.");
            setIsWarningOpen(true);
            return;
        }

        // Para validar contra OPG, usar monCalculado
        const montoARendir = monCalculado;

        const { valid, remaining } = validateDebitNoteAmount(
            montoARendir,
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
            const ndbData = {
                ...ndbFormData,
                mon_ndb: monCalculado,
                num_ndb: ndbFormData.num_ndb.startsWith("ND-")
                    ? ndbFormData.num_ndb
                    : "ND-" + ndbFormData.num_ndb,
            };
            const res = await debitNoteService.update(String(selectedNdb.cod_ndb), ndbData);
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

        if (drnFormData.mon_drn === 0 || drnFormData.mon_drn === undefined || drnFormData.mon_drn === null) {
            setFieldErrors({ drn_mon_drn: "Este campo es requerido" });
            return;
        }

        // Banco Patria: no se valida el exceso por detalle individual
        if (!isPatriaNote(selectedNdb)) {
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

        if (drnFormData.mon_drn === 0 || drnFormData.mon_drn === undefined || drnFormData.mon_drn === null) {
            setFieldErrors({ drn_mon_drn: "Este campo es requerido" });
            return;
        }

        // Banco Patria: no se valida el exceso por detalle individual
        if (!isPatriaNote(selectedNdb)) {
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
        fieldErrors,
        clearFieldErrors,

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
        fetchRenditionsByOpg,

        // ── Warning modal ──
        warningMessage,
        setWarningMessage,
        isWarningOpen,
        setIsWarningOpen,

    };
}
