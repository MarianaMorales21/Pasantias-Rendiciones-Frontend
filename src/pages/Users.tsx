import { } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import DataTable from "../components/tables/BasicTables/BasicTableOne";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import Badge from "../components/ui/badge/Badge";
import { Modal } from "../components/ui/modal/index";
import { useUsers } from "../hooks/useUsers";
import { UserItem } from "../types/user";
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  PencilIcon,
  TrashBinIcon,
} from "../icons";

// --- Mapeos de Roles y Estados ---
const rolesMap: Record<number, string> = {
  1: "Administrador",
  2: "Coordinador",
  3: "Cuentadante",
};

const statesMap: Record<number, string> = {
  1: "Activo",
  2: "Inactivo",
  3: "Pendiente",
};

// ─── Componente de formulario ────────────────────────────────────────────────
interface UserFormProps {
  formData: FormData;
  onChange: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  editMode?: boolean;
}

function UserForm({ formData, onChange, editMode = false }: UserFormProps) {
  return (
    <Modal.Body className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="f-nombre">Nombre completo</Label>
          <Input
            id="f-nombre"
            placeholder="Ej: Juan Pérez"
            value={formData.nom_usu}
            onChange={(e) => onChange("nom_usu", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="f-cedula">Cédula</Label>
          <Input
            id="f-cedula"
            placeholder="Ej: 12345678"
            value={formData.ced_usu}
            onChange={(e) => onChange("ced_usu", e.target.value)}
            disabled={editMode}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="f-email">Correo electrónico</Label>
          <Input
            id="f-email"
            type="email"
            placeholder="Ej: jperez@fundes.com"
            value={formData.ema_usu}
            onChange={(e) => onChange("ema_usu", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="f-rol">Rol</Label>
          <select
            id="f-rol"
            value={formData.rol_usu}
            onChange={(e) => onChange("rol_usu", parseInt(e.target.value))}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value={1}>Administrador</option>
            <option value={2}>Coordinador</option>
            <option value={3}>Cuentadante</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="f-password">
            {editMode ? "Nueva contraseña" : "Contraseña"}
          </Label>
          <Input
            id="f-password"
            type="password"
            autoComplete="new-password"
            value={formData.cla_usu}
            onChange={(e) => onChange("cla_usu", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="f-estado">Estado</Label>
          <select
            id="f-estado"
            value={formData.sta_usu}
            onChange={(e) => onChange("sta_usu", parseInt(e.target.value))}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value={1}>Activo</option>
            <option value={2}>Inactivo</option>
            <option value={3}>Pendiente</option>
          </select>
        </div>
      </div>
    </Modal.Body>
  );
}

// UserItem type is now imported from ../types/user

type FormData = UserItem;



export default function Users() {
  const {
    loading,
    error,
    search,
    setSearch,
    filteredData,
    selectedUser,
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
  } = useUsers();

  // --- Helpers ---
  const rolColor = (rolId: number) => {
    const map: Record<number, "primary" | "success" | "warning"> = {
      1: "primary", // Administrador
      2: "warning", // Coordinador
      3: "success", // Cuentadante
    };
    return map[rolId] || "primary";
  };

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
      header: "Usuario",
      key: "nom_usu",
      render: (item: UserItem) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 font-semibold text-sm">
            {item.nom_usu.charAt(0)}
          </div>
          <div>
            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
              {item.nom_usu}
            </span>
            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
              {item.ced_usu}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Correo",
      key: "ema_usu",
      render: (item: UserItem) => (
        <span className="text-gray-600 dark:text-gray-400 text-theme-sm">
          {item.ema_usu}
        </span>
      ),
    },
    {
      header: "Rol",
      key: "rol_usu",
      render: (item: UserItem) => (
        <Badge size="sm" color={rolColor(item.rol_usu)}>
          {item.rol_nom || rolesMap[item.rol_usu]}
        </Badge>
      ),
    },
    {
      header: "Estado",
      key: "sta_usu",
      render: (item: UserItem) => (
        <Badge size="sm" color={statusColor(item.sta_usu)}>
          {item.nom_sta || statesMap[item.sta_usu]}
        </Badge>
      ),
    },
    {
      header: "Acciones",
      key: "actions",
      render: (item: UserItem) => (
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
        title="FUNDES - Rendiciones | Usuarios"
        description="Panel de administración de usuarios del sistema"
      />
      <PageBreadcrumb pageTitle="Panel de Usuarios" />

      <div className="space-y-6">
        <ComponentCard title="Usuarios Registrados">
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
              Nuevo Usuario
            </Button>

            <div className="relative w-full sm:max-w-[350px]">
              <Input
                placeholder="Buscar usuario, cédula o correo..."
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
            <div className="py-12 text-center text-sm text-gray-500">Cargando usuarios...</div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-red-500">Error: {error}</div>
          ) : filteredData.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No se encontraron usuarios que coincidan con &quot;{search}&quot;.
            </p>
          ) : (
            <DataTable columns={columns} data={filteredData} />
          )}
        </ComponentCard>
      </div>

      {/* --- MODAL CREAR --- */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <Modal.Header>Nuevo Usuario</Modal.Header>
        <UserForm formData={formData} onChange={handleFieldChange} />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate}>
            Crear Usuario
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL EDITAR --- */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <Modal.Header>Editar Usuario</Modal.Header>
        <UserForm formData={formData} onChange={handleFieldChange} editMode />
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
              ¿Eliminar a {selectedUser?.nom_usu}?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Esta acción eliminará permanentemente al usuario del sistema.
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