import { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function ProfileCard() {
  const { isOpen, openModal, closeModal } = useModal();

  const [formData, setFormData] = useState({
    nombre: "Administrador",
    apellido: "de Rendiciones",
    email: "admin@fundes.org",
    telefono: "+58 212 555 1234",
    cargo: "Coordinador de Finanzas - FUNDES",
    ubicacion: "Estado Tachira"
  });

  const [displayData, setDisplayData] = useState({ ...formData });

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setDisplayData({ ...formData });
    console.log("Saving changes...", formData);
    closeModal();
  };

  return (
    <>
      <div className="p-6 border border-gray-200 rounded-3xl bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
        {/* Header Section: Profile Image + Main Title */}
        <div className="flex flex-col items-center gap-6 mb-8 lg:flex-row lg:items-center">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 font-bold text-4xl border-4 border-white dark:border-gray-800 shadow-xl">
            {displayData.nombre.charAt(0)}
          </div>

          <div className="flex-1 text-center lg:text-left">
            <h4 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white/90">
              {displayData.nombre} {displayData.apellido}
            </h4>
            <div className="flex flex-col items-center gap-1 lg:flex-row lg:gap-3 lg:justify-start">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {displayData.cargo}
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 lg:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {displayData.ubicacion}
              </p>
            </div>
          </div>

          <div className="mt-4 lg:mt-0">
            <button
              onClick={openModal}
              className="flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl px-6 py-3 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
            >
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                  fill="currentColor"
                />
              </svg>
              Editar Perfil
            </button>
          </div>
        </div>

        <hr className="my-8 border-gray-100 dark:border-gray-800" />

        {/* Details Section */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Nombre Completo
            </p>
            <p className="text-base font-medium text-gray-800 dark:text-white/90">
              {displayData.nombre} {displayData.apellido}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Correo Electrónico
            </p>
            <p className="text-base font-medium text-gray-800 dark:text-white/90">
              {displayData.email}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Teléfono de Contacto
            </p>
            <p className="text-base font-medium text-gray-800 dark:text-white/90">
              {displayData.telefono}
            </p>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Cargo / Biografía
            </p>
            <p className="text-base font-medium text-gray-800 dark:text-white/90">
              {displayData.cargo}
            </p>
          </div>
        </div>
      </div>

      {/* Single Consolidated Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[750px] m-4">
        <div className="no-scrollbar relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-11 shadow-2xl">
          <div className="mb-8 text-center lg:text-left">
            <h4 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white/90">
              Configuración de Perfil
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gestiona tu información personal y profesional desde un solo lugar.
            </p>
          </div>

          <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input type="text" value={formData.nombre} onChange={(e) => handleFieldChange("nombre", e.target.value)} placeholder="Ej: Juan" />
              </div>

              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input type="text" value={formData.apellido} onChange={(e) => handleFieldChange("apellido", e.target.value)} placeholder="Ej: Pérez" />
              </div>

              <div className="space-y-2">
                <Label>Correo Electrónico</Label>
                <Input type="email" value={formData.email} onChange={(e) => handleFieldChange("email", e.target.value)} placeholder="correo@ejemplo.com" />
              </div>

              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input type="text" value={formData.telefono} onChange={(e) => handleFieldChange("telefono", e.target.value)} placeholder="+58 000 000 0000" />
              </div>

              <div className="lg:col-span-2 space-y-2">
                <Label>Ubicación</Label>
                <Input type="text" value={formData.ubicacion} onChange={(e) => handleFieldChange("ubicacion", e.target.value)} placeholder="Ciudad, País" />
              </div>

              <div className="lg:col-span-2 space-y-2">
                <Label>Cargo / Bio</Label>
                <Input type="text" value={formData.cargo} onChange={(e) => handleFieldChange("cargo", e.target.value)} placeholder="Describe tu rol en la institución" />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-10 justify-center lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} className="rounded-xl px-6">
                Cancelar
              </Button>
              <Button size="sm" type="submit" className="bg-blue-800 hover:bg-blue-900 text-white rounded-xl px-10 shadow-lg transition-all hover:-translate-y-1">
                Guardar Cambios
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
