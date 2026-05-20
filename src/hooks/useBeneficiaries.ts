import { useState, useMemo, useEffect } from "react";
import { beneficiaryService } from "../services/beneficiaryService";
import { BeneficiaryItem } from "../types/beneficiary";
import { isApiError } from "../helpers/helpHttp";

const emptyForm: BeneficiaryItem = {
  rif_ben: "",
  nom_ben: "",
  dir_ben: "",
  sta_ben: 1,
};

export function useBeneficiaries() {
  // --- Estados ---
  const [beneficiaryData, setBeneficiaryData] = useState<BeneficiaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<BeneficiaryItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteBlockedOpen, setIsDeleteBlockedOpen] = useState(false);
  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState("");
  const [formData, setFormData] = useState<BeneficiaryItem>(emptyForm);

  // --- Carga de Datos ---
  const fetchBeneficiaries = async () => {
    setLoading(true);
    try {
      const response = await beneficiaryService.getAll();
      if (isApiError(response)) {
        throw new Error(response.statusText || "Error al cargar beneficiarios");
      }
      setBeneficiaryData(response);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  // --- Búsqueda ---
  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return beneficiaryData;
    return beneficiaryData.filter(
      (b) =>
        b.nom_ben.toLowerCase().includes(q) ||
        b.rif_ben.toLowerCase().includes(q) ||
        b.dir_ben.toLowerCase().includes(q)
    );
  }, [beneficiaryData, search]);

  // --- Acciones ---
  const openCreateModal = () => {
    setFormData(emptyForm);
    setIsCreateModalOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.rif_ben || !formData.nom_ben || !formData.dir_ben) {
      alert("Por favor, llene todos los campos requeridos.");
      return;
    }
    // Validar formato RIF venezolano (J-12345678-9)
    if (!/^[VJEGPvjegp]-?\d{8}-?\d$/.test(formData.rif_ben.trim())) {
      alert("El formato del RIF no es válido. Ejemplo correcto: J-12345678-9");
      return;
    }
    try {
      const response = await beneficiaryService.create(formData);
      if (isApiError(response)) throw new Error(response.statusText);
      fetchBeneficiaries();
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert("Error al crear beneficiario: " + message);
    }
  };

  const openEditModal = (beneficiary: BeneficiaryItem) => {
    setSelectedBeneficiary(beneficiary);
    setFormData({ ...beneficiary });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (selectedBeneficiary) {
      if (!formData.rif_ben || !formData.nom_ben || !formData.dir_ben) {
        alert("Por favor, llene todos los campos requeridos.");
        return;
      }
      try {
        const { rif_ben, ...data } = formData;
        const response = await beneficiaryService.update(rif_ben, data);
        if (isApiError(response)) throw new Error(response.statusText);
        fetchBeneficiaries();
        setIsEditModalOpen(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        alert("Error al editar beneficiario: " + message);
      }
    }
  };

  const openDeleteModal = (beneficiary: BeneficiaryItem) => {
    setSelectedBeneficiary(beneficiary);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedBeneficiary) {
      try {
        const response = await beneficiaryService.delete(selectedBeneficiary.rif_ben);
        if (isApiError(response)) throw new Error(response.statusText);
        fetchBeneficiaries();
        setIsDeleteModalOpen(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setIsDeleteModalOpen(false);
        setDeleteBlockedMessage("Error al eliminar beneficiario: " + message);
        setIsDeleteBlockedOpen(true);
      }
    }
  };

  const handleFieldChange = <K extends keyof BeneficiaryItem>(key: K, value: BeneficiaryItem[K]) =>
    setFormData((p) => ({ ...p, [key]: value }));

  return {
    beneficiaryData,
    loading,
    error,
    search,
    setSearch,
    filteredData,
    selectedBeneficiary,
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
    handleSaveEdit,
    openDeleteModal,
    handleDelete,
    handleFieldChange,
  };
}
