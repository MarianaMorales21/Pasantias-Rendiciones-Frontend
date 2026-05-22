import { useState, useMemo } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import DataTable from "../components/tables/BasicTables/BasicTableOne";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import { Modal } from "../components/ui/modal/index";
import { MagnifyingGlassIcon, PencilIcon, TrashBinIcon, PlusIcon, AngleRightIcon, ChevronLeftIcon } from "../icons";
import { useSurrender, emptyRndForm, emptyNdbForm, emptyDrnForm } from "../hooks/useSurrender";
import { SearchableSelect } from "../components/form/SearchableSelect";
import { SurrenderItem } from "../types/surrender";
import { DebitNoteItem } from "../types/debitNote";
import { SurrenderDetailsItem } from "../types/surrenderDetails";
import { validateDebitNoteAmount, validateDetailAmount } from "../utils/validationsDebitNote"
import { OrderItem } from "../types/orders";

// ─── Formulario: Rendición (Cabecera) ─────────────────────────────────────────
function RndForm({ hook }: { hook: ReturnType<typeof useSurrender> }) {
  const { rndFormData, setRndFormData, orders, states: hookStates, renditions } = hook;
  const rndStates = hookStates.filter(
    (s) => s.nom_sta === "Activo" || s.nom_sta === "Inactivo"
  );

  const onChange = <K extends keyof SurrenderItem>(field: K, value: SurrenderItem[K]) =>
    setRndFormData({ ...rndFormData, [field]: value });

  // Bloquear reintegro si es la primera rendición de la OPG (la de menor cod_rnd)
  const selectedRndForFilter = (hook as any).selectedRnd;
  const rndsDeEstaOpg = renditions.filter(r => Number(r.opg_rnd) === Number(rndFormData.opg_rnd));
  const codRndActual = selectedRndForFilter?.cod_rnd;
  const minCodRnd = rndsDeEstaOpg.length > 0 ? Math.min(...rndsDeEstaOpg.map(r => r.cod_rnd)) : null;
  const esLaPrimera = codRndActual !== undefined && codRndActual !== null
    ? codRndActual === minCodRnd
    : rndsDeEstaOpg.length === 0;
  const isFirstRendition = rndFormData.opg_rnd > 0 && esLaPrimera;

  return (
    <Modal.Body className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rnd-num">Nro. Rendición</Label>
          <Input id="rnd-num" placeholder="Ej: 001" value={rndFormData.num_rnd}
            onChange={(e) => onChange("num_rnd", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="rnd-opg">Orden de Pago (OPG)</Label>
          <select id="rnd-opg" value={rndFormData.opg_rnd}
            onChange={(e) => onChange("opg_rnd", parseInt(e.target.value) || 0)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
            <option value={0}>Seleccione OPG</option>
            {orders.map((o) => (
              <option key={o.cod_opg} value={o.cod_opg}>
                OPG #{o.num_opg} — {o.nom_ctd} {o.ape_ctd}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rnd-fec">Fecha Rendición</Label>
          <Input id="rnd-fec" type="date" value={rndFormData.fec_rnd?.split("T")[0] || ""}
            onChange={(e) => onChange("fec_rnd", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="rnd-prd">Periodo</Label>
          <Input id="rnd-prd" placeholder="Ej: MARZO 2024" value={rndFormData.prd_rnd}
            onChange={(e) => onChange("prd_rnd", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rnd-avs">Aviso</Label>
          <Input id="rnd-avs" placeholder="Ej: AVISO-01" value={rndFormData.avs_rnd}
            onChange={(e) => onChange("avs_rnd", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="rnd-rnt">Reintegro (Bs.)</Label>
          <Input id="rnd-rnt" type="number" step={0.01} placeholder="Ej: 150.50" value={rndFormData.rnt_rnd ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onChange("rnt_rnd", val === "" ? null : val);
            }}
            disabled={isFirstRendition}
            className={isFirstRendition ? "opacity-50 cursor-not-allowed" : ""} />
          {isFirstRendition && (
            <p className="text-xs text-yellow-500 mt-1 font-medium">
              La primera rendición de una OPG no puede tener reintegro.
            </p>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="rnd-sta">Estado</Label>
        <select id="rnd-sta" value={rndFormData.sta_rnd}
          onChange={(e) => onChange("sta_rnd", parseInt(e.target.value) || 0)}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
          <option value={0}>Seleccione estado</option>
          {rndStates.map((s) => (
            <option key={s.cod_sta} value={s.cod_sta}>{s.nom_sta}</option>
          ))}
        </select>
      </div>
    </Modal.Body>
  );
}

// ─── Formulario: Nota de Débito ───────────────────────────────────────────────
function NdbForm({ hook }: { hook: ReturnType<typeof useSurrender> }) {
  const { ndbFormData, setNdbFormData, beneficiaries, programs, selectedOpg, selectedRnd, selectedNdb, opgDebitNotes, details } = hook;
  const onChange = (field: keyof typeof ndbFormData, value: string | number) =>
    setNdbFormData({ ...ndbFormData, [field]: value });

  const detailsSum = details.reduce((acc, curr) => acc + Number(curr.mon_drn || 0), 0);

  const bankOptions = [
    "BANCO DE VENEZUELA", "BANESCO", "BANCO MERCANTIL", "BANCO PROVINCIAL",
    "BANCO NACIONAL DE CRÉDITO (BNC)", "BANCARIBE", "BANCO EXTERIOR", "BANPLUS",
    "BANCO DEL TESORO", "BANCO BICENTENARIO", "BANCO CARONÍ",
    "BANCO VENEZOLANO DE CRÉDITO", "100% BANCO", "DEL SUR", "BANCO PLAZA", "BANCO ACTIVO"
  ];
  if (ndbFormData.ban_ndb && !bankOptions.includes(ndbFormData.ban_ndb)) {
    bankOptions.push(ndbFormData.ban_ndb);
  }

  // Cálculos de retenciones
  const sumRetenciones = Number(ndbFormData.rtc_ndb || 0) + Number(ndbFormData.tbf_ndb || 0) + Number(ndbFormData.isl_ndb || 0);
  const monOpgActual = Number(selectedOpg?.mon_opg || 0);

  const retencionesInvalidas = ndbFormData.has_retention && (
    Number(ndbFormData.rtc_ndb || 0) >= monOpgActual ||
    Number(ndbFormData.tbf_ndb || 0) >= monOpgActual ||
    Number(ndbFormData.isl_ndb || 0) >= monOpgActual
  );
  const subtotalValido = ndbFormData.has_retention
    ? (ndbFormData.sub_ndb || 0) > sumRetenciones &&
      Number(ndbFormData.sub_ndb || 0) <= monOpgActual &&
      Number(ndbFormData.rtc_ndb || 0) <= Number(ndbFormData.sub_ndb || 0) &&
      Number(ndbFormData.tbf_ndb || 0) <= Number(ndbFormData.sub_ndb || 0) &&
      Number(ndbFormData.isl_ndb || 0) <= Number(ndbFormData.sub_ndb || 0)
    : true;

  // Si hay retenciones, mon_ndb = subtotal - (IVA + Timbre + ISLR)
  const monNdbCalculado = ndbFormData.has_retention
    ? Math.round(((ndbFormData.sub_ndb || 0) - sumRetenciones) * 100) / 100
    : ndbFormData.mon_ndb;

  // Para validar contra OPG, usar mon_ndb (el subtotal solo aplica para detalles)
  const montoARendir = ndbFormData.mon_ndb || 0;

  const { remaining, excess } = validateDebitNoteAmount(
    montoARendir,
    selectedOpg,
    selectedRnd,
    opgDebitNotes,
    hook.renditions,
    selectedNdb?.cod_ndb
  );
  const isLocked = (hook.details?.length ?? 0) > 0;

  return (
    <Modal.Body className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ndb-num">Nro. Nota de Débito</Label>
          <Input id="ndb-num" placeholder="Ej: 1234 (se agregará ND- automáticamente)" value={ndbFormData.num_ndb}
            onChange={(e) => onChange("num_ndb", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="ndb-fec">Fecha</Label>
          <Input id="ndb-fec" type="date" value={ndbFormData.fec_ndb?.split("T")[0] || ""}
            onChange={(e) => onChange("fec_ndb", e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="ndb-ben">Beneficiario</Label>
        <select id="ndb-ben" value={ndbFormData.rif_ndb}
          onChange={(e) => onChange("rif_ndb", e.target.value)}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
          <option value="">Seleccione beneficiario</option>
          {beneficiaries.map((b) => (
            <option key={b.rif_ben} value={b.rif_ben}>{b.rif_ben} — {b.nom_ben}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="ndb-pro">Programa</Label>
        <select id="ndb-pro" value={ndbFormData.pro_ndb}
          onChange={(e) => onChange("pro_ndb", e.target.value)}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
          <option value="">Seleccione programa</option>
          {programs.map((pro) => (
            <option key={pro.cod_pro} value={pro.cod_pro}>{pro.nom_pro}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ndb-ban">Banco</Label>
          <select id="ndb-ban" value={ndbFormData.ban_ndb}
            onChange={(e) => onChange("ban_ndb", e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
            <option value="">Seleccione banco</option>
            {bankOptions.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="ndb-ref">Referencia</Label>
          <Input id="ndb-ref" placeholder="Ej: 98765432" value={ndbFormData.ref_ndb}
            onChange={(e) => onChange("ref_ndb", e.target.value)} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="ndb-retention"
          checked={!!ndbFormData.has_retention}
          onChange={(e) => {
            setNdbFormData(prev => ({
              ...prev,
              has_retention: e.target.checked,
              rtc_ndb: e.target.checked ? prev.rtc_ndb : 0,
              tbf_ndb: e.target.checked ? prev.tbf_ndb : 0,
              isl_ndb: e.target.checked ? prev.isl_ndb : 0,
              sub_ndb: e.target.checked ? prev.sub_ndb : 0
            }))
          }}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <Label htmlFor="ndb-retention" className="mb-0">Posee retención</Label>
      </div>

      {ndbFormData.has_retention && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ndb-rtc">Retención IVA (Bs.)</Label>
              <Input
                id="ndb-rtc"
                type="number"
                step={0.01}
                value={ndbFormData.rtc_ndb || ""}
                onChange={(e) => onChange("rtc_ndb", parseFloat(e.target.value) || 0)}
                className={(ndbFormData.rtc_ndb || 0) >= monOpgActual || Number(ndbFormData.rtc_ndb || 0) > Number(ndbFormData.sub_ndb || 0) ? "border-red-500" : ""}
              />
              {(ndbFormData.rtc_ndb || 0) >= monOpgActual && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  No puede igualar o superar el monto de la OPG (Bs. {monOpgActual.toLocaleString("es-VE", { minimumFractionDigits: 2 })}).
                </p>
              )}
              {Number(ndbFormData.rtc_ndb || 0) > Number(ndbFormData.sub_ndb || 0) && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  No puede superar el subtotal (Bs. {Number(ndbFormData.sub_ndb || 0).toLocaleString("es-VE", { minimumFractionDigits: 2 })}).
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="ndb-tbf">Timbre Fiscal (Bs.)</Label>
              <Input
                id="ndb-tbf"
                type="number"
                step={0.01}
                value={ndbFormData.tbf_ndb || ""}
                onChange={(e) => onChange("tbf_ndb", parseFloat(e.target.value) || 0)}
                className={(ndbFormData.tbf_ndb || 0) >= monOpgActual || Number(ndbFormData.tbf_ndb || 0) > Number(ndbFormData.sub_ndb || 0) ? "border-red-500" : ""}
              />
              {(ndbFormData.tbf_ndb || 0) >= monOpgActual && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  No puede igualar o superar el monto de la OPG (Bs. {monOpgActual.toLocaleString("es-VE", { minimumFractionDigits: 2 })}).
                </p>
              )}
              {Number(ndbFormData.tbf_ndb || 0) > Number(ndbFormData.sub_ndb || 0) && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  No puede superar el subtotal (Bs. {Number(ndbFormData.sub_ndb || 0).toLocaleString("es-VE", { minimumFractionDigits: 2 })}).
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="ndb-isl">ISLR (Bs.)</Label>
              <Input
                id="ndb-isl"
                type="number"
                step={0.01}
                value={ndbFormData.isl_ndb || ""}
                onChange={(e) => onChange("isl_ndb", parseFloat(e.target.value) || 0)}
                className={(ndbFormData.isl_ndb || 0) >= monOpgActual || Number(ndbFormData.isl_ndb || 0) > Number(ndbFormData.sub_ndb || 0) ? "border-red-500" : ""}
              />
              {(ndbFormData.isl_ndb || 0) >= monOpgActual && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  No puede igualar o superar el monto de la OPG (Bs. {monOpgActual.toLocaleString("es-VE", { minimumFractionDigits: 2 })}).
                </p>
              )}
              {Number(ndbFormData.isl_ndb || 0) > Number(ndbFormData.sub_ndb || 0) && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  No puede superar el subtotal (Bs. {Number(ndbFormData.sub_ndb || 0).toLocaleString("es-VE", { minimumFractionDigits: 2 })}).
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="ndb-sub">Subtotal (Bs.)</Label>
              <Input
                id="ndb-sub"
                type="number"
                step={0.01}
                value={ndbFormData.sub_ndb || ""}
                onChange={(e) => onChange("sub_ndb", parseFloat(e.target.value) || 0)}
                className={!subtotalValido ? "border-red-500" : ""}
              />
              {ndbFormData.has_retention && Number(ndbFormData.sub_ndb || 0) > monOpgActual && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  El subtotal no puede superar el monto de la OPG (Bs. {monOpgActual.toLocaleString("es-VE", { minimumFractionDigits: 2 })}).
                </p>
              )}
              {!subtotalValido && Number(ndbFormData.sub_ndb || 0) <= monOpgActual && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  El subtotal no puede ser menor a la suma de las retenciones.
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="ndb-mon-auto">Monto Total (Bs.)</Label>
            <Input
              id="ndb-mon-auto"
              type="number"
              step={0.01}
              value={monNdbCalculado || ""}
              disabled
              className={`cursor-not-allowed bg-gray-100 dark:bg-gray-700 ${(!subtotalValido || retencionesInvalidas) ? "border-red-500" : ""}`}
            />
            {retencionesInvalidas && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                Una o más retenciones superan el monto de la OPG.
              </p>
            )}
          </div>
        </>
      )}

      {!ndbFormData.has_retention && (
        <div>
          <Label htmlFor="ndb-mon">Monto Total (Bs.)</Label>
          <Input
            id="ndb-mon"
            type="number"
            step={0.01}
            value={ndbFormData.mon_ndb || ""}
            onChange={(e) => onChange("mon_ndb", parseFloat(e.target.value) || 0)}
            disabled={false}
            className={excess ? "border-red-500" : ""}
          />
          {isLocked && (
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Como la nota ya tiene detalles, el nuevo monto no puede ser menor a la suma de sus detalles (Bs. {detailsSum.toLocaleString("es-VE", { minimumFractionDigits: 2 })}).
            </p>
          )}
          {excess && (
            <p className="text-xs text-red-500 mt-1 font-medium">
              !Atencion! Solo quedan Bs. {remaining.toLocaleString("es-VE")} Disponibles.
            </p>
          )}
        </div>
      )}
      <div>
        <Label htmlFor="ndb-con">Concepto</Label>
        <textarea id="ndb-con" rows={2}
          className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          value={ndbFormData.con_ndb} onChange={(e) => onChange("con_ndb", e.target.value)} />
      </div>
    </Modal.Body>
  );
}

// ─── Formulario: Detalles de Nota de Débito ───────────────────────────────────
function DrnForm({ hook }: { hook: ReturnType<typeof useSurrender> }) {
  const { drnFormData, setDrnFormData, partidas, details, selectedNdb } = hook;
  const onChange = (field: keyof typeof drnFormData, value: string | number | null) =>
    setDrnFormData({ ...drnFormData, [field]: value });

  const { remaining, excess } = validateDetailAmount(
    drnFormData.mon_drn,
    selectedNdb,
    details,
    drnFormData.cod_drn
  );
  return (
    <Modal.Body className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div>
        <Label htmlFor="drn-par">Partida Presupuestaria</Label>
        <SearchableSelect
          options={partidas.map((p) => ({ value: p.cod_par, label: `${p.num_par} — ${p.nom_par}` }))}
          value={drnFormData.par_drn}
          onChange={(val) => onChange("par_drn", val)}
          placeholder="Escriba o seleccione partida..."
          nullLabel="Ninguna partida (Nulo)"
        />
      </div>
      <div>
        <Label htmlFor="drn-mon">Monto del Detalle (Bs.)</Label>
        <Input id="drn-mon" type="number" step={0.01} value={drnFormData.mon_drn || ""}
          onChange={(e) => setDrnFormData({ ...drnFormData, mon_drn: parseFloat(e.target.value) || 0 })}
          className={excess ? "border-red-500" : ""}
        />
        {excess && (
          <p className="text-xs text-red-500 mt-1 font-medium">
            !Atencion! Solo quedan Bs. {remaining.toLocaleString("es-VE")} Disponibles.
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="drn-des">Descripción</Label>
        <textarea id="drn-des" rows={3}
          className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          value={drnFormData.des_drn} onChange={(e) => onChange("des_drn", e.target.value)} />
      </div>
    </Modal.Body>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function Surrender() {
  const hook = useSurrender();
  const {
    orders, renditions, debitNotes, opgDebitNotes, details,
    selectedOpg, setSelectedOpg,
    selectedRnd, setSelectedRnd,
    selectedNdb, setSelectedNdb,
    searchOpg, setSearchOpg,
    isRndCreateOpen, setIsRndCreateOpen, isRndEditOpen, setIsRndEditOpen, isRndDeleteOpen, setIsRndDeleteOpen,
    handleRndCreate, handleRndUpdate, handleRndDelete, setRndFormData,
    isNdbCreateOpen, setIsNdbCreateOpen, isNdbEditOpen, setIsNdbEditOpen, isNdbDeleteOpen, setIsNdbDeleteOpen,
    handleNdbCreate, handleNdbUpdate, handleNdbDelete, setNdbFormData,
    isDrnCreateOpen, setIsDrnCreateOpen, isDrnEditOpen, setIsDrnEditOpen, isDrnDeleteOpen, setIsDrnDeleteOpen,
    handleDrnCreate, handleDrnUpdate, handleDrnDelete, setDrnFormData, setSelectedDrn,
    warningMessage, isWarningOpen, setIsWarningOpen
  } = hook;

  const [isFullyRenderedModalOpen, setIsFullyRenderedModalOpen] = useState(false);
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>("all");

  const yearsOptions = useMemo(() => {
    const yearsSet = new Set<number>();
    orders.forEach((o) => {
      const year = new Date(o.fec_opg || o.fdc_opg).getFullYear();
      if (!isNaN(year)) yearsSet.add(year);
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [orders]);

  const totalSpent = opgDebitNotes.reduce((acc, curr) => {
    return acc + Number(curr.mon_ndb || 0);
  }, 0);
  const totalReintegros = renditions.reduce((acc, curr) => acc + Number(curr.rnt_rnd || 0), 0);
  const netSpent = totalSpent - totalReintegros;
  const isOpgFullyRendered = selectedOpg ? netSpent >= Number(selectedOpg.mon_opg) : false;

  const handleCreateClick = (type: 'rnd' | 'ndb' | 'drn') => {
    // Siempre permitir agregar detalles aunque la OPG esté completamente rendida,
    // porque la nota de débito ya existe y su monto ya fue contabilizado.
    // Lo que importa es que la nota de débito tenga detalles reales de gasto.
    if (type !== 'drn' && isOpgFullyRendered) {
      setIsFullyRenderedModalOpen(true);
      return;
    }

    if (type === 'rnd') {
      setSelectedRnd(null);
      setRndFormData({ ...emptyRndForm, opg_rnd: selectedOpg!.cod_opg });
      setIsRndCreateOpen(true);
    } else if (type === 'ndb') {
      setNdbFormData({ ...emptyNdbForm, rnd_ndb: selectedRnd!.cod_rnd });
      setIsNdbCreateOpen(true);
    } else if (type === 'drn') {
      setDrnFormData({ ...emptyDrnForm, cab_drn: selectedNdb!.cod_ndb });
      setIsDrnCreateOpen(true);
    }
  };

  const filteredOpg = orders.filter((o) => {
    const q = searchOpg.toLowerCase();
    return o.num_opg?.toString().includes(q) || o.nom_ctd?.toLowerCase().includes(q);
  });

  const rndColumns = [
    {
      header: "Nro. RND",
      key: "num_rnd",
      render: (item: SurrenderItem) => (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-bold text-sm">
          #{item.num_rnd}
        </div>
      )
    },
    { header: "Periodo", key: "prd_rnd" },
    { header: "Fecha", key: "fec_rnd" },
    { header: "Estado", key: "nom_sta" },
    {
      header: "Acciones", key: "actions",
      render: (item: SurrenderItem) => (
        <div className="flex gap-1">
          <button onClick={() => { setSelectedRnd(item); setRndFormData(item); setIsRndEditOpen(true); }} className="p-1 text-gray-500 hover:text-blue-500"><PencilIcon className="size-4" /></button>
          <button onClick={() => { setSelectedRnd(item); setIsRndDeleteOpen(true); }} className="p-1 text-gray-500 hover:text-red-500"><TrashBinIcon className="size-4" /></button>
          <button onClick={() => setSelectedRnd(item)} className={`p-1 ${selectedRnd?.cod_rnd === item.cod_rnd ? "text-blue-600" : "text-gray-400"}`}><AngleRightIcon className="size-4" /></button>
        </div>
      )
    }
  ];

  const ndbColumns = [
    {
      header: "Nro. Nota",
      key: "num_ndb",
      render: (item: DebitNoteItem) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-bold text-xs uppercase">
            ND
          </div>
          <div>
            <span className="block font-medium text-gray-850 dark:text-white/90 text-theme-sm">
              #{item.num_ndb}
            </span>
          </div>
        </div>
      )
    },
    { header: "Beneficiario", key: "nom_ben" },
    { header: "Monto (Bs.)", key: "mon_ndb", render: (item: DebitNoteItem) => Number(item.mon_ndb).toLocaleString("es-VE", { minimumFractionDigits: 2 }) },
    {
      header: "Acciones", key: "actions",
      render: (item: DebitNoteItem) => (
        <div className="flex gap-1">
          <button onClick={() => {
            setSelectedNdb(item);
            setNdbFormData({
              ...item,
              has_retention: Number(item.sub_ndb) > 0 || Number(item.rtc_ndb) > 0 || Number(item.tbf_ndb) > 0 || Number(item.isl_ndb) > 0
            });
            setIsNdbEditOpen(true);
          }} className="p-1 text-gray-500 hover:text-blue-500"><PencilIcon className="size-4" /></button>
          <button onClick={() => { setSelectedNdb(item); setIsNdbDeleteOpen(true); }} className="p-1 text-gray-500 hover:text-red-500"><TrashBinIcon className="size-4" /></button>
          <button onClick={() => setSelectedNdb(item)} className={`p-1 ${selectedNdb?.cod_ndb === item.cod_ndb ? "text-blue-600" : "text-gray-400"}`}><AngleRightIcon className="size-4" /></button>
        </div>
      )
    }
  ];

  const drnColumns = [
    { header: "Partida", key: "num_par" },
    { header: "Descripción", key: "des_drn" },
    {
      header: "Monto (Bs.)", key: "mon_drn",
      render: (item: SurrenderDetailsItem) => Number(item.mon_drn).toLocaleString("es-VE", { minimumFractionDigits: 2 })
    },
    {
      header: "Acciones", key: "actions",
      render: (item: SurrenderDetailsItem) => (
        <div className="flex gap-1">
          <button
            onClick={() => {
              setSelectedDrn(item);   // ← Agregar
              setDrnFormData(item);
              setIsDrnEditOpen(true);
            }}
            className="p-1 text-gray-500 hover:text-blue-500"
          >
            <PencilIcon className="size-4" />
          </button>
          <button
            onClick={() => {
              setSelectedDrn(item);   // ← Agregar
              setIsDrnDeleteOpen(true);
            }}
            className="p-1 text-gray-500 hover:text-red-500"
          >
            <TrashBinIcon className="size-4" />
          </button>
        </div>
      )
    }
  ];

  const groupedOpg = filteredOpg.reduce((acc: Record<number, OrderItem[]>, opg) => {
    const year = new Date(opg.fec_opg || opg.fdc_opg).getFullYear();

    if (!acc[year]) acc[year] = [];
    acc[year].push(opg);

    return acc;
  }, {});

  const sortedYears = Object.keys(groupedOpg)
    .map(Number)
    .sort((a, b) => b - a);
  return (
    <>
      <PageMeta title="FUNDES - Rendiciones" description="Gestión administrativa para San Cristóbal" />
      <PageBreadcrumb pageTitle="Control de Rendiciones" />

      {!selectedOpg ? (
        <div className="animate-fadeIn">
          <ComponentCard title="Seleccione una Orden de Pago (OPG)">
            <div className="flex flex-col sm:flex-row gap-4 mb-6 max-w-2xl">
              <div className="relative flex-1">
                <Input placeholder="Buscar por número o beneficiario..." className="pl-10 w-full" value={searchOpg} onChange={(e) => setSearchOpg(e.target.value)} />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={selectedYearFilter}
                  onChange={(e) => setSelectedYearFilter(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="all">Todos los años</option>
                  {yearsOptions.map((y) => (
                    <option key={y} value={y.toString()}>
                      Año {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {sortedYears
                .filter((year) => selectedYearFilter === "all" || year.toString() === selectedYearFilter)
                .map((year) => (
                  <div key={year} className="mb-8">

                    <h2 className="text-lg font-bold text-gray-700 dark:text-white mb-3 border-b pb-2">
                      Año {year}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupedOpg[year].map((o) => (
                        <button
                          key={o.cod_opg}
                          onClick={() => setSelectedOpg(o)}
                          className="flex flex-col text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 hover:shadow-lg transition-all group"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-bold rounded-lg uppercase">
                              OPG #{o.num_opg}
                            </span>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                              Bs. {Number(o.mon_opg).toLocaleString()}
                            </span>
                          </div>

                          <div className="text-sm font-medium text-gray-800 dark:text-white mb-1">
                            {o.nom_ctd} {o.ape_ctd}
                          </div>

                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-auto">
                            <span>Gestionar</span>
                            <AngleRightIcon className="size-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </ComponentCard>
        </div>
      ) : (
        <div className="space-y-6 animate-slideIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedOpg(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
                <ChevronLeftIcon className="size-6" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Gestionando OPG #{selectedOpg.num_opg}</h2>
                <p className="text-sm text-gray-500 font-medium">{selectedOpg.nom_ctd} {selectedOpg.ape_ctd}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" startIcon={<ChevronLeftIcon className="size-4" />} onClick={() => setSelectedOpg(null)}>
              Volver a Órdenes
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <ComponentCard title={`Rendiciones`}>
              <div className="mb-4">
                {/* Ícono PlusIcon ajustado */}
                <Button size="md"
                  variant="primary"
                  className="bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl px-6 py-2.5 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40"
                  startIcon={<PlusIcon style={{ width: '16px', height: '16px', display: 'block' }}
                    className="text-white fill-current" />} onClick={() => handleCreateClick('rnd')}>Nueva Rendición</Button>
              </div>
              <DataTable columns={rndColumns} data={renditions} emptyMessage="No hay rendiciones registradas para esta orden de pago." />
            </ComponentCard>

            {selectedRnd && (
              <ComponentCard title={`Notas de Débito — RND #${selectedRnd.num_rnd}`}>
                <div className="mb-4">
                  {/* Ícono PlusIcon ajustado para visibilidad */}
                  <Button
                    size="md"
                    variant="primary"
                    className="bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl px-6 py-2.5 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40"
                    startIcon={
                      <PlusIcon
                        style={{ width: '16px', height: '16px', display: 'block' }}
                        className="text-white fill-current"
                      />
                    } onClick={() => handleCreateClick('ndb')}
                  >
                    <span>Nueva Nota de Débito</span>
                  </Button>
                </div>
                <DataTable columns={ndbColumns} data={debitNotes} emptyMessage="No hay notas de débito registradas para esta rendición." />
              </ComponentCard>
            )}

            {selectedNdb && (
              <ComponentCard title={`Detalles de Gasto — Nota #${selectedNdb.num_ndb}`}>
                <div className="mb-4">
                  <Button size="md"
                    variant="primary"
                    className="bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl px-6 py-2.5 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40"
                    startIcon={<PlusIcon style={{ width: '16px', height: '16px', display: 'block' }}
                      className="text-white fill-current" />} onClick={() => handleCreateClick('drn')}>Agregar Detalle</Button>
                </div>
                <DataTable columns={drnColumns} data={details} emptyMessage="No hay detalles de gasto registrados para esta nota de débito." />
              </ComponentCard>
            )}
          </div>
        </div>
      )}

      {/* MODALES: RENDICIÓN */}
      <Modal isOpen={isRndCreateOpen} onClose={() => { setIsRndCreateOpen(false); setSelectedRnd(null); }}>
        <Modal.Header>Nueva Rendición</Modal.Header>
        <RndForm hook={hook} />
        <Modal.Footer>
          <Button variant="outline" onClick={() => { setIsRndCreateOpen(false); setSelectedRnd(null); }}>Cancelar</Button>
          <Button onClick={handleRndCreate}>Crear</Button>
        </Modal.Footer>
      </Modal>

      <Modal isOpen={isRndEditOpen} onClose={() => { setIsRndEditOpen(false); setSelectedRnd(null); }}>
        <Modal.Header>Editar Rendición</Modal.Header>
        <RndForm hook={hook} />
        <Modal.Footer>
          <Button variant="outline" onClick={() => { setIsRndEditOpen(false); setSelectedRnd(null); }}>Cancelar</Button>
          <Button onClick={handleRndUpdate}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      {/* MODALES: NOTA DE DÉBITO */}
      <Modal isOpen={isNdbCreateOpen} onClose={() => setIsNdbCreateOpen(false)}>
        <Modal.Header>Nueva Nota de Débito</Modal.Header>
        <NdbForm hook={hook} />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsNdbCreateOpen(false)}>Cancelar</Button>
          <Button onClick={handleNdbCreate}>Registrar</Button>
        </Modal.Footer>
      </Modal>

      <Modal isOpen={isNdbEditOpen} onClose={() => setIsNdbEditOpen(false)}>
        <Modal.Header>Editar Nota de Débito</Modal.Header>
        <NdbForm hook={hook} />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsNdbEditOpen(false)}>Cancelar</Button>
          <Button onClick={handleNdbUpdate}>Actualizar</Button>
        </Modal.Footer>
      </Modal>

      {/* MODALES: DETALLES */}
      <Modal isOpen={isDrnCreateOpen} onClose={() => setIsDrnCreateOpen(false)}>
        <Modal.Header>Nuevo Detalle de Partida</Modal.Header>
        <DrnForm hook={hook} />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsDrnCreateOpen(false)}>Cancelar</Button>
          <Button onClick={handleDrnCreate}>Agregar</Button>
        </Modal.Footer>
      </Modal>

      <Modal isOpen={isDrnEditOpen} onClose={() => setIsDrnEditOpen(false)}>
        <Modal.Header>Editar Detalle</Modal.Header>
        <DrnForm hook={hook} />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsDrnEditOpen(false)}>Cancelar</Button>
          <Button onClick={handleDrnUpdate}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      {/* ELIMINACIÓN */}
      <Modal isOpen={isRndDeleteOpen} onClose={() => setIsRndDeleteOpen(false)}>
        <Modal.Header>Eliminar Rendición</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20">
              <TrashBinIcon className="size-7" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              ¿Eliminar &quot;Rendicion {selectedRnd?.num_rnd}&quot;?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Esta acción eliminará permanentemente la rendición del sistema y no se puede deshacer.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsRndDeleteOpen(false)}>No, mantener</Button>
          <Button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors" onClick={handleRndDelete}>Si, eliminar</Button>
        </Modal.Footer>
      </Modal>

      <Modal isOpen={isNdbDeleteOpen} onClose={() => setIsNdbDeleteOpen(false)}>
        <Modal.Header>Eliminar Nota</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20">
              <TrashBinIcon className="size-7" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              ¿Eliminar &quot;Nota de Debito {selectedNdb?.num_ndb}&quot;?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Esta acción eliminará permanentemente la nota de debito del sistema y no se puede deshacer.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsNdbDeleteOpen(false)}>No, mantener</Button>
          <Button
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            onClick={handleNdbDelete}
            disabled={details.length > 0} // Botón deshabilitado si hay hijos
          >
            Si, eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal isOpen={isDrnDeleteOpen} onClose={() => setIsDrnDeleteOpen(false)}>
        <Modal.Header>Eliminar Detalle</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20">
              <TrashBinIcon className="size-7" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              ¿Eliminar este Detalle de Partida?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Esta acción eliminará permanentemente el detalle de partida del sistema y no se puede deshacer.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsDrnDeleteOpen(false)}>No, mantener</Button>
          <Button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors" onClick={handleDrnDelete}>Si, eliminar</Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL: ADVERTENCIA 100% RENDIDO */}
      <Modal isOpen={isFullyRenderedModalOpen} onClose={() => setIsFullyRenderedModalOpen(false)}>
        <Modal.Header>Límite de Rendición</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Orden de Pago 100% Rendida
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Esta Orden de Pago ya ha sido rendida al 100% de su monto asignado (Bs. {Number(selectedOpg?.mon_opg || 0).toLocaleString("es-VE", { minimumFractionDigits: 2 })}). No se pueden crear nuevas rendiciones, notas de débito o detalles.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors w-full"
            onClick={() => setIsFullyRenderedModalOpen(false)}
          >
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL: AVISO GENÉRICO */}
      <Modal isOpen={isWarningOpen} onClose={() => setIsWarningOpen(false)}>
        <Modal.Header>Aviso</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Operación no permitida
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {warningMessage}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors w-full"
            onClick={() => setIsWarningOpen(false)}
          >
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
