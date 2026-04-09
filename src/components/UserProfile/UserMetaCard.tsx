import { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  
  const [formData, setFormData] = useState({
    nombre: "Administrador",
    apellido: "de Rendiciones",
    email: "admin@fundes.org",
    telefono: "+58 212 555 1234",
    cargo: "Coordinador de Finanzas - FUNDES"
  });

  const [displayData, setDisplayData] = useState({...formData});

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setDisplayData({...formData});
    console.log("Saving changes...", formData);
    closeModal();
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl bg-white dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            {/* Imagen de Perfil como Círculo de Iniciales (Estilo Tablas) */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 font-bold text-3xl border-4 border-white dark:border-gray-800 shadow-lg">
              A
            </div>
            
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-xl font-bold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {displayData.nombre} {displayData.apellido}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {displayData.cargo}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Caracas, Venezuela
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center xl:justify-end grow order-2 xl:order-3">
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
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14 text-center lg:text-left">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Editar Información Personal
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Actualiza tus datos para mantener tu perfil al día.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 lg:col-span-1">
                <Label>Nombre</Label>
                <Input type="text" value={formData.nombre} onChange={(e) => handleFieldChange("nombre", e.target.value)} />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Apellido</Label>
                <Input type="text" value={formData.apellido} onChange={(e) => handleFieldChange("apellido", e.target.value)} />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Correo Electrónico</Label>
                <Input type="text" value={formData.email} onChange={(e) => handleFieldChange("email", e.target.value)} />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Teléfono</Label>
                <Input type="text" value={formData.telefono} onChange={(e) => handleFieldChange("telefono", e.target.value)} />
              </div>

              <div className="col-span-2">
                <Label>Cargo / Bio</Label>
                <Input type="text" value={formData.cargo} onChange={(e) => handleFieldChange("cargo", e.target.value)} />
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-8 justify-center lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} className="rounded-xl">
                Cerrar
              </Button>
              <Button size="sm" type="submit" className="bg-blue-800 hover:bg-blue-900 text-white rounded-xl px-8 shadow-md transition-all hover:-translate-y-0.5">
                Guardar Cambios
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
