

import { useState, useMemo, useEffect } from "react";
import { programsService } from "../services/programsService";
import { ProgramsItem } from "../types/programs";
import { isApiError } from "../helpers/helpHttp";

const emptyForm: ProgramsItem = {
  cod_pro: 0,
  nom_pro: "",
  sta_pro: 1,
};

export function usePrograms() {
  // --- Estados ---
  const [data, setData] = useState<ProgramsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<ProgramsItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteBlockedOpen, setIsDeleteBlockedOpen] = useState(false);
  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState("");
  const [formData, setFormData] = useState<ProgramsItem>(emptyForm);

  // --- Carga de Datos ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await programsService.getAll();
      if (isApiError(response)) {
        throw new Error(response.statusText || "Error al cargar programas");
      }
      setData(response);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Búsqueda ---
  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return data;
    return data.filter(
      (p) =>
        p.nom_pro.toLowerCase().includes(q) ||
        p.cod_pro.toString().includes(q)
    );
  }, [data, search]);

  // --- Acciones ---
  const openCreateModal = () => {
    setFormData(emptyForm);
    setIsCreateModalOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.nom_pro) {
      alert("Por favor, llene todos los campos requeridos.");
      return null;
    }
    setIsLoading(true);
    try {
      const { cod_pro, ...body } = formData;
      void cod_pro;
      const response = await programsService.create(body);
      if (isApiError(response)) throw new Error(response.statusText || "Error desconocido");
      await fetchData();
      setIsCreateModalOpen(false);
      return response;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert("Error al crear programa: " + message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (program: ProgramsItem) => {
    setSelectedProgram(program);
    setFormData({ ...program });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (selectedProgram) {
      if (!formData.nom_pro) {
        alert("Por favor, llene todos los campos requeridos.");
        return false;
      }
      setIsLoading(true);
      try {
        const { cod_pro, ...body } = formData;
        const response = await programsService.update(cod_pro, body);
        if (isApiError(response)) throw new Error(response.statusText || "Error desconocido");
        await fetchData();
        setIsEditModalOpen(false);
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        alert("Error al editar programa: " + message);
        return false;
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openDeleteModal = (program: ProgramsItem) => {
    setSelectedProgram(program);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedProgram) {
      setIsLoading(true);
      try {
        const response = await programsService.delete(selectedProgram.cod_pro);
        if (isApiError(response)) throw new Error(response.statusText || "Error desconocido");
        await fetchData();
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
  };

  const handleFieldChange = <K extends keyof ProgramsItem>(key: K, value: ProgramsItem[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  return {
    data,
    isLoading,
    error,
    search,
    setSearch,
    filteredData,
    selectedProgram,
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
  };
}
