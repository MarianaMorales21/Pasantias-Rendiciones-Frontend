import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import DataTable from "../components/tables/BasicTables/BasicTableOne";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import { Modal } from "../components/ui/modal/index";
import { useDepartures } from "../hooks/useDepartures";
import { departureItem } from "../types/departure";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashBinIcon,
  PlusIcon,
} from "../icons";

// ─── Componente de formulario ────────────────────────────────────────────────
interface DepartureFormProps {
  formData: departureItem;
  onChange: <K extends keyof departureItem>(key: K, value: departureItem[K]) => void;
  fieldErrors?: Record<string, string>;
}

function DepartureForm({ formData, onChange, fieldErrors = {} }: DepartureFormProps) {
  return (
    <Modal.Body className="space-y-4">
      <div>
        <Label htmlFor="f-numero">Número de Partida</Label>
        <Input
          id="f-numero"
          placeholder="Ej: 4.01.01.01.01"
          value={formData.num_par}
          onChange={(e) => onChange("num_par", e.target.value)}
          className={fieldErrors.num_par ? "border-red-500" : ""}
          autoComplete="off"
        />
        {fieldErrors.num_par && (
          <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.num_par}</p>
        )}
      </div>
      <div>
        <Label htmlFor="f-nombre">Nombre de la Partida</Label>
        <Input
          id="f-nombre"
          placeholder="Ej: Sueldos y Salarios"
          value={formData.nom_par}
          onChange={(e) => onChange("nom_par", e.target.value)}
          className={fieldErrors.nom_par ? "border-red-500" : ""}
          autoComplete="off"
        />
        {fieldErrors.nom_par && (
          <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.nom_par}</p>
        )}
      </div>
    </Modal.Body>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────
export default function Departures() {
  const {
    isLoading,
    error,
    fieldErrors,
    search,
    setSearch,
    filteredData,
    selectedDeparture,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeleteBlockedOpen,
    setIsDeleteBlockedOpen,
    deleteBlockedMessage,
    formData,
    openCreateModal,
    handleCreate,
    openEditModal,
    handleUpdate,
    openDeleteModal,
    handleDelete,
    handleFieldChange,
  } = useDepartures();

  // --- Columnas ---
  const columns = [
    {
      header: "Código",
      key: "cod_par",
      render: (item: departureItem) => (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-bold text-sm">
          {item.cod_par}
        </div>
      ),
    },
    {
      header: "Número de Partida",
      key: "num_par",
      render: (item: departureItem) => (
        <span className="block font-semibold text-gray-800 text-theme-sm dark:text-white/90">
          {item.num_par}
        </span>
      ),
    },
    {
      header: "Nombre de Partida",
      key: "nom_par",
      render: (item: departureItem) => (
        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
          {item.nom_par}
        </span>
      ),
    },
    {
      header: "Acciones",
      key: "actions",
      render: (item: departureItem) => (
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
        title="FUNDES - Rendiciones | Partidas"
        description="Panel de administración de partidas presupuestarias"
      />

      <PageBreadcrumb pageTitle="Panel de Partidas Presupuestarias" />

      <div className="space-y-6">
        <ComponentCard title="Partidas Presupuestarias Registradas">
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              size="md"
              variant="primary"
              className="bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl px-6 py-2.5 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40"
              startIcon={<PlusIcon className="size-5" />}
              onClick={openCreateModal}
            >
              Nueva Partida
            </Button>

            <div className="relative w-full sm:max-w-[350px]">
              <Input
                placeholder="Buscar partida o código..."
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

          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">Cargando partidas...</div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-red-500">Error: {error}</div>
          ) : filteredData.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No se encontraron partidas presupuestarias que coincidan con &quot;{search}&quot;.
            </p>
          ) : (
            <DataTable columns={columns} data={filteredData} />
          )}
        </ComponentCard>
      </div>

      {/* --- MODAL CREAR --- */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <Modal.Header>Nueva Partida Presupuestaria</Modal.Header>
        <DepartureForm formData={formData} onChange={handleFieldChange} fieldErrors={fieldErrors} />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate}>Crear Partida</Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL EDITAR --- */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <Modal.Header>Editar Partida Presupuestaria</Modal.Header>
        <DepartureForm formData={formData} onChange={handleFieldChange} fieldErrors={fieldErrors} />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleUpdate}>Guardar Cambios</Button>
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
              ¿Eliminar partida &quot;{selectedDeparture?.num_par}&quot;?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Esta acción eliminará permanentemente la partida <strong>{selectedDeparture?.nom_par}</strong> del sistema y no se puede deshacer.
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

      {/* --- MODAL ELIMINACIÓN BLOQUEADA --- */}
      <Modal isOpen={isDeleteBlockedOpen} onClose={() => setIsDeleteBlockedOpen(false)}>
        <Modal.Header>Eliminación no permitida</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Partida Vinculada a Documentos
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
