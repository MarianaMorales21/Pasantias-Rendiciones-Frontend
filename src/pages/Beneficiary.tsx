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

// ─── Tipos e Interfaces al inicio ──────────────
interface BeneficiaryItem {
  id: number;
  nombre: string;
  cedula: string;
  image: string;
  programa: string;
  estado: "Active" | "Pending" | "Cancel";
  monto: string;
}

type BeneficiaryFormData = Omit<BeneficiaryItem, "id" | "image">;

interface BeneficiaryFormProps {
  formData: BeneficiaryFormData;
  onChange: (key: keyof BeneficiaryFormData, value: string) => void;
}

const emptyForm: BeneficiaryFormData = {
  nombre: "",
  cedula: "",
  programa: "",
  estado: "Active",
  monto: "",
};

// ─── Componente de formulario ───────────────────────
function BeneficiaryForm({ formData, onChange }: BeneficiaryFormProps) {
  return (
    <Modal.Body className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="f-nombre">Nombre completo</Label>
          <Input
            id="f-nombre"
            placeholder="Ej: María González"
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
          <Label htmlFor="f-programa">Programa</Label>
          <Input
            id="f-programa"
            placeholder="Ej: Programa Alimentario"
            value={formData.programa}
            onChange={(e) => onChange("programa", e.target.value)}
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
            <option value="Active">Activo</option>
            <option value="Pending">Pendiente</option>
            <option value="Cancel">Cancelado</option>
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="f-monto">Monto (Bs.)</Label>
        <Input
          id="f-monto"
          placeholder="Ej: 500.000"
          value={formData.monto}
          onChange={(e) => onChange("monto", e.target.value)}
        />
      </div>
    </Modal.Body>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────
export default function Beneficiary() {
  // --- Estados ---
  const [beneficiaryData, setBeneficiaryData] = useState<BeneficiaryItem[]>([
    {
      id: 1,
      nombre: "María González",
      cedula: "V-12.345.678",
      image: "/images/user/user-17.jpg",
      programa: "Programa Alimentario",
      estado: "Active",
      monto: "500.000",
    },
    {
      id: 2,
      nombre: "José Ramírez",
      cedula: "V-9.876.543",
      image: "/images/user/user-18.jpg",
      programa: "Apoyo Educativo",
      estado: "Pending",
      monto: "350.000",
    },
    {
      id: 3,
      nombre: "Ana Pérez",
      cedula: "V-15.432.100",
      image: "/images/user/user-17.jpg",
      programa: "Asistencia Médica",
      estado: "Active",
      monto: "750.000",
    },
    {
      id: 4,
      nombre: "Carlos López",
      cedula: "V-7.654.321",
      image: "/images/user/user-20.jpg",
      programa: "Vivienda Digna",
      estado: "Cancel",
      monto: "1.200.000",
    },
  ]);

  const [search, setSearch] = useState("");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<BeneficiaryItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<BeneficiaryFormData>(emptyForm);

  // --- Búsqueda ---
  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return beneficiaryData;
    return beneficiaryData.filter(
      (b) =>
        b.nombre.toLowerCase().includes(q) ||
        b.cedula.toLowerCase().includes(q) ||
        b.programa.toLowerCase().includes(q)
    );
  }, [beneficiaryData, search]);

  // --- Acciones ---
  const openCreateModal = () => {
    setFormData(emptyForm);
    setIsCreateModalOpen(true);
  };

  const handleCreate = () => {
    const newBeneficiary: BeneficiaryItem = {
      id: Date.now(),
      image: "/images/user/user-17.jpg", // Imagen por defecto
      ...formData,
    };
    setBeneficiaryData((prev) => [...prev, newBeneficiary]);
    setIsCreateModalOpen(false);
  };

  const openEditModal = (beneficiary: BeneficiaryItem) => {
    setSelectedBeneficiary(beneficiary);
    const { nombre, cedula, programa, estado, monto } = beneficiary;
    setFormData({ nombre, cedula, programa, estado, monto });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedBeneficiary) {
      setBeneficiaryData((prev) =>
        prev.map((b) =>
          b.id === selectedBeneficiary.id
            ? { ...b, ...formData }
            : b
        )
      );
      setIsEditModalOpen(false);
    }
  };

  const openDeleteModal = (beneficiary: BeneficiaryItem) => {
    setSelectedBeneficiary(beneficiary);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedBeneficiary) {
      setBeneficiaryData((prev) => prev.filter((b) => b.id !== selectedBeneficiary.id));
      setIsDeleteModalOpen(false);
    }
  };

  const handleFieldChange = (key: keyof BeneficiaryFormData, value: string) =>
    setFormData((p) => ({ ...p, [key]: value as BeneficiaryFormData[keyof BeneficiaryFormData] }));

  // --- Columnas ---
  const columns = [
    {
      header: "Beneficiario",
      key: "nombre",
      render: (item: BeneficiaryItem) => (
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
      header: "Programa",
      key: "programa",
      render: (item: BeneficiaryItem) => (
        <span className="text-gray-600 dark:text-gray-400 text-theme-sm">
          {item.programa}
        </span>
      ),
    },
    {
      header: "Estado",
      key: "estado",
      render: (item: BeneficiaryItem) => (
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
          {item.estado}
        </Badge>
      ),
    },
    {
      header: "Monto",
      key: "monto",
      render: (item: BeneficiaryItem) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          Bs. {item.monto}
        </span>
      ),
    },
    {
      header: "Acciones",
      key: "actions",
      render: (item: BeneficiaryItem) => (
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
        title="FUNDES - Rendiciones | Beneficiarios"
        description="Panel de administración de beneficiarios y programas"
      />

      <PageBreadcrumb pageTitle="Panel de Beneficiarios" />

      <div className="space-y-6">
        <ComponentCard title="Beneficiarios Registrados">
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
              Nuevo Beneficiario
            </Button>

            <div className="relative w-full sm:max-w-[350px]">
              <Input
                placeholder="Buscar beneficiario, cédula o programa..."
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
              No se encontraron beneficiarios que coincidan con &quot;{search}&quot;.
            </p>
          ) : (
            <DataTable columns={columns} data={filteredData} />
          )}
        </ComponentCard>
      </div>

      {/* --- MODAL CREAR --- */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <Modal.Header>Nuevo Beneficiario</Modal.Header>
        <BeneficiaryForm formData={formData} onChange={handleFieldChange} />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate}>
            Crear Beneficiario
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL EDITAR --- */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <Modal.Header>Editar Beneficiario</Modal.Header>
        <BeneficiaryForm formData={formData} onChange={handleFieldChange} />
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
              ¿Eliminar a {selectedBeneficiary?.nombre}?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Esta acción eliminará permanentemente al beneficiario del sistema.
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
