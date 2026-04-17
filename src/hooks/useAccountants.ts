import { useState, useMemo, useEffect } from "react";
import { accountantService } from "../services/accountantService";
import { AccountantItem } from "../types/accountant";
import { isApiError } from "../helpers/helpHttp";

const emptyForm: AccountantItem = {
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

  const [search, setSearch] = useState("");
  const [selectedAccountant, setSelectedAccountant] = useState<AccountantItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
    setFormData(emptyForm);
    setIsCreateModalOpen(true);
  };

  const handleCreate = async () => {
    try {
      const response = await accountantService.create(formData);
      if (isApiError(response)) throw new Error(response.statusText);
      fetchAccountants();
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert("Error al crear cuentadante: " + message);
    }
  };

  const openEditModal = (accountant: AccountantItem) => {
    setSelectedAccountant(accountant);
    setFormData({ ...accountant });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (selectedAccountant) {
      try {
        const { ced_ctd, ...data } = formData;
        const response = await accountantService.update(ced_ctd, data);
        if (isApiError(response)) throw new Error(response.statusText);
        fetchAccountants();
        setIsEditModalOpen(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        alert("Error al editar cuentadante: " + message);
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
        const response = await accountantService.delete(selectedAccountant.ced_ctd);
        if (isApiError(response)) throw new Error(response.statusText);
        fetchAccountants();
        setIsDeleteModalOpen(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        alert("Error al eliminar cuentadante: " + message);
      }
    }
  };

  const handleFieldChange = <K extends keyof AccountantItem>(key: K, value: AccountantItem[K]) =>
    setFormData((p) => ({ ...p, [key]: value }));

  return {
    accountantData,
    loading,
    error,
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
