import { useState, useMemo, useRef, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import DataTable from "../components/tables/BasicTables/BasicTableOne";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import { Modal } from "../components/ui/modal/index";
import { MagnifyingGlassIcon, PencilIcon, TrashBinIcon, PlusIcon, AngleRightIcon, ChevronLeftIcon, AngleLeftIcon } from "../icons";
import { useSurrender, emptyRndForm, emptyNdbForm, emptyDrnForm } from "../hooks/useSurrender";
import { useAuth } from "../context/AuthContext";
import { SearchableSelect } from "../components/form/SearchableSelect";
import { SurrenderItem } from "../types/surrender";
import { DebitNoteItem } from "../types/debitNote";
import { SurrenderDetailsItem } from "../types/surrenderDetails";
import { validateDebitNoteAmount, validateDetailAmount } from "../utils/validationsDebitNote"
import { OrderItem } from "../types/orders";

// ─── Formulario: Rendición (Cabecera) ─────────────────────────────────────────
function RndForm({ hook }: { hook: ReturnType<typeof useSurrender> }) {
  const { rndFormData, setRndFormData, orders, states: hookStates, renditions, fieldErrors, selectedRnd } = hook;
  const { user } = useAuth();
  const isAdminUser = user?.rol_usu === 1;
  const isCoordinatorUser = user?.rol_usu === 2;

  const isOriginalDelivered = selectedRnd?.nom_sta === "Entregada";

  const rndStates = useMemo(() => {
    if (selectedRnd) {
      const isOriginalDelivered = selectedRnd.nom_sta === "Entregada";
      if (isOriginalDelivered) {
        // Si ya está entregada, solo el administrador puede cambiarla a Activo.
        // Así que para el Administrador, mostramos "Entregada" (actual) y "Activo".
        return hookStates.filter(s => s.nom_sta === "Entregada" || s.nom_sta === "Activo");
      } else {
        // Si está activa/inactiva
        if (isAdminUser || isCoordinatorUser) {
          // Admin y coordinadora pueden cambiar de activa a entregada
          return hookStates.filter(s => s.nom_sta === "Activo" || s.nom_sta === "Inactivo" || s.nom_sta === "Entregada");
        } else {
          // Los demás no pueden cambiar a entregada
          return hookStates.filter(s => s.nom_sta === "Activo" || s.nom_sta === "Inactivo");
        }
      }
    }
    // Si es creación, mostrar Activo/Inactivo
    return hookStates.filter(s => s.nom_sta === "Activo" || s.nom_sta === "Inactivo");
  }, [selectedRnd, hookStates, isAdminUser, isCoordinatorUser]);

  const onChange = <K extends keyof SurrenderItem>(field: K, value: SurrenderItem[K]) =>
    setRndFormData({ ...rndFormData, [field]: value });

  // Bloquear reintegro si es la primera rendición de la OPG (la de menor cod_rnd)
  const selectedRndForFilter = hook.selectedRnd;
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
          <select
            id="rnd-num"
            value={rndFormData.num_rnd}
            onChange={(e) => onChange("num_rnd", e.target.value)}
            disabled={isOriginalDelivered}
            className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${fieldErrors?.rnd_num_rnd ? "border-red-500" : "border-gray-300"
              } ${isOriginalDelivered ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""}`}
          >
            <option value="">Seleccione número</option>
            {Array.from({ length: 4 }, (_, i) => {
              const num = String(i + 1).padStart(2, "0");
              return (
                <option key={num} value={num}>
                  Rendición #{num}
                </option>
              );
            })}
          </select>
          {fieldErrors?.rnd_num_rnd && <p className="text-xs text-red-500 mt-1">Este campo no puede faltar.</p>}
        </div>
        <div>
          <Label htmlFor="rnd-opg">Orden de Pago (OPG)</Label>
          <select id="rnd-opg" value={rndFormData.opg_rnd}
            onChange={(e) => onChange("opg_rnd", parseInt(e.target.value) || 0)}
            disabled={isOriginalDelivered}
            className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${fieldErrors?.rnd_opg_rnd ? "border-red-500" : "border-gray-300"} ${isOriginalDelivered ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""}`}>
            <option value={0}>Seleccione OPG</option>
            {orders.map((o) => (
              <option key={o.cod_opg} value={o.cod_opg}>
                OPG #{o.num_opg} — {o.nom_ctd} {o.ape_ctd}
              </option>
            ))}
          </select>
          {fieldErrors?.rnd_opg_rnd && <p className="text-xs text-red-500 mt-1">Este campo no puede faltar.</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rnd-fec">Fecha Rendición</Label>
          <Input id="rnd-fec" type="date" value={rndFormData.fec_rnd?.split("T")[0] || ""}
            onChange={(e) => onChange("fec_rnd", e.target.value)}
            disabled={isOriginalDelivered}
            className={`${fieldErrors?.rnd_fec_rnd ? "border-red-500" : ""} ${isOriginalDelivered ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""}`} />
          {fieldErrors?.rnd_fec_rnd && <p className="text-xs text-red-500 mt-1">Este campo no puede faltar.</p>}
        </div>
        <div>
          <Label htmlFor="rnd-prd">Periodo</Label>
          <Input id="rnd-prd" placeholder="Ej: MARZO 2024" value={rndFormData.prd_rnd}
            onChange={(e) => onChange("prd_rnd", e.target.value)}
            disabled={isOriginalDelivered}
            className={`${fieldErrors?.rnd_prd_rnd ? "border-red-500" : ""} ${isOriginalDelivered ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""}`} />
          {fieldErrors?.rnd_prd_rnd && <p className="text-xs text-red-500 mt-1">Este campo no puede faltar.</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rnd-avs">Aviso</Label>
          <Input id="rnd-avs" placeholder="Ej: AVISO-01" value={rndFormData.avs_rnd}
            onChange={(e) => onChange("avs_rnd", e.target.value)}
            disabled={isOriginalDelivered}
            className={isOriginalDelivered ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""} />
        </div>
        <div>
          <Label htmlFor="rnd-rnt">Reintegro (Bs.)</Label>
          <Input id="rnd-rnt" type="number" step={0.01} placeholder="Ej: 150.50" value={rndFormData.rnt_rnd ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onChange("rnt_rnd", val === "" ? null : val);
            }}
            disabled={isFirstRendition || isOriginalDelivered}
            className={(isFirstRendition || isOriginalDelivered) ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""} />
          {isFirstRendition && !isOriginalDelivered && (
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
  const { ndbFormData, setNdbFormData, beneficiaries, programs, selectedOpg, selectedRnd, selectedNdb, opgDebitNotes, fieldErrors } = hook;
  const activeBeneficiaries = useMemo(
    () => beneficiaries.filter((b) => b.sta_ben === 1 || b.nom_sta === "Activo"),
    [beneficiaries]
  );
  const activePrograms = useMemo(
    () => programs.filter((p) => p.sta_pro === 1 || p.nom_sta === "Activo"),
    [programs]
  );
  const onChange = (field: keyof typeof ndbFormData, value: string | number) =>
    setNdbFormData({ ...ndbFormData, [field]: value });

  const today = new Date().toISOString().split("T")[0];
  const futureDate = ndbFormData.fec_ndb && ndbFormData.fec_ndb > today;

  const bankOptions = [
    "BANCO DE VENEZUELA", "BANESCO", "BANCO MERCANTIL", "BANCO PROVINCIAL", "BANCO PATRIA",
    "BANCO NACIONAL DE CRÉDITO (BNC)", "BANCARIBE", "BANCO EXTERIOR", "BANPLUS",
    "BANCO DEL TESORO", "BANCO DIGITAL DE LOS TRABAJADORES", "BANCO CARONÍ",
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

  // Para validar contra OPG, usar el monto efectivo
  const montoARendir = monNdbCalculado;

  const { remaining, excess } = validateDebitNoteAmount(
    montoARendir,
    selectedOpg,
    selectedRnd,
    opgDebitNotes,
    hook.renditions,
    selectedNdb?.cod_ndb
  );

  return (
    <Modal.Body className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ndb-num">Nro. Nota de Débito</Label>
          <Input id="ndb-num" placeholder="Ej: 1234 (se agregará ND- automáticamente)" value={ndbFormData.num_ndb}
            onChange={(e) => onChange("num_ndb", e.target.value.replace(/\D/g, ""))}
            className={fieldErrors?.ndb_num_ndb ? "border-red-500" : ""} />
          {fieldErrors?.ndb_num_ndb && <p className="text-xs text-red-500 mt-1">Este campo no puede faltar.</p>}
        </div>
        <div>
          <Label htmlFor="ndb-fec">Fecha</Label>
          <Input id="ndb-fec" type="date" value={ndbFormData.fec_ndb?.split("T")[0] || ""}
            onChange={(e) => onChange("fec_ndb", e.target.value)}
            className={futureDate || fieldErrors?.ndb_fec_ndb ? "border-red-500" : ""} />
          {futureDate && <p className="text-xs text-red-500 mt-1 font-medium">La fecha no puede ser posterior a hoy.</p>}
          {fieldErrors?.ndb_fec_ndb && !futureDate && <p className="text-xs text-red-500 mt-1">Este campo no puede faltar.</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="ndb-ben">Beneficiario</Label>
        <select id="ndb-ben" value={ndbFormData.ben_ndb}
          onChange={(e) => onChange("ben_ndb", parseInt(e.target.value) || 0)}
          className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${fieldErrors?.ndb_ben_ndb ? "border-red-500" : "border-gray-300"}`}>
          <option value={0}>Seleccione beneficiario</option>
          {activeBeneficiaries.map((b) => (
            <option key={b.cod_ben} value={b.cod_ben}>{b.rif_ben} — {b.nom_ben}</option>
          ))}
        </select>
        {fieldErrors?.ndb_ben_ndb && <p className="text-xs text-red-500 mt-1">Este campo no puede faltar.</p>}
      </div>
      <div>
        <Label htmlFor="ndb-pro">Programa</Label>
        <select id="ndb-pro" value={ndbFormData.pro_ndb}
          onChange={(e) => onChange("pro_ndb", e.target.value)}
          className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${fieldErrors?.ndb_pro_ndb ? "border-red-500" : "border-gray-300"}`}>
          <option value="">Seleccione programa</option>
          {activePrograms.map((pro) => (
            <option key={pro.cod_pro} value={pro.cod_pro}>{pro.nom_pro}</option>
          ))}
        </select>
        {fieldErrors?.ndb_pro_ndb && <p className="text-xs text-red-500 mt-1">Este campo no puede faltar.</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ndb-ban">Banco</Label>
          <select id="ndb-ban" value={ndbFormData.ban_ndb}
            onChange={(e) => onChange("ban_ndb", e.target.value)}
            className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${fieldErrors?.ndb_ban_ndb ? "border-red-500" : "border-gray-300"}`}>
            <option value="">Seleccione banco</option>
            {bankOptions.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          {fieldErrors?.ndb_ban_ndb && <p className="text-xs text-red-500 mt-1">Este campo no puede faltar.</p>}
        </div>
        <div>
          <Label htmlFor="ndb-ref">Referencia</Label>
          <Input id="ndb-ref" placeholder="Ej: 98765432" value={ndbFormData.ref_ndb}
            onChange={(e) => onChange("ref_ndb", e.target.value.replace(/\D/g, ""))}
            className={fieldErrors?.ndb_ref_ndb ? "border-red-500" : ""} />
          {fieldErrors?.ndb_ref_ndb && <p className="text-xs text-red-500 mt-1">Este campo no puede faltar.</p>}
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
          <div>
            <Label htmlFor="ndb-sub">Subtotal (Bs.)</Label>
            <Input
              id="ndb-sub"
              type="number"
              step={0.01}
              value={ndbFormData.sub_ndb || ""}
              onChange={(e) => onChange("sub_ndb", parseFloat(e.target.value) || 0)}
              className={!subtotalValido && Number(ndbFormData.sub_ndb || 0) > 0 ? "border-red-500" : ""}
            />
            {ndbFormData.has_retention && Number(ndbFormData.sub_ndb || 0) > monOpgActual && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                El subtotal no puede superar el monto de la OPG (Bs. {monOpgActual.toLocaleString("es-VE", { minimumFractionDigits: 2 })}).
              </p>
            )}
            {!subtotalValido && Number(ndbFormData.sub_ndb || 0) > 0 && Number(ndbFormData.sub_ndb || 0) <= monOpgActual && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                El subtotal no puede ser menor a la suma de las retenciones.
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
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
          </div>
          <div>
            <Label htmlFor="ndb-mon-auto">Monto Total (Bs.)</Label>
            <Input
              id="ndb-mon-auto"
              type="number"
              step={0.01}
              value={monNdbCalculado || ""}
              disabled
              className={`cursor-not-allowed bg-gray-100 dark:bg-gray-700 ${(!subtotalValido || retencionesInvalidas || fieldErrors?.ndb_mon_ndb) ? "border-red-500" : ""}`}
            />
            {retencionesInvalidas && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                Una o más retenciones superan el monto de la OPG.
              </p>
            )}
            {fieldErrors?.ndb_mon_ndb && (
              <p className="text-xs text-red-500 mt-1 font-medium">Este campo no puede faltar.</p>
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
            className={`${excess ? "border-red-500" : ""} ${fieldErrors?.ndb_mon_ndb ? "border-red-500" : ""}`}
          />
          {excess && (
            <p className="text-xs text-red-500 mt-1 font-medium">
              !Atencion! Solo quedan Bs. {remaining.toLocaleString("es-VE")} Disponibles.
            </p>
          )}
          {fieldErrors?.ndb_mon_ndb && (
            <p className="text-xs text-red-500 mt-1 font-medium">Este campo no puede faltar.</p>
          )}
        </div>
      )}
      <div>
        <Label htmlFor="ndb-con">Concepto</Label>
        <textarea id="ndb-con" rows={2}
          className={`w-full rounded-lg border bg-transparent px-4 py-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${fieldErrors?.ndb_con_ndb ? "border-red-500" : "border-gray-300"}`}
          value={ndbFormData.con_ndb} onChange={(e) => onChange("con_ndb", e.target.value)} />
        {fieldErrors?.ndb_con_ndb && <p className="text-xs text-red-500 mt-1">Este campo no puede faltar.</p>}
      </div>
    </Modal.Body>
  );
}

// ─── Formulario: Detalles de Nota de Débito ───────────────────────────────────
function DrnForm({ hook }: { hook: ReturnType<typeof useSurrender> }) {
  const { drnFormData, setDrnFormData, partidas, details, selectedNdb, fieldErrors } = hook;
  const onChange = (field: keyof typeof drnFormData, value: string | number | null) =>
    setDrnFormData({ ...drnFormData, [field]: value });

  const isPatria = selectedNdb?.ban_ndb === "BANCO PATRIA";

  // Para Patria: la validación de exceso no aplica por detalle
  const { remaining, excess } = isPatria
    ? { remaining: 0, excess: false }
    : validateDetailAmount(drnFormData.mon_drn, selectedNdb, details, drnFormData.cod_drn);

  // Para Patria: suma neta actual de los otros detalles
  const netSum = isPatria
    ? details
      .filter((d) => d.cod_drn !== drnFormData.cod_drn)
      .reduce((acc, d) => acc + Number(d.mon_drn || 0), 0)
    : 0;
  const monNdb = Number(selectedNdb?.mon_ndb || 0);
  const netAfter = isPatria ? netSum + (drnFormData.mon_drn || 0) : 0;
  const round2 = (n: number) => Math.round(n * 100) / 100;

  return (
    <Modal.Body className="space-y-4 max-h-[70vh] overflow-y-auto">
      {isPatria && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg text-xs text-blue-700 dark:text-blue-300">
          <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Banco Patria: los montos pueden ser positivos o negativos. La suma neta debe igualar el total de la nota (Bs. {monNdb.toLocaleString("es-VE", { minimumFractionDigits: 2 })}).</span>
        </div>
      )}
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
        <Label htmlFor="drn-mon">Monto del Detalle (Bs.){isPatria ? " — puede ser negativo" : ""}</Label>
        <Input id="drn-mon" type="number" step={0.01} value={drnFormData.mon_drn === 0 ? "" : drnFormData.mon_drn}
          onChange={(e) => setDrnFormData({ ...drnFormData, mon_drn: parseFloat(e.target.value) || 0 })}
          className={`${excess ? "border-red-500" : ""} ${fieldErrors?.drn_mon_drn ? "border-red-500" : ""}`}
        />
        {isPatria && drnFormData.mon_drn !== 0 && (
          <p className={`text-xs mt-1 font-medium ${round2(netAfter) === round2(monNdb) ? "text-green-600" : "text-amber-600"
            }`}>
            Suma neta tras este detalle: Bs. {netAfter.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
            {round2(netAfter) === round2(monNdb) ? " ✔ Cuadra con la nota" : ` (falta Bs. ${(monNdb - netAfter).toLocaleString("es-VE", { minimumFractionDigits: 2 })})`}
          </p>
        )}
        {!isPatria && excess && (
          <p className="text-xs text-red-500 mt-1 font-medium">
            !Atencion! Solo quedan Bs. {remaining.toLocaleString("es-VE")} Disponibles.
          </p>
        )}
        {fieldErrors?.drn_mon_drn && (
          <p className="text-xs text-red-500 mt-1 font-medium">Este campo no puede faltar.</p>
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
  const { user } = useAuth();
  const isAdminUser = user?.rol_usu === 1;

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
    clearFieldErrors,
    warningMessage, isWarningOpen, setIsWarningOpen
  } = hook;

  const [isFullyRenderedModalOpen, setIsFullyRenderedModalOpen] = useState(false);
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>("all");

  const detailsRef = useRef<HTMLDivElement>(null);

  const [searchNdb, setSearchNdb] = useState<string>("");
  const [currentPageNdb, setCurrentPageNdb] = useState<number>(1);

  useEffect(() => {
    setSearchNdb("");
    setCurrentPageNdb(1);
  }, [selectedRnd]);

  const sortedNdb = useMemo(() => {
    return [...debitNotes].sort((a, b) => b.cod_ndb - a.cod_ndb);
  }, [debitNotes]);

  const filteredNdb = useMemo(() => {
    const q = searchNdb.toLowerCase().trim();
    if (!q) return sortedNdb;
    return sortedNdb.filter((item) => {
      const numMatch = item.num_ndb?.toLowerCase().includes(q);
      const benMatch = item.nom_ben?.toLowerCase().includes(q) || item.rif_ben?.toLowerCase().includes(q);
      const conMatch = item.con_ndb?.toLowerCase().includes(q);
      return numMatch || benMatch || conMatch;
    });
  }, [sortedNdb, searchNdb]);

  const ITEMS_PER_PAGE = 5;
  const totalPagesNdb = Math.ceil(filteredNdb.length / ITEMS_PER_PAGE);
  const activePageNdb = Math.min(Math.max(1, currentPageNdb), totalPagesNdb || 1);

  const paginatedNdb = useMemo(() => {
    const startIndex = (activePageNdb - 1) * ITEMS_PER_PAGE;
    return filteredNdb.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredNdb, activePageNdb]);

  useEffect(() => {
    if (selectedNdb) {
      requestAnimationFrame(() => {
        detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [selectedNdb]);

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
    clearFieldErrors();
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
      render: (item: SurrenderItem) => {
        const isDelivered = item.nom_sta === "Entregada";
        const canEdit = !isDelivered || isAdminUser;
        const canDelete = !isDelivered;

        return (
          <div className="flex gap-1">
            <button
              onClick={() => {
                if (!canEdit) return;
                clearFieldErrors();
                setSelectedRnd(item);
                setRndFormData(item);
                setIsRndEditOpen(true);
              }}
              disabled={!canEdit}
              title={!canEdit ? "Solo el administrador puede editar una rendición entregada" : "Editar"}
              className={`p-1 transition-colors ${canEdit ? "text-gray-500 hover:text-blue-500" : "text-gray-300 cursor-not-allowed opacity-50"}`}
            >
              <PencilIcon className="size-4" />
            </button>
            <button
              onClick={() => {
                if (!canDelete) return;
                setSelectedRnd(item);
                setIsRndDeleteOpen(true);
              }}
              disabled={!canDelete}
              title={!canDelete ? "No se puede eliminar una rendición entregada" : "Eliminar"}
              className={`p-1 transition-colors ${canDelete ? "text-gray-500 hover:text-red-500" : "text-gray-300 cursor-not-allowed opacity-50"}`}
            >
              <TrashBinIcon className="size-4" />
            </button>
            <button onClick={() => setSelectedRnd(item)} className={`p-1 ${selectedRnd?.cod_rnd === item.cod_rnd ? "text-blue-600" : "text-gray-400"}`}><AngleRightIcon className="size-4" /></button>
          </div>
        );
      }
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
      render: (item: DebitNoteItem) => {
        const isRndDelivered = selectedRnd?.nom_sta === "Entregada";
        const canEdit = !isRndDelivered;
        const canDelete = !isRndDelivered;

        return (
          <div className="flex gap-1">
            <button
              onClick={() => {
                if (!canEdit) return;
                clearFieldErrors();
                setSelectedNdb(item);
                setNdbFormData({
                  ...item,
                  has_retention: Number(item.sub_ndb) > 0 || Number(item.rtc_ndb) > 0 || Number(item.tbf_ndb) > 0 || Number(item.isl_ndb) > 0
                });
                setIsNdbEditOpen(true);
              }}
              disabled={!canEdit}
              title={!canEdit ? "No se puede editar notas de débito de una rendición entregada" : "Editar"}
              className={`p-1 transition-colors ${canEdit ? "text-gray-500 hover:text-blue-500" : "text-gray-300 cursor-not-allowed opacity-50"}`}
            >
              <PencilIcon className="size-4" />
            </button>
            <button
              onClick={() => {
                if (!canDelete) return;
                setSelectedNdb(item);
                setIsNdbDeleteOpen(true);
              }}
              disabled={!canDelete}
              title={!canDelete ? "No se puede eliminar notas de débito de una rendición entregada" : "Eliminar"}
              className={`p-1 transition-colors ${canDelete ? "text-gray-500 hover:text-red-500" : "text-gray-300 cursor-not-allowed opacity-50"}`}
            >
              <TrashBinIcon className="size-4" />
            </button>
            <button onClick={() => setSelectedNdb(item)} className={`p-1 ${selectedNdb?.cod_ndb === item.cod_ndb ? "text-blue-600" : "text-gray-400"}`}><AngleRightIcon className="size-4" /></button>
          </div>
        );
      }
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
      render: (item: SurrenderDetailsItem) => {
        const isRndDelivered = selectedRnd?.nom_sta === "Entregada";
        const canEdit = !isRndDelivered;
        const canDelete = !isRndDelivered;

        return (
          <div className="flex gap-1">
            <button
              onClick={() => {
                if (!canEdit) return;
                clearFieldErrors();
                setSelectedDrn(item);
                setDrnFormData(item);
                setIsDrnEditOpen(true);
              }}
              disabled={!canEdit}
              title={!canEdit ? "No se puede editar detalles de una rendición entregada" : "Editar"}
              className={`p-1 transition-colors ${canEdit ? "text-gray-500 hover:text-blue-500" : "text-gray-300 cursor-not-allowed opacity-50"}`}
            >
              <PencilIcon className="size-4" />
            </button>
            <button
              onClick={() => {
                if (!canDelete) return;
                setSelectedDrn(item);
                setIsDrnDeleteOpen(true);
              }}
              disabled={!canDelete}
              title={!canDelete ? "No se puede eliminar detalles de una rendición entregada" : "Eliminar"}
              className={`p-1 transition-colors ${canDelete ? "text-gray-500 hover:text-red-500" : "text-gray-300 cursor-not-allowed opacity-50"}`}
            >
              <TrashBinIcon className="size-4" />
            </button>
          </div>
        );
      }
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
                <Input placeholder="Buscar por número..." className="pl-10 w-full" value={searchOpg} onChange={(e) => setSearchOpg(e.target.value)} />
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

                {/* CABECERA: Controla la fila de acciones y estadísticas */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                  {/* Bloque Izquierdo: Botón y Buscador alineados perfectamente al mismo nivel */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <Button
                      size="md"
                      variant="primary"
                      disabled={selectedRnd?.nom_sta === "Entregada"}
                      className="bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl px-6 py-2.5 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 whitespace-nowrap"
                      startIcon={
                        <PlusIcon
                          style={{ width: '16px', height: '16px', display: 'block' }}
                          className="text-white fill-current"
                        />
                      }
                      onClick={() => handleCreateClick('ndb')}
                    >
                      <span>Nueva Nota de Débito</span>
                    </Button>

                    {/* Buscador ajustado sin márgenes externos que rompan la línea vertical */}
                    <div className="relative w-full sm:w-72">
                      <Input
                        placeholder="Buscar nota de débito..."
                        className="pl-10 w-full"
                        value={searchNdb}
                        onChange={(e) => {
                          setSearchNdb(e.target.value);
                          setCurrentPageNdb(1);
                        }}
                      />
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Bloque Derecho: Estadísticas Financieras */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <span>Total Notas de Débito:</span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        Bs. {totalSpent.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <span className="hidden sm:inline text-gray-300 dark:text-gray-700">|</span>

                    <div className="flex items-center gap-1.5">
                      <span>Total Orden de Pago:</span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        Bs. {Number(selectedOpg.mon_opg).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <span className="hidden sm:inline text-gray-300 dark:text-gray-700">|</span>

                    <div className="flex items-center gap-1.5">
                      <span>Queda por rendir:</span>
                      <span className={`font-bold ${netSpent >= Number(selectedOpg.mon_opg) ? "text-green-600" : "text-amber-600"}`}>
                        Bs. {Math.max(0, Number(selectedOpg.mon_opg) - netSpent).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* TABLA DE DATOS */}
                <DataTable
                  columns={ndbColumns}
                  data={paginatedNdb}
                  emptyMessage="No hay notas de débito registradas para esta rendición."
                />

                {/* PAGINACIÓN */}
                {totalPagesNdb > 1 && (
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-150 dark:border-gray-800 pt-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Mostrando <span className="text-gray-500 dark:text-white">{(activePageNdb - 1) * ITEMS_PER_PAGE + 1}</span> a{" "}
                      <span className="text-gray-500 dark:text-white">
                        {Math.min(filteredNdb.length, activePageNdb * ITEMS_PER_PAGE)}
                      </span>{" "}
                      de <span className="text-gray-500 dark:text-white">{filteredNdb.length}</span> notas
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={activePageNdb === 1}
                        onClick={() => setCurrentPageNdb((prev) => Math.max(1, prev - 1))}
                        startIcon={<AngleLeftIcon className="size-4" />}
                      >
                        Anterior
                      </Button>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Página {activePageNdb} de {totalPagesNdb}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={activePageNdb === totalPagesNdb}
                        onClick={() => setCurrentPageNdb((prev) => Math.min(totalPagesNdb, prev + 1))}
                        endIcon={<AngleRightIcon className="size-4" />}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </ComponentCard>
            )}

            {selectedNdb && (() => {
              const isPatriaNdb = selectedNdb.ban_ndb === "BANCO PATRIA";
              const netSum = details.reduce((acc, d) => acc + Number(d.mon_drn || 0), 0);
              const subTotal = Number(selectedNdb.sub_ndb || 0);
              const monNdbTotal = subTotal > 0 ? subTotal : Number(selectedNdb.mon_ndb || 0);
              const round2 = (n: number) => Math.round(n * 100) / 100;
              const netBalanced = round2(netSum) === round2(Number(selectedNdb.mon_ndb));
              return (
                <ComponentCard ref={detailsRef} title={`Detalles de Gasto — Nota #${selectedNdb.num_ndb}`}>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <Button size="md"
                      variant="primary"
                      disabled={selectedRnd?.nom_sta === "Entregada"}
                      className="bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl px-6 py-2.5 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40"
                      startIcon={<PlusIcon style={{ width: '16px', height: '16px', display: 'block' }}
                        className="text-white fill-current" />}
                      onClick={() => handleCreateClick('drn')}
                    >
                      Agregar Detalle
                    </Button>
                    {isPatriaNdb ? (
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-gray-500">Suma neta detalles:</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          Bs. {netSum.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-500">Total nota:</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          Bs. {Number(selectedNdb.mon_ndb).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-500">Diferencia:</span>
                        <span className={`font-bold ${netBalanced ? "text-green-600" : "text-amber-600"
                          }`}>
                          {netBalanced
                            ? "✔ Cuadra"
                            : `Bs. ${(Number(selectedNdb.mon_ndb) - netSum).toLocaleString("es-VE", { minimumFractionDigits: 2 })}`
                          }
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">Total gastado:</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          Bs. {netSum.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-500">Monto Nota de Débito (Subtotal):</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          Bs. {monNdbTotal.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-500">Queda por agregar:</span>
                        <span className={`font-bold ${netSum >= monNdbTotal ? "text-green-600" : "text-amber-600"
                          }`}>
                          Bs. {Math.max(0, monNdbTotal - netSum).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>
                  <DataTable columns={drnColumns} data={details} emptyMessage="No hay detalles de gasto registrados para esta nota de débito." />
                </ComponentCard>
              );
            })()}

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
              ¿Eliminar este Detalle de Nota de Debito?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Esta acción eliminará permanentemente el detalle de nota de debito del sistema y no se puede deshacer.
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
