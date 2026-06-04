
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import DataTable from "../components/tables/BasicTables/BasicTableOne";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import Badge from "../components/ui/badge/Badge";
import { Modal } from "../components/ui/modal/index";
import { useAccountants } from "../hooks/useAccountants";
import { useStateData } from "../hooks/useStateData";
import { useAuth } from "../context/AuthContext";
import { AccountantItem } from "../types/accountant";
import { StateItem } from "../types/state";
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  PencilIcon,
  TrashBinIcon,
} from "../icons";

// ─── Componente de formulario ────────────────────────────────────────────────
interface AccountantFormProps {
  formData: AccountantItem;
  onChange: <K extends keyof AccountantItem>(key: K, value: AccountantItem[K]) => void;
  editMode?: boolean;
  states: StateItem[];
  fieldErrors?: Record<string, string>;
}

function AccountantForm({ formData, onChange, editMode = false, states, fieldErrors = {} }: AccountantFormProps) {
  const { user } = useAuth();
  const isAdmin = user?.rol_usu === 1;
  return (
    <Modal.Body className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="f-cedula">Cédula</Label>
          <Input
            id="f-cedula"
            placeholder="Ej: 12345678 (se agregará V- automáticamente)"
            value={formData.ced_ctd}
            onChange={(e) => onChange("ced_ctd", e.target.value)}
            disabled={editMode && !isAdmin}
            className={fieldErrors.ced_ctd ? "border-red-500" : ""}
          />
          {fieldErrors.ced_ctd && (
            <p className="text-xs text-red-500 mt-1 font-medium">Este campo no puede faltar.</p>
          )}
        </div>
        <div>
          <Label htmlFor="f-nombre">Nombre</Label>
          <Input
            id="f-nombre"
            placeholder="Ej: Pedro"
            value={formData.nom_ctd}
            onChange={(e) => onChange("nom_ctd", e.target.value)}
            className={fieldErrors.nom_ctd ? "border-red-500" : ""}
          />
          {fieldErrors.nom_ctd && (
            <p className="text-xs text-red-500 mt-1 font-medium">Este campo no puede faltar.</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="f-apellido">Apellido</Label>
          <Input
            id="f-apellido"
            placeholder="Ej: Pérez"
            value={formData.ape_ctd}
            onChange={(e) => onChange("ape_ctd", e.target.value)}
            className={fieldErrors.ape_ctd ? "border-red-500" : ""}
          />
          {fieldErrors.ape_ctd && (
            <p className="text-xs text-red-500 mt-1 font-medium">Este campo no puede faltar.</p>
          )}
        </div>
        <div>
          <Label htmlFor="f-direccion">Dirección</Label>
          <Input
            id="f-direccion"
            placeholder="Ej: Av. Bolívar 123"
            value={formData.dir_ctd}
            onChange={(e) => onChange("dir_ctd", e.target.value)}
            className={fieldErrors.dir_ctd ? "border-red-500" : ""}
          />
          {fieldErrors.dir_ctd && (
            <p className="text-xs text-red-500 mt-1 font-medium">Este campo no puede faltar.</p>
          )}
        </div>
      </div>
      {(!editMode && !isAdmin) ? null : (
        <div>
          <Label htmlFor="f-estado">Estado</Label>
          <select
            id="f-estado"
            value={formData.sta_ctd}
            onChange={(e) => onChange("sta_ctd", parseInt(e.target.value))}
            disabled={editMode && !isAdmin}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value={0}>Seleccione estado</option>
            {states.map((s) => (
              <option key={s.cod_sta} value={s.cod_sta}>{s.nom_sta}</option>
            ))}
          </select>
        </div>
      )}
    </Modal.Body>
  );
}



// ─── Página Principal ────────────────────────────────────────────────────────
export default function Accountant() {
  const {

    loading,
    error,
    fieldErrors,
    search,
    setSearch,
    filteredData,
    selectedAccountant,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeleteBlockedOpen,
    setIsDeleteBlockedOpen,
    deleteBlockedMessage,
    isWarningModalOpen,
    setIsWarningModalOpen,
    warningMessage,
    formData,
    openCreateModal,
    handleCreate,
    openEditModal,
    handleSaveEdit,
    openDeleteModal,
    handleDelete,
    handleFieldChange,
  } = useAccountants();

  const { data: allStates } = useStateData();
  const accountantStates = allStates.filter(
    (s) => s.nom_sta === "Activo" || s.nom_sta === "Suspendido" || s.nom_sta === "Inactivo"
  );

  const statusColor = (nom_sta: string | undefined) => {
    if (nom_sta === "Activo") return "success";
    if (nom_sta === "Inactivo") return "error";
    if (nom_sta === "Suspendido") return "warning";
    return "warning";
  };

  // --- Columnas ---
  const columns = [
    {
      header: "Cuentadante",
      key: "nom_ctd",
      render: (item: AccountantItem) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-semibold text-sm">
            {item.nom_ctd.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
              {item.nom_ctd} {item.ape_ctd}
            </span>
            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
              {item.ced_ctd}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Dirección",
      key: "dir_ctd",
      render: (item: AccountantItem) => (
        <span className="text-gray-600 dark:text-gray-400 text-theme-sm">
          {item.dir_ctd}
        </span>
      ),
    },
    {
      header: "Estado",
      key: "nom_sta",
      render: (item: AccountantItem) => (
        <Badge size="sm" color={statusColor(item.nom_sta)}>
          {item.nom_sta}
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
             shadow-lg shadow-black/20 
             transition-all duration-300 ease-in-out
             hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40"
              startIcon={<UserCircleIcon className="size-5" />}
              onClick={openCreateModal}
            >
              Nuevo Cuentadante
            </Button>

            <div className="relative w-full sm:max-w-[350px]">
              <Input
                placeholder="Buscar por nombre, apellido, cédula o dirección..."
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
            <div className="py-12 text-center text-sm text-gray-500">Cargando cuentadantes...</div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-red-500">Error: {error}</div>
          ) : filteredData.length === 0 ? (
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
        <AccountantForm formData={formData} onChange={handleFieldChange} states={accountantStates} fieldErrors={fieldErrors} />
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
        <AccountantForm formData={formData} onChange={handleFieldChange} editMode states={accountantStates} fieldErrors={fieldErrors} />
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
              ¿Eliminar a {selectedAccountant?.nom_ctd} {selectedAccountant?.ape_ctd}?
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
              Cuentadante vinculado a otros registros
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

      {/* --- MODAL WARNING --- */}
      <Modal isOpen={isWarningModalOpen} onClose={() => setIsWarningModalOpen(false)}>
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
            onClick={() => setIsWarningModalOpen(false)}
          >
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
