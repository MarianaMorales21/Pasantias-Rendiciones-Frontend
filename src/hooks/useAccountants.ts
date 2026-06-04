import { useState, useMemo, useEffect } from "react";
import { accountantService } from "../services/accountantService";
import { AccountantItem } from "../types/accountant";
import { isApiError } from "../helpers/helpHttp";

const emptyForm: AccountantItem = {
  cod_ctd: 0,
  ced_ctd: "",
  ape_ctd: "",
  nom_ctd: "",
  dir_ctd: "",
  sta_ctd: 1,
};

export function useAccountants() {
  // --- Estados ---
  const [accountantData, setAccountantData] = useState<AccountantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldErrors = () => setFieldErrors({});

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.ced_ctd) errors.ced_ctd = "Este campo es requerido";
    if (!formData.nom_ctd) errors.nom_ctd = "Este campo es requerido";
    if (!formData.ape_ctd) errors.ape_ctd = "Este campo es requerido";
    if (!formData.dir_ctd) errors.dir_ctd = "Este campo es requerido";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [search, setSearch] = useState("");
  const [selectedAccountant, setSelectedAccountant] = useState<AccountantItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteBlockedOpen, setIsDeleteBlockedOpen] = useState(false);
  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState("");
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [formData, setFormData] = useState<AccountantItem>(emptyForm);

  // --- Carga de Datos ---
  const fetchAccountants = async () => {
    setLoading(true);
    try {
      const response = await accountantService.getAll();
      if (isApiError(response)) {
        throw new Error(response.statusText || "Error al cargar cuentadantes");
      }
      setAccountantData(response);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountants();
  }, []);

  // --- Búsqueda ---
  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return accountantData;
    return accountantData.filter(
      (a) =>
        a.nom_ctd.toLowerCase().includes(q) ||
        a.ape_ctd.toLowerCase().includes(q) ||
        a.ced_ctd.toLowerCase().includes(q) ||
        a.dir_ctd.toLowerCase().includes(q)
    );
  }, [accountantData, search]);

  // --- Acciones ---
  const openCreateModal = () => {
    clearFieldErrors();
    setFormData(emptyForm);
    setIsCreateModalOpen(true);
  };

  const handleCreate = async () => {
    if (!validateFields()) return;
    const numPart = formData.ced_ctd.replace(/^V-?/i, "").trim();
    if (!/^\d{1,8}$/.test(numPart)) {
      setFieldErrors({ ced_ctd: "La cédula debe contener solo números (máximo 8 dígitos)" });
      return;
    }
    // Auto-prefix V- a la cédula si no lo tiene
    const cedulaNormalizada = formData.ced_ctd.startsWith("V-")
      ? formData.ced_ctd
      : `V-${formData.ced_ctd.replace(/^V-?/i, "")}`;
    try {
      const response = await accountantService.create({ ...formData, ced_ctd: cedulaNormalizada });
      if (isApiError(response)) throw new Error(response.statusText);
      fetchAccountants();
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setWarningMessage(message);
      setIsWarningModalOpen(true);
    }
  };

  const openEditModal = (accountant: AccountantItem) => {
    clearFieldErrors();
    setSelectedAccountant(accountant);
    setFormData({ ...accountant });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (selectedAccountant) {
      if (!validateFields()) return;
      const numPart = formData.ced_ctd.replace(/^V-?/i, "").trim();
      if (!/^\d{1,8}$/.test(numPart)) {
        setFieldErrors({ ced_ctd: "La cédula debe contener solo números (máximo 8 dígitos)" });
        return;
      }
      try {
        const nuevaCedula = formData.ced_ctd.startsWith("V-")
          ? formData.ced_ctd
          : `V-${formData.ced_ctd.replace(/^V-?/i, "")}`;
        const response = await accountantService.update(selectedAccountant.cod_ctd, {
          ...formData,
          ced_ctd: nuevaCedula,
        });
        if (isApiError(response)) throw new Error(response.statusText);
        fetchAccountants();
        setIsEditModalOpen(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setWarningMessage(message);
        setIsWarningModalOpen(true);
      }
    }
  };

  const openDeleteModal = (accountant: AccountantItem) => {
    setSelectedAccountant(accountant);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedAccountant) {
      try {
        const response = await accountantService.delete(selectedAccountant.cod_ctd);
        if (isApiError(response)) throw new Error(response.statusText);
        fetchAccountants();
        setIsDeleteModalOpen(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setIsDeleteModalOpen(false);
        setDeleteBlockedMessage(message);
        setIsDeleteBlockedOpen(true);
      }
    }
  };

  const handleFieldChange = <K extends keyof AccountantItem>(key: K, value: AccountantItem[K]) =>
    setFormData((p) => ({ ...p, [key]: value }));

  return {
    accountantData,
    loading,
    error,
    fieldErrors,
    clearFieldErrors,
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
    setWarningMessage,
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
