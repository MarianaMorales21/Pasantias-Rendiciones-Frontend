import { useState } from "react";
import { Link, Navigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-8 sm:p-12">
        {/* Header with Title and Signup Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Inicio de Sesion 
          </h1>
          <Link
            to="/signup"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Registrarse
          </Link>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <Label className="mb-2.5 block font-medium text-gray-700 dark:text-gray-300">
                Cedula
              </Label>
              <Input 
                type="text"
                placeholder="12.345.678" 
                className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20"
              />
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
                  className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20"
                />
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
              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Mantenme iniciar sesión
                </span>
              </div>
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
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]" 
                size="md"
                onClick={() => Navigate("/")}
              >
                Ingresar
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

