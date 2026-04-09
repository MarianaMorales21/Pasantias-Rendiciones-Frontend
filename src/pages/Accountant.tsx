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

// ─── Tipos e Interfaces ─────────────────────────────────────────────────────
interface AccountantItem {
  id: number;
  nombre: string;
  cedula: string;
  telefono: string;
  correo: string;
  estado: "Active" | "Pending" | "Cancel";
}

type AccountantFormData = Omit<AccountantItem, "id">;

interface AccountantFormProps {
  formData: AccountantFormData;
  onChange: (key: keyof AccountantFormData, value: string) => void;
}

const emptyForm: AccountantFormData = {
  nombre: "",
  cedula: "",
  telefono: "",
  correo: "",
  estado: "Active",
};

// ─── Componente de formulario (FUERA del padre para evitar pérdida de foco) ──
function AccountantForm({ formData, onChange }: AccountantFormProps) {
  return (
    <Modal.Body className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="f-nombre">Nombre Completo</Label>
          <Input
            id="f-nombre"
            placeholder="Ej: Pedro Pérez"
            value={formData.nombre}
            onChange={(e) => onChange("nombre", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="f-cedula">Cédula</Label>
          <Input
            id="f-cedula"
            placeholder="Ej: V-12.345.678"
            value={formData.cedula}
            onChange={(e) => onChange("cedula", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="f-telefono">Teléfono</Label>
          <Input
            id="f-telefono"
            placeholder="Ej: 0412-1234567"
            value={formData.telefono}
            onChange={(e) => onChange("telefono", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="f-correo">Correo Electrónico</Label>
          <Input
            id="f-correo"
            type="email"
            placeholder="Ej: pedro@gmail.com"
            value={formData.correo}
            onChange={(e) => onChange("correo", e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="f-estado">Estado</Label>
        <select
          id="f-estado"
          value={formData.estado}
          onChange={(e) => onChange("estado", e.target.value as AccountantFormData["estado"])}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="Active">Activo</option>
          <option value="Pending">Pendiente</option>
          <option value="Cancel">Inactivo</option>
        </select>
      </div>
    </Modal.Body>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────
export default function Accountant() {
  // --- Estados ---
  const [accountantData, setAccountantData] = useState<AccountantItem[]>([
    {
      id: 1,
      nombre: "Pedro Pérez",
      cedula: "V-11.222.333",
      telefono: "0414-1112233",
      correo: "pedro@fundes.org",
      estado: "Active",
    },
    {
      id: 2,
      nombre: "Marta Rodríguez",
      cedula: "V-9.888.777",
      telefono: "0424-4445566",
      correo: "marta@fundes.org",
      estado: "Pending",
    },
    {
      id: 3,
      nombre: "Luis Garcia",
      cedula: "V-15.666.222",
      telefono: "0412-7778899",
      correo: "luis@fundes.org",
      estado: "Active",
    },
  ]);

  const [search, setSearch] = useState("");
  const [selectedAccountant, setSelectedAccountant] = useState<AccountantItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<AccountantFormData>(emptyForm);

  // --- Búsqueda ---
  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return accountantData;
    return accountantData.filter(
      (a) =>
        a.nombre.toLowerCase().includes(q) ||
        a.cedula.toLowerCase().includes(q) ||
        a.correo.toLowerCase().includes(q)
    );
  }, [accountantData, search]);

  // --- Acciones ---
  const openCreateModal = () => {
    setFormData(emptyForm);
    setIsCreateModalOpen(true);
  };

  const handleCreate = () => {
    const newAccountant: AccountantItem = {
      id: Date.now(),
      ...formData,
    };
    setAccountantData((prev) => [...prev, newAccountant]);
    setIsCreateModalOpen(false);
  };

  const openEditModal = (accountant: AccountantItem) => {
    setSelectedAccountant(accountant);
    setFormData({
      nombre: accountant.nombre,
      cedula: accountant.cedula,
      telefono: accountant.telefono,
      correo: accountant.correo,
      estado: accountant.estado,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedAccountant) {
      setAccountantData((prev) =>
        prev.map((a) =>
          a.id === selectedAccountant.id
            ? { ...a, ...formData }
            : a
        )
      );
      setIsEditModalOpen(false);
    }
  };

  const openDeleteModal = (accountant: AccountantItem) => {
    setSelectedAccountant(accountant);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedAccountant) {
      setAccountantData((prev) => prev.filter((a) => a.id !== selectedAccountant.id));
      setIsDeleteModalOpen(false);
    }
  };

  const handleFieldChange = (key: keyof AccountantFormData, value: string) =>
    setFormData((p) => ({ ...p, [key]: value as AccountantFormData[keyof AccountantFormData] }));

  // --- Columnas ---
  const columns = [
    {
      header: "Cuentadante",
      key: "nombre",
      render: (item: AccountantItem) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 font-semibold text-sm">
            {item.nombre.charAt(0)}
          </div>
          <div>
            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
              {item.nombre}
            </span>
            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
              {item.cedula}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Contacto",
      key: "correo",
      render: (item: AccountantItem) => (
        <div>
          <span className="block text-gray-600 dark:text-gray-400 text-theme-sm">
            {item.correo}
          </span>
          <span className="block text-gray-400 text-theme-xs">
            {item.telefono}
          </span>
        </div>
      ),
    },
    {
      header: "Estado",
      key: "estado",
      render: (item: AccountantItem) => (
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
          {item.estado === "Active" ? "Activo" : item.estado === "Pending" ? "Pendiente" : "Inactivo"}
        </Badge>
      ),
    },
    {
      header: "Acciones",
      key: "actions",
      render: (item: AccountantItem) => (
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
        title="FUNDES - Rendiciones | Cuentadantes"
        description="Panel de administración de cuentadantes responsables"
      />

      <PageBreadcrumb pageTitle="Panel de Cuentadantes" />

      <div className="space-y-6">
        <ComponentCard title="Cuentadantes Registrados">
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              size="md"
              variant="primary"
              className="bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl px-6 py-2.5 
             /* Sombra inicial negra y notable */
             shadow-lg shadow-black/20 
             /* Animación */
             transition-all duration-300 ease-in-out
             /* Estado Hover: sube y la sombra se vuelve más profunda */
             hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40"
              startIcon={<UserCircleIcon className="size-5" />}
              onClick={openCreateModal}
            >
              Nuevo Cuentadante
            </Button>

            <div className="relative w-full sm:max-w-[350px]">
              <Input
                placeholder="Buscar por nombre, cédula o correo..."
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
              No se encontraron cuentadantes que coincidan con &quot;{search}&quot;.
            </p>
          ) : (
            <DataTable columns={columns} data={filteredData} />
          )}
        </ComponentCard>
      </div>

      {/* --- MODAL CREAR --- */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <Modal.Header>Nuevo Cuentadante</Modal.Header>
        <AccountantForm formData={formData} onChange={handleFieldChange} />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate}>
            Crear Cuentadante
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL EDITAR --- */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <Modal.Header>Editar Cuentadante</Modal.Header>
        <AccountantForm formData={formData} onChange={handleFieldChange} />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit}>
            Guardar Cambios
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
              ¿Eliminar a {selectedAccountant?.nombre}?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Esta acción eliminará permanentemente al cuentadante del sistema.
              Esta operación no se puede deshacer.
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
