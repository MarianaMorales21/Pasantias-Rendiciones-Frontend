import { useState, useMemo, useEffect } from "react";
import { userService } from "../services/userService";
import { UserItem } from "../types/user";
import { isApiError } from "../helpers/helpHttp";

const emptyForm: UserItem = {
  ced_usu: "",
  nom_usu: "",
  ema_usu: "",
  cla_usu: "",
  rol_usu: 2, // Default
  sta_usu: 1, // Active
};

export function useUsers() {
  const [userData, setUserData] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<UserItem>(emptyForm);

  // --- Carga de Datos ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAll();
      if (isApiError(response)) {
        throw new Error(response.statusText || "Error al cargar usuarios");
      }
      setUserData(response);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Búsqueda ---
  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return userData;
    return userData.filter(
      (u) =>
        u.nom_usu.toLowerCase().includes(q) ||
        u.ced_usu.toLowerCase().includes(q) ||
        u.ema_usu.toLowerCase().includes(q)
    );
  }, [userData, search]);

  // --- Acciones ---
  const openCreateModal = () => {
    setFormData(emptyForm);
    setIsCreateModalOpen(true);
  };

  const handleCreate = async () => {
    try {
      const response = await userService.create(formData);
      if (isApiError(response)) throw new Error(response.statusText);
      fetchUsers();
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert("Error al crear usuario: " + message);
    }
  };

  const openEditModal = (user: UserItem) => {
    setSelectedUser(user);
    setFormData({
      ...user,
      cla_usu: "", // Non-displayed password
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (selectedUser) {
      try {
        const { ced_usu, ...data } = formData;
        // Logic: if password empty, don't send it
        if (!data.cla_usu) delete data.cla_usu;

        const response = await userService.update(ced_usu, data);
        if (isApiError(response)) throw new Error(response.statusText);
        fetchUsers();
        setIsEditModalOpen(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        alert("Error al editar usuario: " + message);
      }
    }
  };

  const openDeleteModal = (user: UserItem) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedUser) {
      try {
        const response = await userService.delete(selectedUser.ced_usu);
        if (isApiError(response)) throw new Error(response.statusText);
        fetchUsers();
        setIsDeleteModalOpen(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        alert("Error al eliminar usuario: " + message);
      }
    }
  };

  const handleFieldChange = <K extends keyof UserItem>(key: K, value: UserItem[K]) =>
    setFormData((p) => ({ ...p, [key]: value }));

  return {
    userData,
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
  };
}
