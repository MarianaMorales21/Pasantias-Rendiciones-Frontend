import { useState, useMemo, useEffect } from "react";
import { userService } from "../services/userService";
import { UserItem } from "../types/user";
import { isApiError } from "../helpers/helpHttp";
import { useAuth } from "../context/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH_REGEX = /^.{8,}$/;

const emptyForm: UserItem = {
  ced_usu: "",
  nom_usu: "",
  ema_usu: "",
  cla_usu: "",
  rol_usu: 2, // Default
  sta_usu: 1, // Active
};

export function useUsers() {
  const { user: currentUser, logout } = useAuth();

  // --- Estados ---
  const [userData, setUserData] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldErrors = () => setFieldErrors({});

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Warning modal states (replaces all alert() calls)
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [isDeleteBlockedOpen, setIsDeleteBlockedOpen] = useState(false);
  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState("");

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

  // --- Validación compartida ---
  const validateForm = (isEdit: boolean): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.ced_usu) errors.ced_usu = "Este campo es requerido";
    if (!formData.nom_usu) errors.nom_usu = "Este campo es requerido";
    if (!formData.ema_usu) {
      errors.ema_usu = "Este campo es requerido";
    } else if (!EMAIL_REGEX.test(formData.ema_usu.trim())) {
      errors.ema_usu = "El formato de correo electrónico no es válido. Ej: usuario@dominio.com";
    }

    if (!isEdit) {
      // Crear: contraseña obligatoria
      if (!formData.cla_usu) {
        errors.cla_usu = "Este campo es requerido";
      } else if (!PASSWORD_MIN_LENGTH_REGEX.test(formData.cla_usu)) {
        errors.cla_usu = "La contraseña debe tener al menos 8 caracteres";
      }
    } else {
      // Editar: solo validar si se especificó
      if (formData.cla_usu && !PASSWORD_MIN_LENGTH_REGEX.test(formData.cla_usu)) {
        errors.cla_usu = "La contraseña debe tener al menos 8 caracteres";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Acciones ---
  const openCreateModal = () => {
    clearFieldErrors();
    setFormData(emptyForm);
    setIsCreateModalOpen(true);
  };

  const handleCreate = async () => {
    if (!validateForm(false)) return;

    try {
      const response = await userService.create(formData);
      if (isApiError(response)) throw new Error(response.statusText);
      fetchUsers();
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setWarningMessage("Error al crear usuario: " + message);
      setIsWarningModalOpen(true);
    }
  };

  const openEditModal = (user: UserItem) => {
    clearFieldErrors();
    setSelectedUser(user);
    setFormData({
      ...user,
      cla_usu: "", // Non-displayed password
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (selectedUser) {
      if (!validateForm(true)) return;

      try {
        const { ced_usu, ...data } = formData;
        // Logic: if password empty, don't send it
        if (!data.cla_usu) delete data.cla_usu;

        const response = await userService.update(ced_usu, data);
        if (isApiError(response)) throw new Error(response.statusText);
        fetchUsers();
        setIsEditModalOpen(false);

        // Si el usuario editado es el usuario logueado y se cambió a un estado no activo → cerrar sesión
        if (currentUser && ced_usu === currentUser.ced_usu) {
          // Estado activo suele ser sta_usu = 1
          if (formData.sta_usu !== 1) {
            await logout();
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setWarningMessage("Error al editar usuario: " + message);
        setIsWarningModalOpen(true);
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

        // Si el usuario eliminado es el usuario logueado → cerrar sesión
        if (currentUser && selectedUser.ced_usu === currentUser.ced_usu) {
          await logout();
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setIsDeleteModalOpen(false);
        setDeleteBlockedMessage(message);
        setIsDeleteBlockedOpen(true);
      }
    }
  };

  const handleFieldChange = <K extends keyof UserItem>(key: K, value: UserItem[K]) => {
    setFormData((p) => ({ ...p, [key]: value }));
    // Limpiar el error del campo cuando el usuario empieza a escribir
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  return {
    userData,
    loading,
    error,
    fieldErrors,
    clearFieldErrors,
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
    isWarningModalOpen,
    setIsWarningModalOpen,
    warningMessage,
    isDeleteBlockedOpen,
    setIsDeleteBlockedOpen,
    deleteBlockedMessage,
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
