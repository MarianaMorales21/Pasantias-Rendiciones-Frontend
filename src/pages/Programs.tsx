import {  } from "react"; // O simplemente eliminar si no hay otros imports de react
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import DataTable from "../components/tables/BasicTables/BasicTableOne";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import Badge from "../components/ui/badge/Badge";
import { Modal } from "../components/ui/modal/index";
import { usePrograms } from "../hooks/usePrograms";
import { ProgramsItem } from "../types/programs";
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  PencilIcon,
  TrashBinIcon,
} from "../icons";

// --- Mapeos de Estados ---
const statesMap: Record<number, string> = {
  1: "Activo",
  2: "Inactivo",
  3: "Pendiente",
};

// ─── Componente de formulario ────────────────────────────────────────────────
interface ProgramFormProps {
  formData: ProgramsItem;
  onChange: <K extends keyof ProgramsItem>(key: K, value: ProgramsItem[K]) => void;
}

function ProgramForm({ formData, onChange }: ProgramFormProps) {
  return (
    <Modal.Body className="space-y-4">
      <div>
        <Label htmlFor="f-nombre">Nombre del Programa</Label>
        <Input
          id="f-nombre"
          placeholder="Ej: Programa Alimentario"
          value={formData.nom_pro}
          onChange={(e) => onChange("nom_pro", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="f-estado">Estado</Label>
        <select
          id="f-estado"
          value={formData.sta_pro}
          onChange={(e) => onChange("sta_pro", parseInt(e.target.value))}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value={1}>Activo</option>
          <option value={2}>Inactivo</option>
          <option value={3}>Pendiente</option>
        </select>
      </div>
    </Modal.Body>
  );
}



// ─── Página Principal ────────────────────────────────────────────────────────
export default function Programs() {
  const {
    loading,
    error,
    search,
    setSearch,
    filteredData,
    selectedProgram,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    formData,
    openCreateModal,
    handleCreate,
    openEditModal,
    handleSaveEdit,
    openDeleteModal,
    handleDelete,
    handleFieldChange,
  } = usePrograms();

  const statusColor = (statusId: number) => {
    const map: Record<number, "success" | "error" | "warning"> = {
      1: "success", // Activo
      2: "error",   // Inactivo
      3: "warning", // Pendiente
    };
    return map[statusId] || "warning";
  };

  // --- Columnas ---
  const columns = [
    {
      header: "Código",
      key: "cod_pro",
      render: (item: ProgramsItem) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          #{item.cod_pro}
        </span>
      ),
    },
    {
      header: "Programa",
      key: "nom_pro",
      render: (item: ProgramsItem) => (
        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
          {item.nom_pro}
        </span>
      ),
    },
    {
      header: "Estado",
      key: "sta_pro",
      render: (item: ProgramsItem) => (
        <Badge size="sm" color={statusColor(item.sta_pro)}>
          {item.nom_sta || statesMap[item.sta_pro]}
        </Badge>
      ),
    },
    {
      header: "Acciones",
      key: "actions",
      render: (item: ProgramsItem) => (
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
                autoComplete="off"
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-2 text-gray-500 dark:border-gray-800">
                <MagnifyingGlassIcon className="size-5" />
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-gray-500">Cargando programas...</div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-red-500">Error: {error}</div>
          ) : filteredData.length === 0 ? (
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
              ¿Eliminar &quot;{selectedProgram?.nom_pro}&quot;?
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
