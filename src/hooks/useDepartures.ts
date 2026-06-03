import { useState, useMemo, useEffect } from "react";
import { departureService } from "../services/departureService";
import { departureItem } from "../types/departure";
import { isApiError } from "../helpers/helpHttp";

const emptyForm: departureItem = {
  cod_par: 0,
  num_par: "",
  nom_par: "",
};

export const useDepartures = () => {
  // --- Estados ---
  const [departures, setDepartures] = useState<departureItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldErrors = () => setFieldErrors({});

  const [search, setSearch] = useState("");
  const [selectedDeparture, setSelectedDeparture] = useState<departureItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteBlockedOpen, setIsDeleteBlockedOpen] = useState(false);
  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState("");
  const [formData, setFormData] = useState<departureItem>(emptyForm);

  // --- Carga de Datos ---
  const fetchDepartures = async () => {
    setIsLoading(true);
    try {
      const response = await departureService.getAll();
      if (isApiError(response)) {
        throw new Error(response.statusText || "Error al cargar partidas");
      }
      setDepartures(response || []);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartures();
  }, []);

  // --- Búsqueda ---
  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return departures;
    return departures.filter(
      (d) =>
        d.nom_par.toLowerCase().includes(q) ||
        d.num_par.toLowerCase().includes(q) ||
        d.cod_par.toString().includes(q)
    );
  }, [departures, search]);

  // --- Acciones ---
  const openCreateModal = () => {
    clearFieldErrors();
    setFormData(emptyForm);
    setIsCreateModalOpen(true);
  };

  const handleCreate = async () => {
    const errors: Record<string, string> = {};
    if (!formData.num_par) {
      errors.num_par = "El número de partida es requerido";
    }
    if (!formData.nom_par) {
      errors.nom_par = "El nombre de partida es requerido";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return null;
    }

    setIsLoading(true);
    try {
      const { cod_par, ...body } = formData;
      void cod_par;
      const response = await departureService.create(body);
      if (isApiError(response)) throw new Error(response.statusText || "Error desconocido");
      await fetchDepartures();
      clearFieldErrors();
      setIsCreateModalOpen(false);
      return response;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert("Error al crear partida: " + message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (departure: departureItem) => {
    clearFieldErrors();
    setSelectedDeparture(departure);
    setFormData({ ...departure });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (selectedDeparture) {
      const errors: Record<string, string> = {};
      if (!formData.num_par) {
        errors.num_par = "El número de partida es requerido";
      }
      if (!formData.nom_par) {
        errors.nom_par = "El nombre de partida es requerido";
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return false;
      }

      setIsLoading(true);
      try {
        const { cod_par, ...body } = formData;
        const response = await departureService.update(cod_par, body);
        if (isApiError(response)) throw new Error(response.statusText || "Error desconocido");
        await fetchDepartures();
        clearFieldErrors();
        setIsEditModalOpen(false);
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        alert("Error al editar partida: " + message);
        return false;
      } finally {
        setIsLoading(false);
      }
    }
    return false;
  };

  const openDeleteModal = (departure: departureItem) => {
    setSelectedDeparture(departure);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedDeparture) {
      setIsLoading(true);
      try {
        const response = await departureService.delete(selectedDeparture.cod_par);
        if (isApiError(response)) throw new Error(response.statusText || "Error desconocido");
        await fetchDepartures();
        setIsDeleteModalOpen(false);
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setIsDeleteModalOpen(false);
        setDeleteBlockedMessage(message);
        setIsDeleteBlockedOpen(true);
        return false;
      } finally {
        setIsLoading(false);
      }
    }
    return false;
  };

  const handleFieldChange = <K extends keyof departureItem>(key: K, value: departureItem[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  return {
    departures,
    isLoading,
    error,
    fieldErrors,
    clearFieldErrors,
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
    fetchDepartures,
  };
};
