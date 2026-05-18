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
import { SurrenderItem } from "../types/surrender";
import { DebitNoteItem } from "../types/debitNote";
import { SurrenderDetailsItem } from "../types/surrenderDetails";
import { validateDebitNoteAmount, validateDetailAmount } from "../utils/validationsDebitNote"


// ─── Formulario: Rendición (Cabecera) ─────────────────────────────────────────
function RndForm({ hook }: { hook: ReturnType<typeof useSurrender> }) {
  const { rndFormData, setRndFormData, orders, states } = hook;

  const onChange = (field: keyof typeof rndFormData, value: string | number) =>
    setRndFormData({ ...rndFormData, [field]: value });

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
      <div>
        <Label htmlFor="rnd-avs">Aviso</Label>
        <Input id="rnd-avs" placeholder="Ej: AVISO-01" value={rndFormData.avs_rnd}
          onChange={(e) => onChange("avs_rnd", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="rnd-sta">Estado</Label>
        <select id="rnd-sta" value={rndFormData.sta_rnd}
          onChange={(e) => onChange("sta_rnd", parseInt(e.target.value) || 0)}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
          <option value={0}>Seleccione estado</option>
          {states.map((s) => (
            <option key={s.cod_sta} value={s.cod_sta}>{s.nom_sta}</option>
          ))}
        </select>
      </div>
    </Modal.Body>
  );
}

// ─── Formulario: Nota de Débito ───────────────────────────────────────────────
function NdbForm({ hook }: { hook: ReturnType<typeof useSurrender> }) {
  const { ndbFormData, setNdbFormData, beneficiaries, programs, selectedOpg, selectedRnd, selectedNdb, opgDebitNotes } = hook;
  const onChange = (field: keyof typeof ndbFormData, value: string | number) =>
    setNdbFormData({ ...ndbFormData, [field]: value });

  const { remaining, excess } = validateDebitNoteAmount(
    ndbFormData.mon_ndb,
    selectedOpg,
    selectedRnd,
    opgDebitNotes,
    selectedNdb?.cod_ndb
  );

  return (
    <Modal.Body className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ndb-num">Nro. Nota de Débito</Label>
          <Input id="ndb-num" placeholder="Ej: ND-1234" value={ndbFormData.num_ndb}
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
          <Input id="ndb-ban" placeholder="Ej: BANESCO" value={ndbFormData.ban_ndb}
            onChange={(e) => onChange("ban_ndb", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="ndb-ref">Referencia</Label>
          <Input id="ndb-ref" placeholder="Ej: 98765432" value={ndbFormData.ref_ndb}
            onChange={(e) => onChange("ref_ndb", e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="ndb-mon">Monto Total (Bs.)</Label>
        <Input id="ndb-mon" type="number" step={0.01} value={ndbFormData.mon_ndb || ""}
          onChange={(e) => onChange("mon_ndb", parseFloat(e.target.value) || 0)}
          className={excess ? "border-red-500" : ""}
        />
        {excess && (
          <p className="text-xs text-red-500 mt-1 font-medium">
            !Atencion! Solo quedan Bs. {remaining.toLocaleString("es-VE")} Disponibles.
          </p>
        )}
      </div>
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
  const onChange = (field: keyof typeof drnFormData, value: string | number) =>
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
        <select id="drn-par" value={drnFormData.par_drn}
          onChange={(e) => onChange("par_drn", parseInt(e.target.value) || 0)}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
          <option value={0}>Seleccione partida</option>
          {partidas.map((p) => (
            <option key={p.cod_par} value={p.cod_par}>{p.num_par} — {p.nom_par}</option>
          ))}
        </select>
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
    orders, renditions, debitNotes, details,
    selectedOpg, setSelectedOpg,
    selectedRnd, setSelectedRnd,
    selectedNdb, setSelectedNdb,
    searchOpg, setSearchOpg,
    isRndCreateOpen, setIsRndCreateOpen, isRndEditOpen, setIsRndEditOpen, isRndDeleteOpen, setIsRndDeleteOpen,
    handleRndCreate, handleRndUpdate, handleRndDelete, setRndFormData,
    isNdbCreateOpen, setIsNdbCreateOpen, isNdbEditOpen, setIsNdbEditOpen, isNdbDeleteOpen, setIsNdbDeleteOpen,
    handleNdbCreate, handleNdbUpdate, handleNdbDelete, setNdbFormData,
    isDrnCreateOpen, setIsDrnCreateOpen, isDrnEditOpen, setIsDrnEditOpen, isDrnDeleteOpen, setIsDrnDeleteOpen,
    handleDrnCreate, handleDrnUpdate, handleDrnDelete, setDrnFormData, setSelectedDrn
  } = hook;

  const filteredOpg = orders.filter((o) => {
    const q = searchOpg.toLowerCase();
    return o.num_opg?.toString().includes(q) || o.nom_ctd?.toLowerCase().includes(q);
  });

  const rndColumns = [
    { header: "Nro. RND", key: "num_rnd" },
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
    { header: "Nro. Nota", key: "num_ndb" },
    { header: "Beneficiario", key: "nom_ben" },
    { header: "Monto (Bs.)", key: "mon_ndb", render: (item: DebitNoteItem) => Number(item.mon_ndb).toLocaleString("es-VE", { minimumFractionDigits: 2 }) },
    {
      header: "Acciones", key: "actions",
      render: (item: DebitNoteItem) => (
        <div className="flex gap-1">
          <button onClick={() => { setSelectedNdb(item); setNdbFormData(item); setIsNdbEditOpen(true); }} className="p-1 text-gray-500 hover:text-blue-500"><PencilIcon className="size-4" /></button>
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
  return (
    <>
      <PageMeta title="FUNDES - Rendiciones" description="Gestión administrativa para San Cristóbal" />
      <PageBreadcrumb pageTitle="Control de Rendiciones" />

      {!selectedOpg ? (
        <div className="animate-fadeIn">
          <ComponentCard title="Seleccione una Orden de Pago (OPG)">
            <div className="relative mb-6 max-w-md">
              <Input placeholder="Buscar por número o beneficiario..." className="pl-10" value={searchOpg} onChange={(e) => setSearchOpg(e.target.value)} />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredOpg.map((o) => (
                <button key={o.cod_opg} onClick={() => setSelectedOpg(o)}
                  className="flex flex-col text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 hover:shadow-lg transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-bold rounded-lg uppercase">OPG #{o.num_opg}</span>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Bs. {Number(o.mon_opg).toLocaleString()}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white mb-1">{o.nom_ctd} {o.ape_ctd}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-auto">
                    <span>Gestionar</span>
                    <AngleRightIcon className="size-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
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
                    className="text-white fill-current" />} onClick={() => { setRndFormData({ ...emptyRndForm, opg_rnd: selectedOpg.cod_opg }); setIsRndCreateOpen(true); }}>Nueva Rendición</Button>
              </div>
              <DataTable columns={rndColumns} data={renditions} />
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
                    } onClick={() => {
                      setNdbFormData({ ...emptyNdbForm, rnd_ndb: selectedRnd.cod_rnd });
                      setIsNdbCreateOpen(true);
                    }}
                  >
                    <span>Nueva Nota de Débito</span>
                  </Button>
                </div>
                <DataTable columns={ndbColumns} data={debitNotes} />
              </ComponentCard>
            )}

            {selectedNdb && (
              <ComponentCard title={`Detalles de Gasto — Nota #${selectedNdb.num_ndb}`}>
                <div className="mb-4">
                  <Button size="md"
                    variant="primary"
                    className="bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl px-6 py-2.5 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40"
                    startIcon={<PlusIcon style={{ width: '16px', height: '16px', display: 'block' }}
                      className="text-white fill-current" />} onClick={() => { setDrnFormData({ ...emptyDrnForm, cab_drn: selectedNdb.cod_ndb }); setIsDrnCreateOpen(true); }}>Agregar Detalle</Button>
                </div>
                <DataTable columns={drnColumns} data={details} />
              </ComponentCard>
            )}
          </div>
        </div>
      )}

      {/* MODALES: RENDICIÓN */}
      <Modal isOpen={isRndCreateOpen} onClose={() => setIsRndCreateOpen(false)}>
        <Modal.Header>Nueva Rendición</Modal.Header>
        <RndForm hook={hook} />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsRndCreateOpen(false)}>Cancelar</Button>
          <Button onClick={handleRndCreate}>Crear</Button>
        </Modal.Footer>
      </Modal>

      <Modal isOpen={isRndEditOpen} onClose={() => setIsRndEditOpen(false)}>
        <Modal.Header>Editar Rendición</Modal.Header>
        <RndForm hook={hook} />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsRndEditOpen(false)}>Cancelar</Button>
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
    </>
  );
}
