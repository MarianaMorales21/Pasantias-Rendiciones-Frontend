import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal/index";
import { useAuth } from "../../context/AuthContext";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [suspendedModalOpen, setSuspendedModalOpen] = useState(false);
  const [suspendedMessage, setSuspendedMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!cedula.trim()) errors.cedula = "Este campo no puede faltar.";
    if (!password.trim()) errors.password = "Este campo no puede faltar.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      await login(cedula, password);
      navigate("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      // Si el backend indica que es un usuario suspendido, mostrar modal
      if (message.toLowerCase().includes("suspendido")) {
        setSuspendedMessage(message);
        setSuspendedModalOpen(true);
      } else {
        setErrorMsg(message || "Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-8 sm:p-12">
        {/* Header with Title and Signup Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Inicio de Sesion
          </h1>
        </div>

        <form onSubmit={handleLogin}>
          <div className="space-y-6">
            {/* Error Message */}
            {errorMsg && (
              <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 text-sm text-red-600 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            {/* Cedula Field */}
            <div>
              <Label className="mb-2.5 block font-medium text-gray-700 dark:text-gray-300">
                Cedula
              </Label>
              <Input
                type="text"
                placeholder="12345678"
                value={cedula}
                onChange={(e) => {
                  setCedula(e.target.value.slice(0, 8).replace(/\D/g, ""));
                  setFieldErrors((prev) => ({ ...prev, cedula: "" }));
                }}
                className={`w-full bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 ${fieldErrors.cedula ? "border-red-500" : ""}`}
              />
              {fieldErrors.cedula && (
                <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.cedula}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <Label className="mb-2.5 block font-medium text-gray-700 dark:text-gray-300">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: "" })); }}
                  className={`w-full bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 ${fieldErrors.password ? "border-red-500" : ""}`}
                />
                {fieldErrors.password && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.password}</p>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeIcon className="size-5" />
                  ) : (
                    <EyeCloseIcon className="size-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Actions: Remember me & Forgot Password */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Olvido de contraseña
              </Link>
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                size="md"
                disabled={loading}
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal de usuario suspendido */}
      <Modal isOpen={suspendedModalOpen} onClose={() => setSuspendedModalOpen(false)}>
        <Modal.Header>Acceso Denegado</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Usuario Suspendido
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {suspendedMessage}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors w-full"
            onClick={() => setSuspendedModalOpen(false)}
          >
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
