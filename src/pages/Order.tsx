import { useState, useMemo } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import DataTable from "../components/tables/BasicTables/BasicTableOne";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import Badge from "../components/ui/badge/Badge";
import { Modal } from "../components/ui/modal/index";
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  PencilIcon,
  TrashBinIcon,
} from "../icons";

import { useOrders } from "../hooks/useOrders";
import { useAccountants } from "../hooks/useAccountants";
import { useStateData } from "../hooks/useStateData";
import { useDepartures } from "../hooks/useDepartures";
import { OrderItem } from "../types/orders";
import { AccountantItem } from "../types/accountant";
import { StateItem } from "../types/state";
import { departureItem } from "../types/departure";

// ─── Tipos e Interfaces ──────────────────────────────────────────────────────

type OrderFormData = Omit<OrderItem, "cod_opg" | "nom_ctd" | "ape_ctd" | "nom_sta" | "num_par" | "nom_par">;

interface OrderFormProps {
  formData: OrderFormData;
  onChange: (key: keyof OrderFormData, value: string | number | null) => void;
  cuentadantes: AccountantItem[];
  states: StateItem[];
  partidas: departureItem[];
  fieldErrors?: Record<string, string>;
}

const emptyForm: OrderFormData = {
  num_opg: 0,
  ced_opg: "",
  fec_opg: new Date().toISOString().split("T")[0],
  fco_opg: "",
  fdc_opg: new Date().toISOString().split("T")[0],
  dcr_opg: "",
  mon_opg: "",
  con_opg: "",
  sta_opg: 1, // Por defecto solemos usar el ID 1 o el que sea 'Pendiente'
  par_opg: 0,
};

