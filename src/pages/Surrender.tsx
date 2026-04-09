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
  PencilIcon,
  TrashBinIcon,
} from "../icons";

// ─── Tipos e Interfaces ──────────────────────────────────────────────────────
interface SurrenderItem {
  id: number;
  cod_rnd: string;
  ndb_drn: string;
  fec_drn: string;
  par_drn: string;
  tpg_drn: string;
  ntp_dnr: string;
  rif_ben: string;
  con_drn: string;
  mon_drn: string;
  cod_pro: string;
  sta_drn: "Active" | "Pending" | "Cancel";
}

type SurrenderFormData = Omit<SurrenderItem, "id">;

interface SurrenderFormProps {
  formData: SurrenderFormData;
  onChange: (key: keyof SurrenderFormData, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

const emptyForm: SurrenderFormData = {
  cod_rnd: "",
  ndb_drn: "",
  fec_drn: new Date().toISOString().split("T")[0],
  par_drn: "",
  tpg_drn: "1",
  ntp_dnr: "",
  rif_ben: "",
  con_drn: "",
  mon_drn: "",
  cod_pro: "1",
  sta_drn: "Active",
};

// ─── Lista de Beneficiarios (Simulada para el Select) ────────────────────────
const beneficiaries = [
  { rif: "V-12.345.678",  nombre: "María González" },
  { rif: "V-9.876.543",   nombre: "José Ramírez" },
  { rif: "V-15.432.100",  nombre: "Ana Pérez" },
  { rif: "V-7.654.321",   nombre: "Carlos López" },
  { rif: "V-14.259.273-4", nombre: "Juegos de Mesa" },
  { rif: "V-11.498.709-0", nombre: "Prendas de Vestir" },
];

// ─── Componente Formulario Lateral ───────────────────────────────────────────
function SurrenderForm({ formData, onChange, onSubmit, onCancel, isEditing }: SurrenderFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div>
          <Label htmlFor="s-cod-rnd">Cod. Rendición</Label>
          <Input
            id="s-cod-rnd"
            placeholder="Ej: 1"
            value={formData.cod_rnd}
            onChange={(e) => onChange("cod_rnd", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="s-ndb">Nro. Documento</Label>
          <Input
            id="s-ndb"
            placeholder="Ej: ND 25156"
            value={formData.ndb_drn}
            onChange={(e) => onChange("ndb_drn", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div>
          <Label htmlFor="s-fec">Fecha</Label>
          <Input
            id="s-fec"
            type="date"
            value={formData.fec_drn}
            onChange={(e) => onChange("fec_drn", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="s-ntp">Referencia Banco</Label>
          <Input
            id="s-ntp"
            placeholder="Ej: 32539606"
            value={formData.ntp_dnr}
            onChange={(e) => onChange("ntp_dnr", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="s-rif">Beneficiario (RIF)</Label>
        <select
          id="s-rif"
          value={formData.rif_ben}
          onChange={(e) => onChange("rif_ben", e.target.value)}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="" disabled>Seleccione un beneficiario</option>
          {beneficiaries.map((b) => (
            <option key={b.rif} value={b.rif}>
              {b.rif} - {b.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="s-par">Partida Presupuestaria</Label>
        <Input
          id="s-par"
          placeholder="Ej: 13.01.51.4.03.18.01"
          value={formData.par_drn}
          onChange={(e) => onChange("par_drn", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="s-con">Concepto de Gasto</Label>
        <textarea
          id="s-con"
          rows={3}
          className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          placeholder="Detalle del gasto..."
          value={formData.con_drn}
          onChange={(e) => onChange("con_drn", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div>
          <Label htmlFor="s-mon">Monto (Bs.)</Label>
          <Input
            id="s-mon"
            placeholder="Ej: 93510.00"
            value={formData.mon_drn}
            onChange={(e) => onChange("mon_drn", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="s-pro">Programa</Label>
          <select
            id="s-pro"
            value={formData.cod_pro}
            onChange={(e) => onChange("cod_pro", e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="1">Programa 01</option>
            <option value="2">Programa 02</option>
            <option value="3">Programa 03</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          className="flex-1 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl py-3 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40" 
          onClick={onSubmit}
        >
          {isEditing ? "Guardar Cambios" : "Ingresar Rendición"}
        </Button>
        {isEditing && (
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────
export default function Surrender() {
  const [data, setData] = useState<SurrenderItem[]>([
    {
      id: 1,
      cod_rnd: "1",
      ndb_drn: "ND 25156",
      fec_drn: "2025-12-30",
      par_drn: "13.01.51.4.03.18.01",
      tpg_drn: "1",
      ntp_dnr: "32539606",
      rif_ben: "V-14259273-4",
      con_drn: "COMPRA DE JUEGOS DE MESA, PRODUCTOS DE ASEO Y LIMPIEZA.",
      mon_drn: "93510.00",
      cod_pro: "1",
      sta_drn: "Active",
    },
    {
      id: 2,
      cod_rnd: "1",
      ndb_drn: "ND 25159",
      fec_drn: "2025-12-30",
      par_drn: "13.01.51.4.03.18.01",
      tpg_drn: "1",
      ntp_dnr: "65795772",
      rif_ben: "V-11498709-0",
      con_drn: "COMPRA DE PRENDAS DE VESTIR, TONER, UTILES DE OFICINA, MEDICINAS.",
      mon_drn: "175700.00",
      cod_pro: "1",
      sta_drn: "Active",
    },
  ]);

  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState<SurrenderFormData>(emptyForm);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SurrenderItem | null>(null);

  const isEditing = selectedId !== null;

  // --- Búsqueda ---
  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return data;
    return data.filter(
      (item) =>
        item.ndb_drn.toLowerCase().includes(q) ||
        item.rif_ben.toLowerCase().includes(q) ||
        item.con_drn.toLowerCase().includes(q)
    );
  }, [data, search]);

  // --- Handlers ---
  const handleFieldChange = (key: keyof SurrenderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (isEditing) {
      setData((prev) =>
        prev.map((item) => (item.id === selectedId ? { ...item, ...formData } : item))
      );
      setSelectedId(null);
    } else {
      const newItem: SurrenderItem = {
        id: Date.now(),
        ...formData,
      };
      setData((prev) => [newItem, ...prev]);
    }
    setFormData(emptyForm);
  };

  const handleEdit = (item: SurrenderItem) => {
    setSelectedId(item.id);
    const { ...rest } = item;
    setFormData(rest);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setSelectedId(null);
    setFormData(emptyForm);
  };

  const openDeleteModal = (item: SurrenderItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setData((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      if (selectedId === itemToDelete.id) handleCancel();
    }
  };

  // --- Columnas ---
  const columns = [
    {
      header: "Documento",
      key: "ndb_drn",
      render: (item: SurrenderItem) => (
        <div>
          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
            {item.ndb_drn}
          </span>
          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
            {item.rif_ben}
          </span>
        </div>
      ),
    },
    {
      header: "Concepto",
      key: "con_drn",
      render: (item: SurrenderItem) => (
        <span className="line-clamp-2 max-w-[300px] text-gray-600 dark:text-gray-400 text-theme-sm">
          {item.con_drn}
        </span>
      ),
    },
    {
      header: "Monto",
      key: "mon_drn",
      render: (item: SurrenderItem) => (
        <span className="font-semibold text-gray-800 dark:text-white/90">
          Bs. {Number(item.mon_drn).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Estado",
      key: "sta_drn",
      render: (item: SurrenderItem) => (
        <Badge
          size="sm"
          color={
            item.sta_drn === "Active" ? "success" : item.sta_drn === "Pending" ? "warning" : "error"
          }
        >
          {item.sta_drn === "Active" ? "Cargado" : "Anulado"}
        </Badge>
      ),
    },
    {
      header: "Acciones",
      key: "actions",
      render: (item: SurrenderItem) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleEdit(item)}
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
        title="FUNDES - Rendiciones | Gestión de Rendiciones"
        description="Gestión integral de rendiciones de gastos"
      />

      <PageBreadcrumb pageTitle="Control de Rendiciones" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* COLUMNA IZQUIERDA: Formulario */}
        <div className="lg:col-span-4">
          <ComponentCard title={isEditing ? "Editar Rendición" : "Nueva Rendición"}>
            <SurrenderForm
              formData={formData}
              onChange={handleFieldChange}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isEditing={isEditing}
            />
          </ComponentCard>
        </div>

        {/* COLUMNA DERECHA: Tabla */}
        <div className="lg:col-span-8">
          <ComponentCard title="Historial de Rendiciones">
            {/* Buscador Superior */}
            <div className="relative mb-6 w-full lg:max-w-[400px]">
              <Input
                placeholder="Buscar por documento, RIF o concepto..."
                type="text"
                className="pl-[62px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-2 text-gray-500 dark:border-gray-800">
                <MagnifyingGlassIcon className="size-5" />
              </span>
            </div>

            {filteredData.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No se encontraron rendiciones registradas.
                </p>
              </div>
            ) : (
              <DataTable columns={columns} data={filteredData} />
            )}
          </ComponentCard>
        </div>
      </div>

      {/* MODAL ELIMINAR */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <Modal.Header>Confirmar Eliminación</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20">
              <TrashBinIcon className="size-7" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              ¿Eliminar la rendición &quot;{itemToDelete?.ndb_drn}&quot;?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Esta acción no se puede deshacer y borrará los registros financieros asociados.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            No, mantener
          </Button>
          <button
            onClick={confirmDelete}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Sí, eliminar
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
