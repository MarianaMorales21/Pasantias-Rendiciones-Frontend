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

  // Estado separado para el prefijo del RIF y el número
  const [rifPrefix, setRifPrefix] = useState<"V" | "G">("V");
  const [rifNum, setRifNum] = useState("");

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
    setRifPrefix("V");
    setRifNum("");
    setIsCreateModalOpen(true);
  };

  const buildRif = () => `${rifPrefix}-${rifNum}`;

  const handleCreate = async () => {
    if (!rifNum || !formData.nom_ben || !formData.dir_ben) {
      alert("Por favor, llene todos los campos requeridos.");
      return;
    }
    const rifCompleto = buildRif();
    // Validaciones según prefijo
    if (rifPrefix === "V") {
      if (!/^\d{7,8}$/.test(rifNum)) {
        alert("La cédula debe tener entre 7 y 8 dígitos numéricos.");
        return;
      }
    } else {
      if (!/^\d+-\d$/.test(rifNum)) {
        alert("Para el tipo G, el número debe tener el último dígito separado por un guion. Ej: 12345678-1");
        return;
      }
    }
    try {
      const response = await beneficiaryService.create({ ...formData, rif_ben: rifCompleto });
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
    // Extraer prefijo y número del RIF existente
    const match = beneficiary.rif_ben.match(/^([VG])-?(.+)$/i);
    if (match) {
      setRifPrefix(match[1].toUpperCase() as "V" | "G");
      setRifNum(match[2]);
    } else {
      setRifPrefix("V");
      setRifNum(beneficiary.rif_ben);
    }
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (selectedBeneficiary) {
      if (!rifNum || !formData.nom_ben || !formData.dir_ben) {
        alert("Por favor, llene todos los campos requeridos.");
        return;
      }
      const rifCompleto = buildRif();
      try {
        const { rif_ben, ...data } = formData;
        const response = await beneficiaryService.update(rifCompleto, data);
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
    rifPrefix,
    setRifPrefix,
    rifNum,
    setRifNum,
  };
}