// ─── Componente de formulario ────────────────────────────────────────────────
function OrderForm({ formData, onChange, cuentadantes, states, partidas, fieldErrors = {} }: OrderFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const futureDateEmision = formData.fec_opg && formData.fec_opg > today;
  const futureDateCobro = formData.fco_opg && formData.fco_opg > today;
  const cobroAntesDeEmision = formData.fco_opg && formData.fec_opg && formData.fco_opg < formData.fec_opg;
  const decretoPosteriorAEmision = formData.fdc_opg && formData.fec_opg && formData.fdc_opg > formData.fec_opg;

  return (
    <Modal.Body className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="f-num">Nro. de Orden</Label>
          <Input
            id="f-num"
            type="number"
            placeholder="Ej: 123"
            value={formData.num_opg || ""}
            onChange={(e) => onChange("num_opg", parseInt(e.target.value) || 0)}
            className={fieldErrors.num_opg ? "border-red-500" : ""}
          />
          {fieldErrors.num_opg && (
            <p className="text-xs text-red-500 mt-1 font-medium">Este campo no puede faltar.</p>
          )}
        </div>
        <div>
          <Label htmlFor="f-monto">Monto (Bs.)</Label>
          <Input
            id="f-monto"
            type="number"
            step={0.01}
            placeholder="Ej: 15000.00"
            value={formData.mon_opg}
            onChange={(e) => onChange("mon_opg", e.target.value)}
            className={fieldErrors.mon_opg ? "border-red-500" : ""}
          />
          {fieldErrors.mon_opg && (
            <p className="text-xs text-red-500 mt-1 font-medium">Este campo no puede faltar.</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="f-cuentadante">Cuentadante</Label>
          <select
            id="f-cuentadante"
            value={formData.ced_opg}
            onChange={(e) => onChange("ced_opg", e.target.value)}
            className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${fieldErrors.ced_opg ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="">Seleccione un cuentadante</option>
            {cuentadantes.map((c) => (
              <option key={c.ced_ctd} value={c.ced_ctd}>
                {c.nom_ctd} {c.ape_ctd} ({c.ced_ctd})
              </option>
            ))}
          </select>
          {fieldErrors.ced_opg && (
            <p className="text-xs text-red-500 mt-1 font-medium">Este campo no puede faltar.</p>
          )}
        </div>

        <div>
          <Label htmlFor="f-fec">Fecha Emisión</Label>
          <Input
            id="f-fec"
            type="date"
            value={formData.fec_opg ? formData.fec_opg.split('T')[0] : ""}
            onChange={(e) => onChange("fec_opg", e.target.value)}
            className={futureDateEmision || fieldErrors.fec_opg ? "border-red-500" : ""}
          />
          {futureDateEmision && (
            <p className="text-xs text-red-500 mt-1 font-medium">
              La fecha de emisión no puede ser posterior a hoy.
            </p>
          )}
          {fieldErrors.fec_opg && !futureDateEmision && (
            <p className="text-xs text-red-500 mt-1 font-medium">Este campo no puede faltar.</p>
          )}
        </div>
        <div>
          <Label htmlFor="f-fco">Fecha Cobro (Opcional)</Label>
          <Input
            id="f-fco"
            type="date"
            value={formData.fco_opg ? formData.fco_opg.split('T')[0] : ""}
            onChange={(e) => onChange("fco_opg", e.target.value)}
            className={futureDateCobro || cobroAntesDeEmision ? "border-red-500" : ""}
          />
          {futureDateCobro && (
            <p className="text-xs text-red-500 mt-1 font-medium">
              La fecha de cobro no puede ser posterior a hoy.
            </p>
          )}
          {cobroAntesDeEmision && (
            <p className="text-xs text-red-500 mt-1 font-medium">
              La fecha de cobro no puede ser anterior a la fecha de emisión.
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="f-fdc">Fecha Decreto</Label>
          <Input
            id="f-fdc"
            type="date"
            value={formData.fdc_opg ? formData.fdc_opg.split('T')[0] : ""}
            onChange={(e) => onChange("fdc_opg", e.target.value)}
            className={decretoPosteriorAEmision || fieldErrors.fdc_opg ? "border-red-500" : ""}
          />
          {decretoPosteriorAEmision && (
            <p className="text-xs text-red-500 mt-1 font-medium">
              La fecha de decreto no puede ser posterior a la fecha de emisión.
            </p>
          )}
          {fieldErrors.fdc_opg && !decretoPosteriorAEmision && (
            <p className="text-xs text-red-500 mt-1 font-medium">Este campo no puede faltar.</p>
          )}
        </div>
        <div>
          <Label htmlFor="f-dcr">Nro. Decreto</Label>
          <Input
            id="f-dcr"
            type="text"
            placeholder="Ej: DEC-2024"
            value={formData.dcr_opg || ""}
            onChange={(e) => onChange("dcr_opg", e.target.value)}
            className={fieldErrors.dcr_opg ? "border-red-500" : ""}
          />
          {fieldErrors.dcr_opg && (
            <p className="text-xs text-red-500 mt-1 font-medium">Este campo no puede faltar.</p>
          )}
        </div>

        <div>
          <Label htmlFor="f-par">Partida Presupuestaria</Label>
          <select
            id="f-par"
            value={formData.par_opg}
            onChange={(e) => onChange("par_opg", parseInt(e.target.value) || 0)}
            className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${fieldErrors.par_opg ? "border-red-500" : "border-gray-300"}`}
          >
            <option value={0}>Seleccione partida</option>
            {partidas.filter(p => p.nom_par?.toLowerCase().includes('orden de pago')).map((p) => (
              <option key={p.cod_par} value={p.cod_par}>
                {p.num_par} — {p.nom_par}
              </option>
            ))}
          </select>
          {fieldErrors.par_opg && (
            <p className="text-xs text-red-500 mt-1 font-medium">Este campo no puede faltar.</p>
          )}
        </div>
        <div>
          <Label htmlFor="f-estado">Estado</Label>
          <select
            id="f-estado"
            value={formData.sta_opg}
            onChange={(e) => onChange("sta_opg", parseInt(e.target.value))}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value={0}>Seleccione un estado</option>
            {states.map((s) => (
              <option key={s.cod_sta} value={s.cod_sta}>
                {s.nom_sta}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="f-con">Concepto</Label>
          <textarea
            id="f-con"
            rows={2}
            className={`w-full rounded-lg border bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${fieldErrors.con_opg ? "border-red-500" : "border-gray-300"}`}
            value={formData.con_opg}
            onChange={(e) => onChange("con_opg", e.target.value)}
          />
          {fieldErrors.con_opg && (
            <p className="text-xs text-red-500 mt-1 font-medium">Este campo no puede faltar.</p>
          )}
        </div>
      </div>
    </Modal.Body>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────
export default function Order() {
  const { data: orders, isLoading, fieldErrors, clearFieldErrors, handleCreate: apiCreateOrder, handleUpdate: apiUpdateOrder, handleDelete: apiDeleteOrder } = useOrders();
  const { accountantData } = useAccountants();
  const { data: allStates } = useStateData();
  const states = allStates.filter(
    (s) => s.nom_sta === "Pagado" || s.nom_sta === "Pendiente"
  );
  const { departures: partidas } = useDepartures();

  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteBlockedOpen, setIsDeleteBlockedOpen] = useState(false);
  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState("");
  const [formData, setFormData] = useState<OrderFormData>(emptyForm);

  // --- Búsqueda ---
  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.cod_opg?.toString().includes(q) ||
        o.num_opg?.toString().includes(q) ||
        o.nom_ctd?.toLowerCase().includes(q) ||
        o.ape_ctd?.toLowerCase().includes(q) ||
        o.ced_opg?.includes(q) ||
        o.fec_opg?.includes(q)
    );
  }, [orders, search]);

  // --- Acciones ---
  const openCreateModal = () => {
    clearFieldErrors();
    const pendiente = states.find((s) => s.nom_sta === "Pendiente");
    setFormData({ ...emptyForm, sta_opg: pendiente ? pendiente.cod_sta : emptyForm.sta_opg });
    setIsCreateModalOpen(true);
  };

  const handleCreate = async () => {
    const success = await apiCreateOrder(formData);
    if (success) {
      setIsCreateModalOpen(false);
    }
  };

  const openEditModal = (order: OrderItem) => {
    clearFieldErrors();
    setSelectedOrder(order);
    const { num_opg, ced_opg, fec_opg, fco_opg, fdc_opg, dcr_opg, mon_opg, con_opg, sta_opg, par_opg } = order;
    setFormData({ num_opg, ced_opg, fec_opg, fco_opg, fdc_opg, dcr_opg, mon_opg, con_opg, sta_opg, par_opg });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (selectedOrder) {
      const success = await apiUpdateOrder(selectedOrder.cod_opg, formData);
      if (success) {
        setIsEditModalOpen(false);
      }
    }
  };

  const openDeleteModal = (order: OrderItem) => {
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedOrder) {
      const result = await apiDeleteOrder(selectedOrder.cod_opg);
      if (result.success) {
        setIsDeleteModalOpen(false);
      } else {
        setIsDeleteModalOpen(false);
        setDeleteBlockedMessage(result.error || "No se puede eliminar la orden.");
        setIsDeleteBlockedOpen(true);
      }
    }
  };

  const handleFieldChange = (key: keyof OrderFormData, value: string | number | null) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // --- Columnas ---
  const columns = [
    {
      header: "Nro. Orden",
      key: "num_opg",
      render: (item: OrderItem) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-bold text-sm">
            {item.cod_opg}
          </div>
          <div>
            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
              Nro. {item.num_opg}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Cuentadante",
      key: "cuentadante",
      render: (item: OrderItem) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-semibold text-sm">
            {item.nom_ctd ? item.nom_ctd.charAt(0).toUpperCase() : "C"}
          </div>
          <div>
            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
              {item.nom_ctd} {item.ape_ctd}
            </span>
            <span className="block text-gray-500 dark:text-gray-400 text-xs">
              V-{item.ced_opg}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "F. Emisión",
      key: "fec_opg",
      render: (item: OrderItem) => (
        <span className="text-gray-600 dark:text-gray-400 text-theme-sm whitespace-nowrap">
          {item.fec_opg ? item.fec_opg.split('T')[0] : "N/A"}
        </span>
      ),
    },
    {
      header: "Monto",
      key: "mon_opg",
      render: (item: OrderItem) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          Bs. {item.mon_opg ? parseFloat(item.mon_opg).toLocaleString('es-VE', { minimumFractionDigits: 2 }) : "0,00"}
        </span>
      ),
    },
    {
      header: "Estado",
      key: "sta_opg",
      render: (item: OrderItem) => {
        const color = item.nom_sta?.toLowerCase().includes("pagado") ? "success" :
          item.nom_sta?.toLowerCase().includes("pendiente") ? "warning" : "error";
        return (
          <Badge size="sm" color={color}>
            {item.nom_sta || "Desconocido"}
          </Badge>
        );
      },
    },
    {
      header: "Acciones",
      key: "actions",
      render: (item: OrderItem) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(item)}
            className="p-1.5 text-gray-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
          >
            <PencilIcon className="size-5" />
          </button>
          <button
            onClick={() => openDeleteModal(item)}
            className="p-1.5 text-gray-500 hover:text-error-500 dark:hover:text-error-400 transition-colors"
          >
            <TrashBinIcon className="size-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta
        title="FUNDES - Rendiciones | Ordenes de Pago"
        description="Panel de administración de órdenes de pago"
      />

      <PageBreadcrumb pageTitle="Panel de Ordenes de Pago" />

      <div className="space-y-6">
        <ComponentCard title="Ordenes de Pago Registradas">
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              size="md"
              variant="primary"
              className="bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl px-6 py-2.5 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40"
              startIcon={<UserCircleIcon className="size-5" />}
              onClick={openCreateModal}
            >
              Nueva Orden
            </Button>

            <div className="relative w-full sm:max-w-[350px]">
              <Input
                placeholder="Buscar orden, cuentadante o descripción..."
                type="text"
                className="pl-[62px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-2 text-gray-500 dark:border-gray-800">
                <MagnifyingGlassIcon className="size-5" />
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
            </div>
          ) : filteredData.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No se encontraron órdenes que coincidan con "{search}".
            </p>
          ) : (
            <DataTable columns={columns} data={filteredData} />
          )}
        </ComponentCard>
      </div>

      {/* --- MODAL CREAR --- */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <Modal.Header>Nueva Orden de Pago</Modal.Header>
        <OrderForm
          formData={formData}
          onChange={handleFieldChange}
          cuentadantes={accountantData || []}
          states={states || []}
          partidas={partidas || []}
          fieldErrors={fieldErrors}
        />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creando..." : "Crear Orden"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL EDITAR --- */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <Modal.Header>Editar Orden de Pago</Modal.Header>
        <OrderForm
          formData={formData}
          onChange={handleFieldChange}
          cuentadantes={accountantData || []}
          states={states || []}
          partidas={partidas || []}
          fieldErrors={fieldErrors}
        />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit} disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL ELIMINAR --- */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <Modal.Header>Confirmar Eliminación</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20">
              <TrashBinIcon className="size-7" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              ¿Eliminar la orden #{selectedOrder?.num_opg}?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Esta acción eliminará permanentemente la orden del sistema y no se puede deshacer.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            No, mantener
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 text-white hover:bg-red-700 font-medium"
          >
            {isLoading ? "Eliminando..." : "Sí, eliminar"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL ELIMINACIÓN BLOQUEADA --- */}
      <Modal isOpen={isDeleteBlockedOpen} onClose={() => setIsDeleteBlockedOpen(false)}>
        <Modal.Header>Operación no permitida</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Eliminación no disponible
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {deleteBlockedMessage}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors w-full"
            onClick={() => setIsDeleteBlockedOpen(false)}
          >
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
