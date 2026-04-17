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
import { OrderItem } from "../types/orders";
import { AccountantItem } from "../types/accountant";
import { StateItem } from "../types/state";

// ─── Tipos e Interfaces ──────────────────────────────────────────────────────

type OrderFormData = Omit<OrderItem, "cod_opg" | "nom_ctd" | "ape_ctd" | "nom_sta">;

interface OrderFormProps {
  formData: OrderFormData;
  onChange: (key: keyof OrderFormData, value: string | number) => void;
  cuentadantes: AccountantItem[];
  states: StateItem[];
}

const emptyForm: OrderFormData = {
  num_opg: 0,
  ced_ctd: "",
  fec_opg: new Date().toISOString().split("T")[0],
  fco_opg: new Date().toISOString().split("T")[0],
  asp_opg: "",
  dcr_opg: "",
  fdc_opg: new Date().toISOString().split("T")[0],
  mon_opg: "",
  sta_opg: 1, // Por defecto solemos usar el ID 1 o el que sea 'Pendiente'
};

// ─── Componente de formulario ────────────────────────────────────────────────
function OrderForm({ formData, onChange, cuentadantes, states }: OrderFormProps) {
  return (
    <Modal.Body className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="f-num">Nro. de Orden</Label>
          <Input
            id="f-num"
            type="number"
            placeholder="Ej: 123"
            value={formData.num_opg || ""}
            onChange={(e) => onChange("num_opg", parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="f-cuentadante">Cuentadante</Label>
          <select
            id="f-cuentadante"
            value={formData.ced_ctd}
            onChange={(e) => onChange("ced_ctd", e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="">Seleccione un cuentadante</option>
            {cuentadantes.map((c) => (
              <option key={c.ced_ctd} value={c.ced_ctd}>
                {c.nom_ctd} {c.ape_ctd} ({c.ced_ctd})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="f-fec">Fecha Orden</Label>
          <Input
            id="f-fec"
            type="date"
            value={formData.fec_opg ? formData.fec_opg.split('T')[0] : ""}
            onChange={(e) => onChange("fec_opg", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="f-fco">Fecha Control</Label>
          <Input
            id="f-fco"
            type="date"
            value={formData.fco_opg ? formData.fco_opg.split('T')[0] : ""}
            onChange={(e) => onChange("fco_opg", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="f-fdc">Fecha Cobro</Label>
          <Input
            id="f-fdc"
            type="date"
            value={formData.fdc_opg ? formData.fdc_opg.split('T')[0] : ""}
            onChange={(e) => onChange("fdc_opg", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="f-asp">Aspecto</Label>
        <Input
          id="f-asp"
          placeholder="Ej: ASP-000"
          value={formData.asp_opg}
          onChange={(e) => onChange("asp_opg", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="f-dcr">Numero de Retencion</Label>
        <textarea
          id="f-dcr"
          rows={3}
          placeholder="Numero de Retencion de la orden..."
          value={formData.dcr_opg}
          onChange={(e) => onChange("dcr_opg", e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="f-monto">Monto (Bs.)</Label>
          <Input
            id="f-monto"
            type="number"
            step={0.01}
            placeholder="Ej: 15000.00"
            value={formData.mon_opg}
            onChange={(e) => onChange("mon_opg", e.target.value)}
          />
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
      </div>
    </Modal.Body>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────
export default function Order() {
  const { data: orders, isLoading, handleCreate: apiCreateOrder, handleUpdate: apiUpdateOrder, handleDelete: apiDeleteOrder } = useOrders();
  const { accountantData } = useAccountants();
  const { data: states } = useStateData();

  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>(emptyForm);

  // --- Búsqueda ---
  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.num_opg?.toString().includes(q) ||
        o.nom_ctd?.toLowerCase().includes(q) ||
        o.ape_ctd?.toLowerCase().includes(q) ||
        o.dcr_opg?.toLowerCase().includes(q) ||
        o.fec_opg?.includes(q)
    );
  }, [orders, search]);

  // --- Acciones ---
  const openCreateModal = () => {
    setFormData(emptyForm);
    setIsCreateModalOpen(true);
  };

  const handleCreate = async () => {
    const success = await apiCreateOrder(formData);
    if (success) {
      setIsCreateModalOpen(false);
    }
  };

  const openEditModal = (order: OrderItem) => {
    setSelectedOrder(order);
    const { num_opg, ced_ctd, fec_opg, fco_opg, asp_opg, dcr_opg, fdc_opg, mon_opg, sta_opg } = order;
    setFormData({ num_opg, ced_ctd, fec_opg, fco_opg, asp_opg, dcr_opg, fdc_opg, mon_opg, sta_opg });
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
      const success = await apiDeleteOrder(selectedOrder.cod_opg);
      if (success) {
        setIsDeleteModalOpen(false);
      }
    }
  };

  const handleFieldChange = (key: keyof OrderFormData, value: string | number) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // --- Columnas ---
  const columns = [
    {
      header: "Nro. Orden",
      key: "num_opg",
      render: (item: OrderItem) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          #{item.num_opg}
        </span>
      ),
    },
    {
      header: "Cuentadante",
      key: "cuentadante",
      render: (item: OrderItem) => (
        <span className="text-gray-600 dark:text-gray-400 text-theme-sm">
          {item.nom_ctd} {item.ape_ctd}
        </span>
      ),
    },
    {
      header: "F. Orden",
      key: "fec_opg",
      render: (item: OrderItem) => (
        <span className="text-gray-600 dark:text-gray-400 text-theme-sm whitespace-nowrap">
          {item.fec_opg ? item.fec_opg.split('T')[0] : "N/A"}
        </span>
      ),
    },
    {
      header: "F. Control",
      key: "fco_opg",
      render: (item: OrderItem) => (
        <span className="text-gray-600 dark:text-gray-400 text-theme-sm whitespace-nowrap">
          {item.fco_opg ? item.fco_opg.split('T')[0] : "N/A"}
        </span>
      ),
    },
    {
      header: "Aspecto",
      key: "asp_opg",
      render: (item: OrderItem) => (
        <span className="text-gray-600 dark:text-gray-400 text-theme-sm">
          {item.asp_opg}
        </span>
      ),
    },
    {
      header: "N. Retencion",
      key: "dcr_opg",
      render: (item: OrderItem) => (
        <span className="text-gray-600 dark:text-gray-400 text-theme-sm max-w-[200px] truncate block" title={item.dcr_opg}>
          {item.dcr_opg}
        </span>
      ),
    },
    {
      header: "F. Cobro",
      key: "fdc_opg",
      render: (item: OrderItem) => (
        <span className="text-gray-600 dark:text-gray-400 text-theme-sm whitespace-nowrap">
          {item.fdc_opg ? item.fdc_opg.split('T')[0] : "N/A"}
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
              No se encontraron órdenes que coincidan con &quot;{search}&quot;.
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
    </>
  );
}
