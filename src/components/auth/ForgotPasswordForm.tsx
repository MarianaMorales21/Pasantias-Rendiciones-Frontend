import { useState } from "react";
import { Link } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";

export default function ForgotPasswordForm() {
  const [cedula, setCedula] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { forgotPasswordByCedula } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setFieldErrors({});

    if (!cedula.trim()) {
      setFieldErrors({ cedula: "Este campo no puede faltar." });
      setLoading(false);
      return;
    }

    try {
      const res = await forgotPasswordByCedula(`V-${cedula.trim()}`);
      setSuccessMsg(res.message);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMsg(message || "Error al recuperar contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-8 sm:p-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">

          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {errorMsg && (
              <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 text-sm text-red-600 dark:text-red-400">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 p-3 text-sm text-green-600 dark:text-green-400">
                {successMsg}
              </div>
            )}

            <div>
              <Label className="mb-2.5 block font-medium text-gray-700 dark:text-gray-300">
                Cédula
              </Label>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-3 h-11 rounded-lg border border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  V-
                </span>
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="12345678"
                    value={cedula}
                    onChange={(e) => { setCedula(e.target.value.replace(/\D/g, "").slice(0, 8)); setFieldErrors((prev) => ({ ...prev, cedula: "" })); }}
                    className={`w-full bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 ${fieldErrors.cedula ? "border-red-500" : ""}`}
                  />
                </div>
              </div>
              {fieldErrors.cedula && (
                <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.cedula}</p>
              )}
              <p className="mt-1.5 text-xs text-gray-400">
                Ingrese su cédula para recibir una nueva contraseña en su correo electrónico.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                size="md"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar Nueva Contraseña"}
              </Button>
            </div>

            <div className="text-center">
              <Link
                to="/signin"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}