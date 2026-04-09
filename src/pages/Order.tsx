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

// ─── Tipos e Interfaces ──────────────────────────────────────────────────────
interface OrderItem {
  id: number;
  nroOrden: string;
  fecha: string;
  beneficiario: string;
  monto: string;
  estado: "Active" | "Pending" | "Cancel";
}

// Nombre explícito para evitar colisión con el built-in `FormData` del navegador
type OrderFormData = {
  nroOrden: string;
  fecha: string;
  beneficiario: string;
  monto: string;
  estado: "Active" | "Pending" | "Cancel";
};

interface OrderFormProps {
  formData: OrderFormData;
  onChange: (key: keyof OrderFormData, value: string) => void;
}

const emptyForm: OrderFormData = {
  nroOrden: "",
  fecha: new Date().toISOString().split("T")[0],
  beneficiario: "",
  monto: "",
  estado: "Active",
};

// ─── Componente de formulario (FUERA del padre para evitar pérdida de foco) ──
function OrderForm({ formData, onChange }: OrderFormProps) {
  return (
    <Modal.Body className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="f-nro">Nro. de Orden</Label>
          <Input
            id="f-nro"
            placeholder="Ej: ORD-001"
            value={formData.nroOrden}
            onChange={(e) => onChange("nroOrden", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="f-fecha">Fecha</Label>
          <Input
            id="f-fecha"
            type="date"
            value={formData.fecha}
            onChange={(e) => onChange("fecha", e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="f-beneficiario">Beneficiario</Label>
        <Input
          id="f-beneficiario"
          placeholder="Ej: Cooperativa El Sol"
          value={formData.beneficiario}
          onChange={(e) => onChange("beneficiario", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="f-monto">Monto (Bs.)</Label>
          <Input
            id="f-monto"
            placeholder="Ej: 15.000,00"
            value={formData.monto}
            onChange={(e) => onChange("monto", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="f-estado">Estado</Label>
          <select
            id="f-estado"
            value={formData.estado}
            onChange={(e) => onChange("estado", e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="Active">Pagado</option>
            <option value="Pending">Pendiente</option>
            <option value="Cancel">Anulado</option>
          </select>
        </div>
      </div>
    </Modal.Body>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────
export default function Order() {
  const [orderData, setOrderData] = useState<OrderItem[]>([
    { id: 1, nroOrden: "ORD-001", fecha: "2024-03-20", beneficiario: "María González", monto: "500.000",   estado: "Active"  },
    { id: 2, nroOrden: "ORD-002", fecha: "2024-03-21", beneficiario: "José Ramírez",   monto: "350.000",   estado: "Pending" },
    { id: 3, nroOrden: "ORD-003", fecha: "2024-03-22", beneficiario: "Ana Pérez",      monto: "750.000",   estado: "Active"  },
    { id: 4, nroOrden: "ORD-004", fecha: "2024-03-23", beneficiario: "Carlos López",   monto: "1.200.000", estado: "Cancel"  },
  ]);

  const [search, setSearch]                 = useState("");
  const [selectedOrder, setSelectedOrder]   = useState<OrderItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen,   setIsEditModalOpen]   = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData]             = useState<OrderFormData>(emptyForm);

  // --- Búsqueda ---
  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return orderData;
    return orderData.filter(
      (o) =>
        o.nroOrden.toLowerCase().includes(q) ||
        o.beneficiario.toLowerCase().includes(q) ||
        o.fecha.includes(q)
    );
  }, [orderData, search]);

  // --- Acciones ---
  const openCreateModal = () => {
    setFormData(emptyForm);
    setIsCreateModalOpen(true);
  };

  const handleCreate = () => {
    const newOrder: OrderItem = { id: Date.now(), ...formData };
    setOrderData((prev) => [...prev, newOrder]);
    setIsCreateModalOpen(false);
  };

  const openEditModal = (order: OrderItem) => {
    setSelectedOrder(order);
    const { nroOrden, fecha, beneficiario, monto, estado } = order;
    setFormData({ nroOrden, fecha, beneficiario, monto, estado });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedOrder) {
      setOrderData((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, ...formData } : o))
      );
      setIsEditModalOpen(false);
    }
  };

  const openDeleteModal = (order: OrderItem) => {
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedOrder) {
      setOrderData((prev) => prev.filter((o) => o.id !== selectedOrder.id));
      setIsDeleteModalOpen(false);
    }
  };

  const handleFieldChange = (key: keyof OrderFormData, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value as OrderFormData[keyof OrderFormData] }));

  // --- Columnas ---
  const columns = [
    {
      header: "Nro. Orden",
      key: "nroOrden",
      render: (item: OrderItem) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          #{item.nroOrden}
        </span>
      ),
    },
    {
      header: "Beneficiario",
      key: "beneficiario",
      render: (item: OrderItem) => (
        <span className="text-gray-600 dark:text-gray-400 text-theme-sm">
          {item.beneficiario}
        </span>
      ),
    },
    {
      header: "Fecha",
      key: "fecha",
      render: (item: OrderItem) => (
        <span className="text-gray-600 dark:text-gray-400 text-theme-sm">
          {item.fecha}
        </span>
      ),
    },
    {
      header: "Estado",
      key: "estado",
      render: (item: OrderItem) => (
        <Badge
          size="sm"
          color={
            item.estado === "Active"
              ? "success"
              : item.estado === "Pending"
                ? "warning"
                : "error"
          }
        >
          {item.estado === "Active" ? "Pagado" : item.estado === "Pending" ? "Pendiente" : "Anulado"}
        </Badge>
      ),
    },
    {
      header: "Monto",
      key: "monto",
      render: (item: OrderItem) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          Bs. {item.monto}
        </span>
      ),
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
                placeholder="Buscar orden, beneficiario o fecha..."
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

          {filteredData.length === 0 ? (
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
        <OrderForm formData={formData} onChange={handleFieldChange} />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate}>Crear Orden</Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL EDITAR --- */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <Modal.Header>Editar Orden de Pago</Modal.Header>
        <OrderForm formData={formData} onChange={handleFieldChange} />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
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
              ¿Eliminar la orden {selectedOrder?.nroOrden}?
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
          <button
            onClick={handleDelete}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Sí, eliminar
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
