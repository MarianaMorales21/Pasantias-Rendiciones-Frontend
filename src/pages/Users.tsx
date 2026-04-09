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

// ─── Componente de formulario FUERA del componente padre ───────────────────────
// Definirlo dentro causaba que React lo desmontara en cada render al escribir.
interface UserFormProps {
  formData: FormData;
  onChange: (key: keyof FormData, value: string) => void;
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
          <Label htmlFor="f-username">Nombre de usuario</Label>
          <Input
            id="f-username"
            placeholder="Ej: jperez"
            value={formData.nombreUsuario}
            onChange={(e) => onChange("nombreUsuario", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="f-rol">Rol</Label>
          <select
            id="f-rol"
            value={formData.rol}
            onChange={(e) => onChange("rol", e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="Administrador">Administrador</option>
            <option value="Contador">Contador</option>
            <option value="Analista">Analista</option>
            <option value="Supervisor">Supervisor</option>
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="f-password">
          {editMode ? "Nueva contraseña" : "Contraseña"}
        </Label>
        <Input
          id="f-password"
          type="password"
          placeholder={editMode ? "Dejar en blanco para no cambiar" : "Contraseña"}
          value={formData.password}
          onChange={(e) => onChange("password", e.target.value)}
        />
      </div>
    </Modal.Body>
  );
}

interface UserItem {
  id: number;
  nombre: string;
  cedula: string;
  nombreUsuario: string;
  password: string;
  rol: "Administrador" | "Contador" | "Analista" | "Supervisor";
}

type FormData = Omit<UserItem, "id">;

const emptyForm: FormData = {
  nombre: "",
  cedula: "",
  nombreUsuario: "",
  password: "",
  rol: "Analista",
};

export default function Users() {
  const [userData, setUserData] = useState<UserItem[]>([
    { id: 1, nombre: "Lindsey Curtis", cedula: "V-12.345.678", nombreUsuario: "lcurtis", password: "hash1", rol: "Administrador" },
    { id: 2, nombre: "Kaiya George", cedula: "V-9.876.543", nombreUsuario: "kgeorge", password: "hash2", rol: "Contador" },
    { id: 3, nombre: "Zain Geidt", cedula: "V-15.432.100", nombreUsuario: "zgeidt", password: "hash3", rol: "Analista" },
    { id: 4, nombre: "Abram Schleifer", cedula: "V-7.654.321", nombreUsuario: "aschleifer", password: "hash4", rol: "Supervisor" },
  ]);

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  // --- Búsqueda ---
  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return userData;
    return userData.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q) ||
        u.cedula.toLowerCase().includes(q) ||
        u.nombreUsuario.toLowerCase().includes(q) ||
        u.rol.toLowerCase().includes(q)
    );
  }, [userData, search]);

  // --- Acciones ---
  const openCreateModal = () => {
    setFormData(emptyForm);
    setIsCreateModalOpen(true);
  };

  const handleCreate = () => {
    const newUser: UserItem = {
      id: Date.now(),
      ...formData,
    };
    setUserData((prev) => [...prev, newUser]);
    setIsCreateModalOpen(false);
  };

  const openEditModal = (user: UserItem) => {
    setSelectedUser(user);
    setFormData({
      nombre: user.nombre,
      cedula: user.cedula,
      nombreUsuario: user.nombreUsuario,
      password: "",
      rol: user.rol,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedUser) {
      setUserData((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
              ...u,
              nombre: formData.nombre,
              cedula: formData.cedula,
              nombreUsuario: formData.nombreUsuario,
              rol: formData.rol,
              ...(formData.password ? { password: formData.password } : {}),
            }
            : u
        )
      );
      setIsEditModalOpen(false);
    }
  };

  const openDeleteModal = (user: UserItem) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedUser) {
      setUserData((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setIsDeleteModalOpen(false);
    }
  };

  // --- Helpers ---
  const rolColor = (rol: UserItem["rol"]) => {
    const map: Record<UserItem["rol"], "success" | "warning" | "info" | "primary"> = {
      Administrador: "primary",
      Contador: "success",
      Analista: "info",
      Supervisor: "warning",
    };
    return map[rol];
  };

  // --- Columnas ---
  const columns = [
    {
      header: "Usuario",
      key: "nombre",
      render: (item: UserItem) => (
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
      header: "Nombre de Usuario",
      key: "nombreUsuario",
      render: (item: UserItem) => (
        <span className="font-mono text-gray-600 dark:text-gray-400 text-theme-sm">
          @{item.nombreUsuario}
        </span>
      ),
    },
    {
      header: "Contraseña",
      key: "password",
      render: () => (
        <span className="text-gray-400 text-theme-sm tracking-widest">••••••••</span>
      ),
    },
    {
      header: "Rol",
      key: "rol",
      render: (item: UserItem) => (
        <Badge size="sm" color={rolColor(item.rol)}>
          {item.rol}
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

  const handleFieldChange = (key: keyof FormData, value: string) =>
    setFormData((p) => ({ ...p, [key]: value }));

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
             /* Sombra inicial negra y notable */
             shadow-lg shadow-black/20 
             /* Animación */
             transition-all duration-300 ease-in-out
             /* Estado Hover: sube y la sombra se vuelve más profunda */
             hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40"
              startIcon={<UserCircleIcon className="size-5" />}
              onClick={openCreateModal}
            >
              Nuevo Usuario
            </Button>

            <div className="relative w-full sm:max-w-[350px]">
              <Input
                placeholder="Buscar usuario, cédula o rol..."
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
              ¿Eliminar a {selectedUser?.nombre}?
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