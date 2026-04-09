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
interface ProgramItem {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  presupuesto: string;
  estado: "Active" | "Pending" | "Cancel";
}

type ProgramFormData = {
  nombre: string;
  codigo: string;
  descripcion: string;
  presupuesto: string;
  estado: "Active" | "Pending" | "Cancel";
};

interface ProgramFormProps {
  formData: ProgramFormData;
  onChange: (key: keyof ProgramFormData, value: string) => void;
}

const emptyForm: ProgramFormData = {
  nombre: "",
  codigo: "",
  descripcion: "",
  presupuesto: "",
  estado: "Active",
};

// ─── Componente de formulario (FUERA del padre para evitar pérdida de foco) ──
function ProgramForm({ formData, onChange }: ProgramFormProps) {
  return (
    <Modal.Body className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="f-nombre">Nombre del Programa</Label>
          <Input
            id="f-nombre"
            placeholder="Ej: Programa Alimentario"
            value={formData.nombre}
            onChange={(e) => onChange("nombre", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="f-codigo">Código</Label>
          <Input
            id="f-codigo"
            placeholder="Ej: PROG-001"
            value={formData.codigo}
            onChange={(e) => onChange("codigo", e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="f-descripcion">Descripción</Label>
        <Input
          id="f-descripcion"
          placeholder="Ej: Asistencia alimentaria a familias vulnerables"
          value={formData.descripcion}
          onChange={(e) => onChange("descripcion", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="f-presupuesto">Presupuesto (Bs.)</Label>
          <Input
            id="f-presupuesto"
            placeholder="Ej: 10.000.000"
            value={formData.presupuesto}
            onChange={(e) => onChange("presupuesto", e.target.value)}
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
            <option value="Cancel">Inactivo</option>
          </select>
        </div>
      </div>
    </Modal.Body>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────
export default function Programs() {
  const [programData, setProgramData] = useState<ProgramItem[]>([
    { id: 1, nombre: "Programa Alimentario",  codigo: "PROG-001", descripcion: "Asistencia alimentaria a familias",    presupuesto: "10.000.000", estado: "Active"  },
    { id: 2, nombre: "Apoyo Educativo",       codigo: "PROG-002", descripcion: "Becas y útiles para estudiantes",      presupuesto: "5.500.000",  estado: "Active"  },
    { id: 3, nombre: "Asistencia Médica",     codigo: "PROG-003", descripcion: "Cobertura médica a comunidades",       presupuesto: "8.200.000",  estado: "Pending" },
    { id: 4, nombre: "Vivienda Digna",        codigo: "PROG-004", descripcion: "Mejoras de infraestructura habitacional", presupuesto: "15.000.000", estado: "Cancel" },
  ]);

  const [search, setSearch]                   = useState("");
  const [selectedProgram, setSelectedProgram] = useState<ProgramItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen,   setIsEditModalOpen]   = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData]               = useState<ProgramFormData>(emptyForm);

  // --- Búsqueda ---
  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return programData;
    return programData.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q)
    );
  }, [programData, search]);

  // --- Acciones ---
  const openCreateModal = () => {
    setFormData(emptyForm);
    setIsCreateModalOpen(true);
  };

  const handleCreate = () => {
    const newProgram: ProgramItem = { id: Date.now(), ...formData };
    setProgramData((prev) => [...prev, newProgram]);
    setIsCreateModalOpen(false);
  };

  const openEditModal = (program: ProgramItem) => {
    setSelectedProgram(program);
    setFormData({
      nombre:      program.nombre,
      codigo:      program.codigo,
      descripcion: program.descripcion,
      presupuesto: program.presupuesto,
      estado:      program.estado,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedProgram) {
      setProgramData((prev) =>
        prev.map((p) => (p.id === selectedProgram.id ? { ...p, ...formData } : p))
      );
      setIsEditModalOpen(false);
    }
  };

  const openDeleteModal = (program: ProgramItem) => {
    setSelectedProgram(program);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedProgram) {
      setProgramData((prev) => prev.filter((p) => p.id !== selectedProgram.id));
      setIsDeleteModalOpen(false);
    }
  };

  const handleFieldChange = (key: keyof ProgramFormData, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // --- Columnas ---
  const columns = [
    {
      header: "Programa",
      key: "nombre",
      render: (item: ProgramItem) => (
        <div>
          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
            {item.nombre}
          </span>
          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
            {item.codigo}
          </span>
        </div>
      ),
    },
    {
      header: "Descripción",
      key: "descripcion",
      render: (item: ProgramItem) => (
        <span className="text-gray-600 dark:text-gray-400 text-theme-sm">
          {item.descripcion}
        </span>
      ),
    },
    {
      header: "Estado",
      key: "estado",
      render: (item: ProgramItem) => (
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
      header: "Presupuesto",
      key: "presupuesto",
      render: (item: ProgramItem) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          Bs. {item.presupuesto}
        </span>
      ),
    },
    {
      header: "Acciones",
      key: "actions",
      render: (item: ProgramItem) => (
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
        title="FUNDES - Rendiciones | Programas"
        description="Panel de administración de programas"
      />

      <PageBreadcrumb pageTitle="Panel de Programas" />

      <div className="space-y-6">
        <ComponentCard title="Programas Registrados">
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              size="md"
              variant="primary"
              className="bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl px-6 py-2.5 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40"
              startIcon={<UserCircleIcon className="size-5" />}
              onClick={openCreateModal}
            >
              Nuevo Programa
            </Button>

            <div className="relative w-full sm:max-w-[350px]">
              <Input
                placeholder="Buscar programa o código..."
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
              No se encontraron programas que coincidan con &quot;{search}&quot;.
            </p>
          ) : (
            <DataTable columns={columns} data={filteredData} />
          )}
        </ComponentCard>
      </div>

      {/* --- MODAL CREAR --- */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <Modal.Header>Nuevo Programa</Modal.Header>
        <ProgramForm formData={formData} onChange={handleFieldChange} />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate}>Crear Programa</Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL EDITAR --- */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <Modal.Header>Editar Programa</Modal.Header>
        <ProgramForm formData={formData} onChange={handleFieldChange} />
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
              ¿Eliminar &quot;{selectedProgram?.nombre}&quot;?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Esta acción eliminará permanentemente el programa del sistema y no se puede deshacer.
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
