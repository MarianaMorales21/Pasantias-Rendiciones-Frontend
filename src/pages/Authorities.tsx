import { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import { useAuthorities } from "../hooks/useAuthorities";
import { useRanks } from "../hooks/useRanks";
import { AuthorityItem } from "../types/authorities";
import { RankItem } from "../types/ranks";
import { PencilIcon, CheckCircleIcon, CloseIcon } from "../icons";

// Roles requeridos por el sistema
const REQUIRED_ROLES = [
  "Presidenta de la fundacion",
  "Coordinadora de administracion",
  "DIRECTORA DE ADMINISTRACIÓN Y FINANZAS- GOBERNACION DEL ESTADO TACHIRA"
];

function AuthorityBlock({
  role,
  authority,
  ranks,
  onSave
}: {
  role: string,
  authority?: AuthorityItem,
  ranks: RankItem[],
  onSave: (id: number, data: Partial<AuthorityItem>) => Promise<boolean>
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<AuthorityItem>>({
    pro_aut: 0,
    nom_aut: "",
    ape_aut: "",
    ced_aut: "",
    ran_aut: role,
    dec_aut: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setFormData({
      pro_aut: authority?.pro_aut || 0,
      nom_aut: authority?.nom_aut || "",
      ape_aut: authority?.ape_aut || "",
      ced_aut: authority?.ced_aut || "",
      ran_aut: authority?.ran_aut || role,
      dec_aut: authority?.dec_aut || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!authority) return;
    setIsLoading(true);

    // Aseguramos que los campos obligatorios no se envíen como null o undefined
    const cleanData = {
      ...formData,
      ran_aut: formData.ran_aut || role,
      nom_aut: formData.nom_aut || "",
      ape_aut: formData.ape_aut || "",
      ced_aut: formData.ced_aut || "",
      dec_aut: formData.dec_aut || "",
      pro_aut: formData.pro_aut || 0
    };

    const success = await onSave(authority.cod_aut, cleanData);
    if (success) {
      setIsEditing(false);
    }
    setIsLoading(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white uppercase">
            {role}
          </h3>
          {!authority && (
            <p className="text-sm text-red-500 font-medium mt-1">No hay datos registrados para este cargo.</p>
          )}
        </div>

        {authority && !isEditing && (
          <Button
            size="md"
            variant="primary"
            className="bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl px-6 py-2.5 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40"
            startIcon={<PencilIcon className="size-4" />}
            onClick={handleEdit}
          >
            Editar
          </Button>
        )}

        {isEditing && (
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              startIcon={<CloseIcon className="size-4" />}
              onClick={handleCancel}
              className="text-gray-500"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              startIcon={<CheckCircleIcon className="size-4" />}
              onClick={handleSave}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white border-transparent"
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        )}
      </div>

      {authority ? (
        <div className="animate-fadeIn">
          {isEditing ? (
            <div className="flex flex-col gap-4 w-full">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Profesión</label>
                  <select
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    value={formData.pro_aut}
                    onChange={(e) => setFormData({ ...formData, pro_aut: parseInt(e.target.value) || 0 })}
                  >
                    <option value={0}>Seleccione Profesión</option>
                    {ranks.map(r => <option key={r.cod_ran} value={r.cod_ran}>{r.nom_ran}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Nombres</label>
                  <Input
                    value={formData.nom_aut}
                    onChange={(e) => setFormData({ ...formData, nom_aut: e.target.value })}
                    placeholder="Ej: María"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Apellidos</label>
                  <Input
                    value={formData.ape_aut}
                    onChange={(e) => setFormData({ ...formData, ape_aut: e.target.value })}
                    placeholder="Ej: Pérez"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Cédula</label>
                  <Input
                    value={formData.ced_aut}
                    onChange={(e) => setFormData({ ...formData, ced_aut: e.target.value.replace(/\D/g, "").slice(0, 8) })}
                    placeholder="Ej: 12345678"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Rango / Cargo</label>
                  <Input
                    value={formData.ran_aut}
                    onChange={(e) => setFormData({ ...formData, ran_aut: e.target.value })}
                    placeholder="Ej: Presidenta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Decreto / Resolución</label>
                  <Input
                    value={formData.dec_aut}
                    onChange={(e) => setFormData({ ...formData, dec_aut: e.target.value })}
                    placeholder="Ej: Gaceta Oficial N°..."
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-8 w-full">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Profesión</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {authority.nom_ran || "No especificado"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Nombre Completo</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {authority.nom_aut} {authority.ape_aut}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Cédula</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {authority.ced_aut || "No especificada"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Rango / Cargo</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {authority.ran_aut || "No especificado"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Decreto / Resolución</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {authority.dec_aut || "No especificado"}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-4 flex justify-center text-gray-400 text-sm italic">
          Pendiente por registrar en la base de datos.
        </div>
      )}
    </div>
  );
}

export default function Authorities() {
  const { authorities, isLoading, handleUpdate } = useAuthorities();
  const { ranks, isLoadingRanks } = useRanks();

  // Asignamos las autoridades a sus bloques correspondientes
  const getAuthority = (role: string, index: number) => {
    // Intentar buscar por coincidencia de cargo (ran_aut)
    const exactMatch = authorities.find(a => a.ran_aut?.toLowerCase() === role.toLowerCase());
    if (exactMatch) return exactMatch;

    // Si no hay coincidencia exacta, tomar por orden (asumiendo que la BD tiene 3)
    return authorities[index];
  };

  return (
    <>
      <PageMeta
        title="FUNDES - Autoridades"
        description="Gestión de Autoridades y Firmantes"
      />
      <PageBreadcrumb pageTitle="Gestión de Autoridades" />

      <div className="space-y-6">
        {/*<div className="bg-gradient-to-r from-blue-800 to-indigo-900 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <h2 className="text-2xl font-bold mb-2">Autoridades y Firmantes</h2>
          <p className="text-blue-100 max-w-2xl text-sm leading-relaxed">
            Gestione la información de las autoridades principales de la institución.
            Estos datos serán utilizados en la generación de reportes y actas formales.
          </p>
        </div>*/}

        {((isLoading || isLoadingRanks) && authorities.length === 0) ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-800"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Presidente arriba ocupando todo el ancho */}
            <div className="w-full">
              <AuthorityBlock
                role={REQUIRED_ROLES[0]}
                authority={getAuthority(REQUIRED_ROLES[0], 0)}
                ranks={ranks}
                onSave={handleUpdate}
              />
            </div>
            {/* Coordinadora y Directora en la misma fila (una al lado de la otra) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AuthorityBlock
                role={REQUIRED_ROLES[1]}
                authority={getAuthority(REQUIRED_ROLES[1], 1)}
                ranks={ranks}
                onSave={handleUpdate}
              />
              <AuthorityBlock
                role={REQUIRED_ROLES[2]}
                authority={getAuthority(REQUIRED_ROLES[2], 2)}
                ranks={ranks}
                onSave={handleUpdate}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
