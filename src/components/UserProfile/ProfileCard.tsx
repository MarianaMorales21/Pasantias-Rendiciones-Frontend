import React, { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "../../context/AuthContext";
import { EyeIcon, EyeCloseIcon } from "../../icons";
import { userService } from "../../services/userService";
import { isApiError } from "../../helpers/helpHttp";

export default function ProfileCard() {
  const { user, changePassword, verifySession } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isPassOpen, openModal: openPassModal, closeModal: closePassModal } = useModal();

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    cargo: "",
    rol: "",
    cedula: "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nom_usu || "",
        email: user.ema_usu || "",
        cargo: user.rol_nom || "Usuario del Sistema",
        rol: user.rol_nom || "General",
        cedula: user.ced_usu || "",
      });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await userService.update(user.ced_usu, {
        nom_usu: user.nom_usu,
        ema_usu: formData.email,
        sta_usu: user.sta_usu,
        rol_usu: user.rol_usu,
      });
      if (isApiError(res)) {
        throw new Error(res.statusText || "Error al actualizar perfil");
      }
      closeModal();
      await verifySession();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMsg("Las contraseñas nuevas no coinciden");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMsg(message || "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-xl shadow-gray-100 dark:shadow-none overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/50">
          <h3 className="text-base font-black text-gray-800 dark:text-white">Perfil de Usuario</h3>
          <p className="text-xs font-medium text-gray-500 mt-1">Gestión de datos de cuenta y credenciales</p>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-8">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-blue-800 text-white font-black text-5xl border-8 border-blue-50 dark:border-gray-800 shadow-2xl">
              {user.nom_usu?.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 text-center lg:text-left space-y-2">
              <h4 className="text-3xl font-black text-gray-800 dark:text-white/90 tracking-tight">
                {user.nom_usu}
              </h4>
              <div className="flex flex-col items-center gap-2 lg:flex-row lg:gap-4 lg:justify-start">
                <span className="px-4 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-black rounded-full uppercase tracking-widest border border-blue-100/50">
                  {user.rol_nom || "USUARIO"}
                </span>
                <div className="hidden h-4 w-px bg-gray-300 dark:bg-gray-700 lg:block"></div>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                  {user.ema_usu}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 lg:mt-0">
              <Button
                onClick={openPassModal}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl px-5 py-2.5 shadow-lg shadow-amber-500/20 transition-all duration-300 hover:-translate-y-0.5"
              >
                Cambiar Clave
              </Button>
              <Button
                onClick={openModal}
                className="bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl px-5 py-2.5 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5"
              >
                Editar Datos
              </Button>
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-850" />

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Cédula de Identidad
              </p>
              <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                {user.ced_usu}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Nombre de Usuario
              </p>
              <p className="text-lg font-bold text-gray-800 dark:text-white/90 uppercase">
                {user.nom_usu}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Estado de Cuenta
              </p>
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${user.sta_usu === 1 ? "bg-emerald-500" : "bg-red-500"}`}></div>
                <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                  {user.sta_usu === 1 ? "Activo" : "Inactivo"}
                </p>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Correo Institucional
              </p>
              <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                {user.ema_usu}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal}>
        <Modal.Header>Editar Información</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
             <div className="space-y-2">
                <Label>Nombre Completo</Label>
                <Input value={formData.nombre} disabled className="bg-gray-50 opacity-70" />
                <p className="text-[10px] text-gray-400 italic font-medium">* El nombre debe ser modificado por un administrador</p>
             </div>
             <div className="space-y-2">
                <Label>Correo Electrónico</Label>
                <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
             </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={closeModal}>Cerrar</Button>
          <Button className="bg-blue-800 hover:bg-blue-900 text-white font-semibold" onClick={handleProfileUpdate} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal isOpen={isPassOpen} onClose={closePassModal}>
        <Modal.Header>Cambiar Contraseña</Modal.Header>
        <Modal.Body>
          <form id="pass-form" onSubmit={handlePasswordChange} className="space-y-5">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">
                {errorMsg}
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Contraseña Actual</Label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Nueva Contraseña</Label>
              <div className="relative">
                <Input 
                  type={showPass ? "text" : "password"} 
                  placeholder="Mínimo 6 caracteres" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPass ? <EyeIcon className="size-5" /> : <EyeCloseIcon className="size-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Confirmar Nueva Contraseña</Label>
              <Input 
                type="password" 
                placeholder="Repite la nueva contraseña" 
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                required
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" type="button" onClick={closePassModal}>Cancelar</Button>
          <Button 
            type="button" 
            onClick={() => handlePasswordChange()}
            className="bg-amber-500 hover:bg-amber-600 font-semibold"
            disabled={loading}
          >
            {loading ? "Procesando..." : "Actualizar Clave"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
